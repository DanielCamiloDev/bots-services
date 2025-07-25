import { Injectable, ConflictException, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bot } from './bots.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { BotAuditAction, BotAuditLog } from './bot-audit.entity';
import {UserContextDto} from './dto/user-context.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BotsService {
  constructor(
    @InjectRepository(Bot)
    private readonly repo: Repository<Bot>,
    @InjectRepository(BotAuditLog) private readonly auditRepo: Repository<BotAuditLog>,
  ) {}

  findAll() {
    return this.repo.find();
  }
  findOne(id: string) {
    return this.repo.findOneOrFail({ where: { id } });
  }
  /**
   * Devuelve todos los bots de una segmentación dada.
   * @param segmentation UUID de la segmentación
   */
  async findAllSegmentation(segmentation: string): Promise<Bot[]> {
    const bots = await this.repo.find({ where: { segmentation } });
    if (bots.length === 0) {
      throw new NotFoundException(
        `No se encontraron bots para la segmentación ${segmentation}`,
      );
    }
    return bots;
  }
  async create(dto: CreateBotDto, user:string, image?: any) {
    // 1. Verificar existencia por nombre
    const exists = await this.repo.findOne({ where: { name: dto.name, segmentation: dto.segmentation } });
    if (exists) {
      throw new ConflictException(`El nombre "${dto.name}" ya existe para la segmentación "${dto.segmentation}".`);
    }

    // Guardar imagen si existe
    let avatarUrl: string | undefined = undefined;
    if (image) {
      const uploadDir = path.join(__dirname, '../../uploads/bots');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}_${image.originalname}`;
      avatarUrl = path.join('uploads/bots', fileName);
      fs.writeFileSync(path.join(uploadDir, fileName), image.buffer);
    }

    // Convertir closingKeywords a string si es array
    const closingKeywords = Array.isArray(dto.closingKeywords)
      ? dto.closingKeywords.join(',')
      : dto.closingKeywords;

    // 3. Si no existe, crear y guardar
    const bot = this.repo.create({
      ...dto,
      closingKeywords,
      avatarUrl, // Guardar la ruta en el campo correcto
    });
    const savedBot = await this.repo.save(bot);

    await this.auditRepo.save({
      bot: savedBot,
      bot_id: savedBot.id,
      user: user,
      action: BotAuditAction.CREATE,
      details: { ...dto },
    });

    return savedBot;
  }

  async update(id: string, dto: UpdateBotDto, user:string) {
    await this.repo.update(id, dto).then(() => this.findOne(id));
    const bot = await this.findOne(id);
    await this.auditRepo.save({
      bot,
      bot_id: bot.id,
      user: user,
      action: BotAuditAction.UPDATE,
      details: { ...dto },
    });
    return bot;
  }
  async remove(id: string, user:string) {
    const bot = await this.findOne(id);
    await this.repo.delete(id);
    await this.auditRepo.save({
      bot,
      bot_id: bot.id,
      user: user,
      action: BotAuditAction.REMOVE,
      details: { info: "bot removed" }, // o details: null
    });
    return bot;
  }
}

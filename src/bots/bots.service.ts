import { Injectable, ConflictException, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bot } from './bots.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { SegmentationDto } from './dto/segmentation.dto';

import { BotAuditAction, BotAuditLog } from './bot-audit.entity';
import {UserContextDto} from './dto/user-context.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

@Injectable()
export class BotsService {
  private readonly logger = new Logger(BotsService.name);

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
   * @param segmentation id de la segmentación
   */
  async findAllSegmentation(segmentation: number): Promise<Bot[]> {
    const bots = await this.repo
      .createQueryBuilder('bot')
      .where("JSON_EXTRACT(bot.segmentation, '$.group') = :group", {
        group: segmentation,
      })
      .getMany();

    if (bots.length === 0) {
      throw new NotFoundException(
        `No existe ningún bot en el grupo ${segmentation}`,
      );
    }
    return bots;
  }



  async create(dto: CreateBotDto, user:string, rrhh:number, image?: any) {
    this.logger.log('Creando un bot...'); // nivel info

    // 1. Verificar existencia por nombre
    const exists = await this.repo
    .createQueryBuilder('bot')
    .where('bot.name = :name', { name: dto.name })
    .andWhere("JSON_EXTRACT(bot.segmentation, '$.group') = :group", {
      group: dto.segmentation.group,
    })
    .getOne();
    if (exists) {
      throw new ConflictException(`El nombre "${dto.name}" ya existe para la segmentación "${dto.segmentation}".`);
    }

    // Guardar imagen si existe
    let avatarUrl: string | undefined = undefined;
    if (image) {
      this.logger.log('Se recibio imagen'); // nivel info
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
      segmentation: dto.segmentation, // ← sin serializar
    });
    const savedBot = await this.repo.save(bot);

    await this.auditRepo.save({
      bot: savedBot,
      bot_id: savedBot.id,
      user: JSON.stringify({user, rrhh}),
      action: BotAuditAction.CREATE,
      details: { ...dto },
    });

    return savedBot;
  }

  async update(id: string, dto: UpdateBotDto, user:string, rrhh:number) {
    const updatePayload: any = { ...dto };
    if (dto.segmentation) {
      updatePayload.segmentation = dto.segmentation; // ← sin serializar
    }
    await this.repo.update(id, updatePayload);
    const bot = await this.findOne(id);
    await this.auditRepo.save({
      bot,
      bot_id: bot.id,
      user: JSON.stringify({user, rrhh}),
      action: BotAuditAction.UPDATE,
      details: { ...dto },
    });
    return bot;
  }
  async remove(id: string, user:string, rrhh:number) {
    const bot = await this.findOne(id);
    await this.auditRepo.save({
      bot,
      bot_id: bot.id,
      user: JSON.stringify({user, rrhh}),
      action: BotAuditAction.REMOVE,
      details: { info: "bot removed" }, // o details: null
    });
    await this.repo.delete(id);

    return`bot con id ${id} eliminado`;
  }
}

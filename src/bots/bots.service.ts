import { Injectable, ConflictException, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bot } from './bots.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { AuthService } from 'src/auth/auth.service';
import { BotAuditAction, BotAuditLog } from './bot-audit.entity';
import {UserContextDto} from './dto/user-context.dto';

@Injectable()
export class BotsService {
  constructor(
    @InjectRepository(Bot)
    private readonly repo: Repository<Bot>,
    @InjectRepository(BotAuditLog) private readonly auditRepo: Repository<BotAuditLog>,
    private readonly authService: AuthService, 
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
  async create(dto: CreateBotDto, user: UserContextDto ) {
    // 1. Verificar existencia por nombre
    const exists = await this.repo.findOne({ where: { name: dto.name, segmentation: dto.segmentation } });
    if (exists) {
      // 2. Si ya existe, lanzar error 409 Conflict
      throw new ConflictException(`El nombre "${dto.name}" ya existe para la segmentación "${dto.segmentation}".`);
    }
    // 3. Si no existe, crear y guardar
    const bot = this.repo.create(dto);
    // 2. Guardar el bot en la base de datos y obtener el ID
    const savedBot = await this.repo.save(bot);

    // 3. Guardar el registro de auditoría
    await this.auditRepo.save({
      bot: savedBot,
      bot_id: savedBot.id,
      user: user.name, // el usuario que hizo la acción
      action: BotAuditAction.CREATE,
      details: { ...dto },
    });

    return savedBot;
  }

  async update(id: string, dto: CreateBotDto, user: UserContextDto) {
    await this.repo.update(id, dto).then(() => this.findOne(id));
    const bot = await this.findOne(id);
    await this.auditRepo.save({
      bot,
      bot_id: bot.id,
      user: user.name,
      action: BotAuditAction.UPDATE,
      details: { ...dto },
    });
    return bot;
  }
  async remove(id: string) {
    const bot = await this.findOne(id);
    await this.repo.delete(id);
    await this.auditRepo.save({
      bot,
      bot_id: bot.id,
      user: "usa",
      action: BotAuditAction.REMOVE,
      details: { info: "bot removed" }, // o details: null
    });
    return bot;
  }
}

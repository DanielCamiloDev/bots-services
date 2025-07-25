import { Injectable, ConflictException, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

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
  async findOne(id: string) {
    const bot = await this.repo.findOne({ where: { id } });
    if (!bot) {
      throw new NotFoundException(`No existe ningún bot con id=${id}`);
    }
    return bot;

  }
  /**
   * Devuelve todos los bots de una segmentación dada.
   * @param segmentation id de la segmentación
   */
  async findAllSegmentation(segmentation: number): Promise<Bot[]> {
    if (segmentation == null || isNaN(segmentation)) {
      throw new BadRequestException('El parámetro de grupo es inválido o faltante');
    }

    
    try {
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
  } catch (err) {
    // 4️⃣ Capturar errores de JSON_EXTRACT / QueryFailedError
    if (err instanceof QueryFailedError) {
      // Podrías inspeccionar err.driverError.code o message si quieres más detalle
      throw new BadRequestException(
        'Error al procesar la segmentación: asegúrate de que sea un JSON válido.',
      );
    }
    // Re-lanzar otros errores
    throw err;
  }
  }



  async create(
    dto: CreateBotDto,
    user: string,
    rrhh: number,
    image?: any,
  ): Promise<Bot> {
    this.logger.log('Creando un bot...');
  
    // 0️⃣ Parseamos segmentation JSON
    let segmentationObj: SegmentationDto;
    try {
      segmentationObj = JSON.parse(dto.segmentation);
    } catch {
      throw new BadRequestException('segmentation no es JSON válido');
    }
  
    // 1️⃣ Verificar existencia por nombre + grupo
    const exists = await this.repo
      .createQueryBuilder('bot')
      .where('bot.name = :name', { name: dto.name })
      .andWhere("JSON_EXTRACT(bot.segmentation, '$.group') = :group", {
        group: segmentationObj.group,     // <-- usar el objeto parseado
      })
      .getOne();
  
    if (exists) {
      throw new ConflictException(
        `El nombre "${dto.name}" ya existe para la segmentación del grupo "${segmentationObj.group}".`,
      );
    }
  
    // 2️⃣ Guardar imagen si existe
    let avatarUrl: string | undefined;
    if (image) {
      const uploadDir = path.join(__dirname, '../../uploads/bots');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${image.originalname}`;
      avatarUrl = path.join('uploads/bots', fileName);
      fs.writeFileSync(path.join(uploadDir, fileName), image.buffer);
    }
  
    // 3️⃣ Convertir closingKeywords a string
    const closingKeywords = Array.isArray(dto.closingKeywords)
      ? dto.closingKeywords.join(',')
      : dto.closingKeywords;
  
    // 4️⃣ Crear y guardar el bot, pasando segmentationObj en vez de dto.segmentation
    const bot = this.repo.create({
      ...dto,
      segmentation: segmentationObj,  // <-- objeto, no string
      closingKeywords,
      avatarUrl,
    });
    const savedBot = await this.repo.save(bot);
  
    // 5️⃣ Registrar auditoría
    await this.auditRepo.save({
      bot: savedBot,
      bot_id: savedBot.id,
      user: JSON.stringify({ user, rrhh }),
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
    this.logger.log('Creando un bot...');
    this.logger.log(updatePayload);


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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bot } from './bots.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { AuthService } from 'src/auth/auth.service';
import { BotAuditLog } from './bot-audit.entity';
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
  create(dto: CreateBotDto) {
    return this.repo.save(this.repo.create(dto));
  }
  update(id: string, dto: UpdateBotDto) {
    return this.repo.update(id, dto).then(() => this.findOne(id));
  }
  remove(id: string) {
    return this.repo.delete(id);
  }
}

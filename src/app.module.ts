import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotsService } from './bots/bots.service';
import { BotsController } from './bots/bots.controller';
import { Bot } from './bots/bots.entity';
import { BotAuditLog } from './bots/bot-audit.entity';
import 'dotenv/config'
import { AppDataSourceOptions } from './data-source'; // tu configuración de TypeORM
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logguer/winston-config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRoot(AppDataSourceOptions),
    TypeOrmModule.forFeature([Bot, BotAuditLog]),
  ],
  providers: [BotsService],
  controllers: [BotsController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotsService } from './bots/bots.service';
import { BotsController } from './bots/bots.controller';
import { Bot } from './bots/bots.entity';
import { BotAuditLog } from './bots/bot-audit.entity';
import 'dotenv/config'
import { AppDataSourceOptions } from './data-source'; // tu configuración de TypeORM

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSourceOptions),
    TypeOrmModule.forFeature([Bot, BotAuditLog]),
  ],
  providers: [BotsService],
  controllers: [BotsController],
})
export class AppModule {}

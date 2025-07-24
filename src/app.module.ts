import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotsService } from './bots/bots.service';
import { BotsController } from './bots/bots.controller';
import { Bot } from './bots/bots.entity';
import { BotAuditLog } from './bots/bot-audit.entity';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config'
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // o 'postgres', 'sqlite', etc.
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true, // solo para desarrollo
    }),
    TypeOrmModule.forFeature([Bot, BotAuditLog]),
    AuthModule,
  ],
  providers: [BotsService],
  controllers: [BotsController],
})
export class AppModule {}

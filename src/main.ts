import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, UserRole } from './users/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [new winston.transports.Console()],
    }),
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // descarta propiedades extrañas
    forbidNonWhitelisted: true,   // rechaza payloads con props no en el DTO
    transform: true,              // convierte tipos (e.g. strings → numbers)
  }));
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(User);

  // helper para crear si no existe
  async function ensureUser(username: string, password: string, roles: string[]) {
    const exists = await userRepo.findOne({ where: { username } });
    if (!exists) {
      const hash = await bcrypt.hash(password, 10);
      await userRepo.save({
        username,
        passwordHash: hash,
        roles: roles as UserRole[],
      });
      console.log(`Usuario "${username}" creado con roles [${roles.join(',')}]`);
    }
  }

  await ensureUser('admin', 'AdminPass123!', ['admin']);
  await ensureUser('superadmin', 'SuperAdminPass456!', ['admin','editor','viewer']);

  try {
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Failed to start the application', error);
  }
}

bootstrap();

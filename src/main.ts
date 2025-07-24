import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ValidationPipe } from '@nestjs/common';

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
  try {
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Failed to start the application', error);
  }
}

bootstrap();

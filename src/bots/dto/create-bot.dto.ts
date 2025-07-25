// src/bots/dto/create-bot.dto.ts
import {
  IsString,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsJSON,
} from 'class-validator';
import { BotStatus } from '../bots.entity';
import { Transform, Type } from 'class-transformer';
import { SegmentationDto } from './segmentation.dto';

export class CreateBotDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty({ message: 'El campo name es requerido' })
  name: string;

  @IsString()
  @MaxLength(300)
  @IsNotEmpty({ message: 'El campo description es requerido' })
  description?: string;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty({ message: 'El campo language es requerido' })
  language: string;

  
  @IsNotEmpty({ message: 'El campo segmentation es requerido' })
  @IsJSON({ message: 'El campo segmentation debe ser un JSON válido' })
  segmentation: string;

  @IsEnum(BotStatus)
  @IsNotEmpty({ message: 'El campo status es requerido' })
  status?: BotStatus = BotStatus.ACTIVE;

  @IsString()
  @IsNotEmpty({ message: 'El campo initialPrompts es requerido' })
  initialPrompts?: string;

  // Para el avatar, asumimos que manejas subida aparte y guardas la URL/path
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  
  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(0)
  idleTimeout?: number = 0;

  @IsString()
  @IsNotEmpty({ message: 'El campo closingKeywords es requerido' })
  closingKeywords?: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo defaultNotFoundMessage es requerido' })
  defaultNotFoundMessage?: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo defaultOutOfScopeMessage es requerido' })
  defaultOutOfScopeMessage?: string;
}

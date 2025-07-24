import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UserContextDto {
  @IsString()  
  name: string;

  @IsString()
  segmentation: string;

  @IsString()
  @IsEnum(['admin', 'superadmin', 'viewer'], { message: 'rol inválido' })
  rol: 'admin' | 'superadmin' | 'viewer';
}
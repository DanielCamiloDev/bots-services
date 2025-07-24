import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateBotDto } from './create-bot.dto';
import { UserContextDto } from './user-context.dto';

export class CreateBotRequestDto {
  @ValidateNested()
  @Type(() => CreateBotDto)
  data: CreateBotDto;

  @ValidateNested()
  @Type(() => UserContextDto)
  user: UserContextDto;
}
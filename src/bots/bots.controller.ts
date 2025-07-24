import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get()
  findAll() {
    return this.botsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.botsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBotDto) {
    return this.botsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBotDto) {
    return this.botsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.botsService.remove(id);
  }
}

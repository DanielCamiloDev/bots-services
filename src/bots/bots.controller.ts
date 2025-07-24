import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateBotRequestDto } from './dto/create-bot-request.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
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

  /**
   * GET /bots/segment/:segmentationId
   * Devuelve todos los bots de la segmentación indicada.
   */
  @Get('segment/:segmentationId')
  @Roles('admin', 'superadmin')
  async findAllBySegmentation(
    @Param('segmentationId') segmentationId: string) {
    return this.botsService.findAllSegmentation(segmentationId);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: CreateBotRequestDto) {
    return this.botsService.create(body.data, body.user);
  }

  @Put(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: string, @Body() body: CreateBotRequestDto) {
    return this.botsService.update(id, body.data, body.user);
  }

  @Delete(':id')
  @Roles('admin', 'editor')
  remove(@Param('id') id: string) {
    return this.botsService.remove(id);
  }
}

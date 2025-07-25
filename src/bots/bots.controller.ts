import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateBotRequestDto } from './dto/create-bot-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get()
  @Roles('bot-trainer::super-admin')
  findAll() {
    return this.botsService.findAll();
  }

  @Get('solo-bot-trainer')
  @Roles('bot-trainer::super-admin')
  ejemploSoloBotTrainer(@Req() req) {
    return {
      mensaje: '¡Acceso permitido solo para bot-trainer::super-admin!',
      usuario: req.userName,
      roles: req.roles
    };
  }



  /**
   * GET /bots/segment/:segmentationId
   * Devuelve todos los bots de la segmentación indicada.
   */
  @Get('segment/:segmentationId')
  @Roles('bot-trainer::super-admin')
  async findAllBySegmentation(
    @Param('segmentationId') segmentationId: string) {
    return this.botsService.findAllSegmentation(segmentationId);
  }
  @Get(':id')
  @Roles('bot-trainer::admin')
  findOne(@Param('id') id: string) {
    return this.botsService.findOne(id);
  }
  @Post()
  @Roles('bot-trainer::super-admin', 'bot-trainer::admin')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() body: CreateBotDto,
    @UploadedFile() image: any,
    @Req() req
  ) {
    return this.botsService.create(body, req.userName, image);
  }

  @Put(':id')
  @Roles('bot-trainer::super-admin', 'bot-trainer::admin')
  update(@Param('id') id: string, @Body() payload: UpdateBotDto, @Req() req) {
    return this.botsService.update(id, payload, req.userName);
  }

  @Delete(':id')
  @Roles('bot-trainer::super-admin')
  remove(@Param('id') id: string) {
    return this.botsService.remove(id);
  }


}

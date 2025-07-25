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
import { SegmentationDto } from './dto/segmentation.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateBotRequestDto } from './dto/create-bot-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';

// Controlador para gestionar las operaciones relacionadas con los bots
// Aplica los guards de autenticación y roles a todos los endpoints
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bots')
export class BotsController {
  // Inyección del servicio de bots
  constructor(private readonly botsService: BotsService) {}

  // Endpoint para obtener todos los bots (solo para super-admin)
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
      usuario: [req.userName, req.rrhh],
      roles: req.roles
    };
  }



  /**
   * GET /bots/segment/:segmentationId
   * Devuelve todos los bots de la segmentación indicada (solo para super-admin).
   */
  @Get('segment/:segmentationId')
  @Roles('bot-trainer::super-admin')
  async findAllBySegmentation(
    @Param('segmentationId') segmentationId: number) {
    return this.botsService.findAllSegmentation(segmentationId);
  }

  // Endpoint para obtener un bot por su ID (solo para admin)
  @Get(':id')
  @Roles('bot-trainer::admin', 'bot-trainer::super-admin')
  findOne(@Param('id') id: string) {
    return this.botsService.findOne(id);
  }

  // Endpoint para crear un nuevo bot (permite subir imagen, solo para super-admin y admin)
  @Post()
  @Roles('bot-trainer::super-admin', 'bot-trainer::admin')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() body: CreateBotDto,
    @UploadedFile() image: any,
    @Req() req
  ) {
    return this.botsService.create(body, req.userName, req.rrhh, image);
  }

  // Endpoint para actualizar un bot existente (solo para super-admin y admin)
  @Put(':id')
  @Roles('bot-trainer::super-admin', 'bot-trainer::admin')
  update(@Param('id') id: string, @Body() payload: UpdateBotDto, @Req() req) {
    return this.botsService.update(id, payload, req.userName, req.rrhh);
  }

  // Endpoint para eliminar un bot por su ID (solo para super-admin)
  @Delete(':id')
  @Roles('bot-trainer::super-admin')
  remove(@Param('id') id: string,@Req() req) {
    return this.botsService.remove(id, req.userName, req.rrhh);
  }


}

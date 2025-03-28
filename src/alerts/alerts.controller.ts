/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common"
import  { AlertsService } from "./alerts.service"
import  { CreateAlertDto } from "./dto/create-alert.dto"
import  { UpdateAlertDto } from "./dto/update-alert.dto"

@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  findAll() {
    return this.alertsService.findAll()
  }

  @Get("pendientes")
  findPendientes() {
    return this.alertsService.findPendientes()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(id, updateAlertDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.remove(id);
  }

  @Patch(':id/marcar-enviada')
  marcarComoEnviada(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.marcarComoEnviada(id);
  }

  @Get('box/:id')
  findByBox(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findByBox(id);
  }
}


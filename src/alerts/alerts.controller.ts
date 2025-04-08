/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from "@nestjs/common"
import  { AlertsService } from "./alerts.service"
import  { CreateAlertDto } from "./dto/create-alert.dto"
import  { UpdateAlertDto } from "./dto/update-alert.dto"
import { AlertStatus, UpdateAlertStatusDto } from "./dto/update-status.dto";

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

  @Get("by-status")
  findByStatus(@Query("estado") estado: AlertStatus) {
    return this.alertsService.findByStatus(estado)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(id, updateAlertDto)
  }

  @Patch(":id/status")
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateStatusDto: UpdateAlertStatusDto) {
    return this.alertsService.updateStatus(id, updateStatusDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.remove(id);
  }

  @Patch(':id/marcar-enviada')
  marcarComoEnviada(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.marcarComoEnviada(id);
  }

  @Post(':id/enviar-correo')
  enviarCorreo(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.enviarCorreoAlerta(id);
  }

  @Post("enviar-correos-pendientes")
  enviarCorreosPendientes() {
    return this.alertsService.enviarCorreosPendientes()
  }

  @Get('box/:id')
  findByBox(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findByBox(id);
  }
}


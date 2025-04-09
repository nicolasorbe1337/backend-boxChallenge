/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from "@nestjs/common"
import  { AlertsService } from "./alerts.service"
import  { CreateAlertDto } from "./dto/create-alert.dto"
import  { UpdateAlertDto } from "./dto/update-alert.dto"
import { AlertStatus, UpdateAlertStatusDto } from "./dto/update-status.dto";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller("alerts")
@UseGuards(JwtAuthGuard)
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
  @UseGuards(RolesGuard)
  @Roles(1)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(1)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(id, updateAlertDto)
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles(1)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateStatusDto: UpdateAlertStatusDto) {
    return this.alertsService.updateStatus(id, updateStatusDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.remove(id);
  }

  @Patch(':id/marcar-enviada')
  @UseGuards(RolesGuard)
  @Roles(1)
  marcarComoEnviada(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.marcarComoEnviada(id);
  }

  @Post(':id/enviar-correo')
  @UseGuards(RolesGuard)
  @Roles(1)
  enviarCorreo(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.enviarCorreoAlerta(id);
  }

  @Post("enviar-correos-pendientes")
  @UseGuards(RolesGuard)
  @Roles(1)
  enviarCorreosPendientes() {
    return this.alertsService.enviarCorreosPendientes()
  }

  @Get('box/:id')
  findByBox(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findByBox(id);
  }
}


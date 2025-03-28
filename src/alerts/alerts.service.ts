/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateAlertDto } from "./dto/create-alert.dto"
import  { UpdateAlertDto } from "./dto/update-alert.dto"

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createAlertDto: CreateAlertDto) {
    // Verificar si la caja existe
    const box = await this.prisma.box.findUnique({
      where: { id: createAlertDto.caja_id },
    })

    if (!box) {
      throw new NotFoundException(`Caja con ID ${createAlertDto.caja_id} no encontrada`)
    }

    return this.prisma.alerts.create({
      data: {
        ...createAlertDto,
        fecha: new Date(),
        send: createAlertDto.send ?? false,
      },
    })
  }

  findAll() {
    return this.prisma.alerts.findMany({
      include: {
        box: true,
      },
      orderBy: {
        fecha: "desc",
      },
    })
  }

  async findOne(id: number) {
    const alert = await this.prisma.alerts.findUnique({
      where: { id },
      include: {
        box: true,
      },
    })

    if (!alert) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`)
    }

    return alert
  }

  async update(id: number, updateAlertDto: UpdateAlertDto) {
    // Verificar si la alerta existe
    await this.findOne(id)

    return this.prisma.alerts.update({
      where: { id },
      data: updateAlertDto,
    })
  }

  async remove(id: number) {
    // Verificar si la alerta existe
    await this.findOne(id)

    return this.prisma.alerts.delete({
      where: { id },
    })
  }

  async marcarComoEnviada(id: number) {
    // Verificar si la alerta existe
    await this.findOne(id)

    return this.prisma.alerts.update({
      where: { id },
      data: { send: true },
    })
  }

  async findByBox(boxId: number) {
    return this.prisma.alerts.findMany({
      where: { caja_id: boxId },
      orderBy: {
        fecha: "desc",
      },
    })
  }

  async findPendientes() {
    return this.prisma.alerts.findMany({
      where: { send: false },
      include: {
        box: true,
      },
      orderBy: {
        fecha: "desc",
      },
    })
  }
}


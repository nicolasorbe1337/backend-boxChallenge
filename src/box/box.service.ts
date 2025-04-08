/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import  { CreateBoxDto } from "./dto/create-box.dto"
import  { UpdateBoxDto } from "./dto/update-box.dto"

@Injectable()
export class BoxService {
  constructor(private prisma: PrismaService) {}

  create(createBoxDto: CreateBoxDto) {
    return this.prisma.box.create({
      data: createBoxDto,
    })
  }

  findAll() {
    return this.prisma.box.findMany({
      include: {
        supplier: true,
      },
    })
  }

  async findOne(id: number) {
    const box = await this.prisma.box.findUnique({
      where: { id },
      include: {
        supplier: true,
        movements: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        alerts: true,
      },
    })

    if (!box) {
      throw new NotFoundException(`Caja con ID ${id} no encontrada`)
    }

    return box
  }

  async update(id: number, updateBoxDto: UpdateBoxDto) {
    // Verificar si la caja existe
    await this.findOne(id)

    return this.prisma.box.update({
      where: { id },
      data: updateBoxDto,
    })
  }

  async remove(id: number) {
    // Verificar si la caja existe
    await this.findOne(id)

    return this.prisma.box.delete({
      where: { id },
    })
  }

  async verificarStock(id: number) {
    const box = await this.findOne(id)

    // Usar el umbral personalizado de la caja
    if (box.stock <= box.alerta_umbral) {
      await this.prisma.alerts.create({
        data: {
          caja_id: id,
          fecha: new Date(),
          mensaje: `Stock bajo para caja ${box.tipo}: ${box.stock} unidades restantes (umbral: ${box.alerta_umbral})`,
          send: false,
        },
      })
    }

    return box
  }
}


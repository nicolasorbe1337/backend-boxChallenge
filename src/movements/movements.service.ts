/* eslint-disable */

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateMovementDto } from "./dto/create-movement.dto"
import  { UpdateMovementDto } from "./dto/update-movement.dto"

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async create(createMovementDto: CreateMovementDto) {
    // Verificar si la caja existe
    const box = await this.prisma.box.findUnique({
      where: { id: createMovementDto.caja_id },
    })

    if (!box) {
      throw new NotFoundException(`Caja con ID ${createMovementDto.caja_id} no encontrada`)
    }

    // Verificar si el usuario existe
    const user = await this.prisma.users.findUnique({
      where: { id: createMovementDto.usuario_id },
    })

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${createMovementDto.usuario_id} no encontrado`)
    }

    // Actualizar el stock de la caja según el tipo de movimiento
    let nuevoStock = box.stock

    if (createMovementDto.tipo_movimiento === 1) {
      // ENTRADA
      nuevoStock += createMovementDto.cantidad
    } else if (createMovementDto.tipo_movimiento === 2) {
      // SALIDA
      if (box.stock < createMovementDto.cantidad) {
        throw new BadRequestException("No hay suficiente stock para realizar esta salida")
      }
      nuevoStock -= createMovementDto.cantidad
    } else {
      throw new BadRequestException("Tipo de movimiento no válido. Use 1 para ENTRADA o 2 para SALIDA")
    }

    // Crear el movimiento y actualizar el stock en una transacción
    return this.prisma.$transaction(async (prisma) => {
      const movimiento = await prisma.movements.create({
        data: {
          ...createMovementDto,
          fecha: new Date(),
        },
        include: {
          box: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      await prisma.box.update({
        where: { id: createMovementDto.caja_id },
        data: { stock: nuevoStock },
      })

      // Verificar si el stock es bajo (ejemplo: menor a 10)
      if (nuevoStock < 10) {
        await prisma.alerts.create({
          data: {
            caja_id: createMovementDto.caja_id,
            fecha: new Date(),
            mensaje: `Stock bajo para caja ${box.tipo}: ${nuevoStock} unidades restantes`,
            send: false,
          },
        })
      }

      return movimiento
    })
  }

  findAll() {
    return this.prisma.movements.findMany({
      include: {
        box: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    })
  }

  async findOne(id: number) {
    const movement = await this.prisma.movements.findUnique({
      where: { id },
      include: {
        box: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!movement) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`)
    }

    return movement
  }

  async update(id: number, updateMovementDto: UpdateMovementDto) {
    // En general, no se recomienda actualizar movimientos ya que afectan al stock
    throw new BadRequestException("No se permite actualizar movimientos. Cree uno nuevo si es necesario")
  }

  async remove(id: number) {
    // En general, no se recomienda eliminar movimientos ya que afectan al stock
    throw new BadRequestException("No se permite eliminar movimientos para mantener la integridad del historial")
  }

  async findByBox(boxId: number) {
    return this.prisma.movements.findMany({
      where: { caja_id: boxId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    })
  }

  async findByUser(userId: number) {
    return this.prisma.movements.findMany({
      where: { usuario_id: userId },
      include: {
        box: true,
      },
      orderBy: {
        fecha: "desc",
      },
    })
  }
}


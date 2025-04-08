import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { UpdateMovementDto } from "./dto/update-movement.dto"
import { CreateMovementDto } from "./dto/create-movement.dto"
import { PrismaService } from "src/prisma/prisma.service"
import { MailService } from "src/mail/mail/mail.service"

@Injectable()
export class MovementsService {
  private readonly logger = new Logger(MovementsService.name)

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createMovementDto: CreateMovementDto) {
    // Verificar si la caja existe
    const box = await this.prisma.box.findUnique({
      where: { id: createMovementDto.caja_id },
      include: {
        supplier: true, // Incluir información del proveedor para el correo
      },
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

      // Verificar si el stock es bajo según el umbral personalizado de la caja
      if (nuevoStock <= box.alerta_umbral) {
        // Crear la alerta en la base de datos
        const alerta = await prisma.alerts.create({
          data: {
            caja_id: createMovementDto.caja_id,
            fecha: new Date(),
            mensaje: `Stock bajo para caja ${box.tipo}: ${nuevoStock} unidades restantes (umbral: ${box.alerta_umbral})`,
            send: false,
          },
        })

        // Intentar enviar el correo electrónico
        try {
          await this.mailService.sendStockAlert({
            subject: `ALERTA: Stock bajo en ${box.tipo}`,
            boxName: box.tipo,
            medidas: box.medidas,
            currentStock: nuevoStock,
            threshold: box.alerta_umbral,
            boxId: box.id,
            supplierInfo: box.supplier
              ? {
                  name: box.supplier.name,
                  email: box.supplier.email,
                  telefono: box.supplier.telefono,
                }
              : undefined,
          })

          // Actualizar la alerta para marcarla como enviada
          await prisma.alerts.update({
            where: { id: alerta.id },
            data: {
              send: true,
              email_enviado: new Date(),
            },
          })

          this.logger.log(`Correo de alerta enviado automáticamente para la caja ${box.id}`)
        } catch (error) {
          this.logger.error(`Error al enviar correo de alerta automático: ${error.message}`)
          // No lanzamos el error para que no afecte la transacción principal
        }
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
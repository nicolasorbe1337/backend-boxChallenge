/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateAlertDto } from "./dto/create-alert.dto"

import { ConfigService } from "@nestjs/config"
import { MailService } from "src/mail/mail/mail.service"
import { AlertStatus, UpdateAlertStatusDto } from "./dto/update-status.dto"
import { UpdateAlertDto } from "./dto/update-alert.dto"

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name)

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
    
  ) {}

  async create(createAlertDto: CreateAlertDto) {
    // Verificar si la caja existe
    const box = await this.prisma.box.findUnique({
      where: { id: createAlertDto.caja_id },
      include: {
        supplier: true,
      },
    })

    if (!box) {
      throw new NotFoundException(`Caja con ID ${createAlertDto.caja_id} no encontrada`)
    }

    // Crear la alerta
    const alerta = await this.prisma.alerts.create({
      data: {
        ...createAlertDto,
        fecha: new Date(),
        send: createAlertDto.send ?? false,
        estado: AlertStatus.PENDIENTE,
      },
      include: {
        box: {
          include: {
            supplier: true,
          },
        },
      },
    })

    // Intentar enviar el correo al encargado de compras interno
    try {
      await this.enviarCorreoAlerta(alerta.id)
    } catch (error) {
      this.logger.error(`Error al enviar correo para alerta ${alerta.id}: ${error.message}`)
    }

    return alerta
  }

  findAll() {
    return this.prisma.alerts.findMany({
      include: {
        box: {
          include: {
            supplier: true,
          },
        },
        gestor: {
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
    const alert = await this.prisma.alerts.findUnique({
      where: { id },
      include: {
        box: {
          include: {
            supplier: true,
          },
        },
        gestor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      data: {
        send: true,
        email_enviado: new Date(),
      },
    })
  }

  async findByBox(boxId: number) {
    return this.prisma.alerts.findMany({
      where: { caja_id: boxId },
      include: {
        gestor: {
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

  async findPendientes() {
    return this.prisma.alerts.findMany({
      where: {
        send: false,
        estado: AlertStatus.PENDIENTE,
      },
      include: {
        box: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    })
  }

  /**
   * Obtiene todas las alertas por estado
   */
  async findByStatus(estado: AlertStatus) {
    return this.prisma.alerts.findMany({
      where: { estado },
      include: {
        box: {
          include: {
            supplier: true,
          },
        },
        gestor: {
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

  /**
   * Actualiza el estado de una alerta
   */
  async updateStatus(id: number, updateStatusDto: UpdateAlertStatusDto) {
    // Verificar si la alerta existe
    const alerta = await this.findOne(id)

    // Verificar si el usuario existe
    const usuario = await this.prisma.users.findUnique({
      where: { id: updateStatusDto.gestionado_por },
    })

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${updateStatusDto.gestionado_por} no encontrado`)
    }

    // Verificar si el usuario es administrador
    if (usuario.idRol !== 1) {
      throw new ForbiddenException("Solo los administradores pueden gestionar alertas")
    }

    // Validar la transición de estado
    if (alerta.estado === AlertStatus.FINALIZADO) {
      throw new ForbiddenException("No se puede cambiar el estado de una alerta finalizada")
    }

    // Si estamos finalizando, verificar que primero haya sido gestionada
    if (updateStatusDto.estado === AlertStatus.FINALIZADO && alerta.estado !== AlertStatus.GESTIONADO) {
      throw new ForbiddenException("La alerta debe estar en estado GESTIONADO antes de finalizarla")
    }

    // Preparar los datos para la actualización
    const updateData: any = {
      estado: updateStatusDto.estado,
      gestionado_por: updateStatusDto.gestionado_por,
    }

    // Añadir notas si se proporcionan
    if (updateStatusDto.notas) {
      updateData.notas = updateStatusDto.notas
    }

    // Actualizar fechas según el estado
    if (updateStatusDto.estado === AlertStatus.GESTIONADO && alerta.estado === AlertStatus.PENDIENTE) {
      updateData.fecha_gestion = new Date()
    } else if (updateStatusDto.estado === AlertStatus.FINALIZADO) {
      updateData.fecha_finalizacion = new Date()
    }

    // Actualizar la alerta
    return this.prisma.alerts.update({
      where: { id },
      data: updateData,
      include: {
        box: true,
        gestor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  /**
   * Envía un correo electrónico para una alerta específica al encargado de compras interno
   */
  async enviarCorreoAlerta(alertId: number) {
    // Obtener la alerta con todos los datos necesarios
    const alerta = await this.prisma.alerts.findUnique({
      where: { id: alertId },
      include: {
        box: {
          include: {
            supplier: true,
          },
        },
      },
    })

    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${alertId} no encontrada`)
    }

    // Si ya fue enviada, no enviar de nuevo
    if (alerta.send) {
      return { success: false, message: "Esta alerta ya fue enviada por correo" }
    }

    // Verificar que existe la configuración del correo del encargado de compras
    const purchaseManagerEmail = this.configService.get("PURCHASE_MANAGER_EMAIL")
    if (!purchaseManagerEmail) {
      throw new Error("No se ha configurado el correo del encargado de compras (PURCHASE_MANAGER_EMAIL)")
    }

    try {
      // Enviar el correo al encargado de compras interno
      await this.mailService.sendStockAlert({
        subject: `ALERTA: Stock bajo en ${alerta.box.tipo}`,
        boxName: alerta.box.tipo,
        medidas: alerta.box.medidas,
        currentStock: alerta.box.stock,
        threshold: alerta.box.alerta_umbral,
        boxId: alerta.box.id,
        supplierInfo: alerta.box.supplier
          ? {
              name: alerta.box.supplier.name,
              email: alerta.box.supplier.email,
              telefono: alerta.box.supplier.telefono,
            }
          : undefined,
      })

      // Marcar como enviada
      await this.prisma.alerts.update({
        where: { id: alertId },
        data: {
          send: true,
          email_enviado: new Date(),
        },
      })

      return { success: true, message: "Correo enviado correctamente al encargado de compras" }
    } catch (error) {
      this.logger.error(`Error al enviar correo: ${error.message}`)
      throw new Error(`No se pudo enviar el correo: ${error.message}`)
    }
  }

  /**
   * Envía correos para todas las alertas pendientes
   */
  async enviarCorreosPendientes() {
    const alertasPendientes = await this.findPendientes()
    const resultados = []

    for (const alerta of alertasPendientes) {
      try {
        const resultado = await this.enviarCorreoAlerta(alerta.id)
        resultados.push({
          alertaId: alerta.id,
          success: true,
          message: resultado.message,
        })
      } catch (error) {
        resultados.push({
          alertaId: alerta.id,
          success: false,
          message: error.message,
        })
      }
    }

    return resultados
  }
}

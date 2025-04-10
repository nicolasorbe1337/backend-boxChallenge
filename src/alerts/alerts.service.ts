import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import  { CreateAlertDto } from "./dto/create-alert.dto"
import  { ConfigService } from "@nestjs/config"

import { AlertStatus, type UpdateAlertStatusDto } from "./dto/update-status.dto"
import  { UpdateAlertDto } from "./dto/update-alert.dto"

import { MailService } from "src/mail/mail/mail.service"
import { AlertsRepository } from "./repository/alerts.repository"


@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name)

  constructor(
    private alertsRepository: AlertsRepository,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async create(createAlertDto: CreateAlertDto) {
    // Verificar si la caja existe
    const box = await this.alertsRepository.findBoxById(createAlertDto.caja_id)
    if (!box) {
      throw new NotFoundException(`Caja con ID ${createAlertDto.caja_id} no encontrada`)
    }

    // Crear la alerta
    const alerta = await this.alertsRepository.createAlert(createAlertDto)

    // Intentar enviar el correo al encargado de compras interno
    try {
      await this.enviarCorreoAlerta(alerta.id)
    } catch (error) {
      this.logger.error(`Error al enviar correo para alerta ${alerta.id}: ${error.message}`)
    }

    return alerta
  }

  async findAll() {
    const alerts = await this.alertsRepository.findAllAlerts()

    if (alerts.length === 0) {
      throw new NotFoundException("No existen alertas")
    }

    return alerts
  }

  async findOne(id: number) {
    const alert = await this.alertsRepository.findAlertById(id)

    if (!alert) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`)
    }

    return alert
  }

  async update(id: number, updateAlertDto: UpdateAlertDto) {
    // Verificar si la alerta existe
    await this.findOne(id)

    return this.alertsRepository.updateAlert(id, updateAlertDto)
  }

  async remove(id: number) {
    // Verificar si la alerta existe
    await this.findOne(id)

    return this.alertsRepository.deleteAlert(id)
  }

  async marcarComoEnviada(id: number) {
    // Verificar si la alerta existe
    await this.findOne(id)

    return this.alertsRepository.markAlertAsSent(id)
  }

  async findByBox(boxId: number) {
    const alertas = await this.alertsRepository.findAlertsByBox(boxId)

    if (alertas.length === 0) {
      throw new NotFoundException(`No existen alertas para la caja con ID ${boxId}`)
    }

    return alertas
  }

  async findPendientes() {
    const pendingAlerts = await this.alertsRepository.findPendingAlerts()

    if (pendingAlerts.length === 0) {
      throw new NotFoundException("No existen alertas pendientes")
    }

    return pendingAlerts
  }

  async findByStatus(estado: AlertStatus) {
    const alertas = await this.alertsRepository.findAlertsByStatus(estado)

    if (alertas.length === 0) {
      throw new NotFoundException(`No existen alertas con estado ${estado}`)
    }

    return alertas
  }

  async updateStatus(id: number, updateStatusDto: UpdateAlertStatusDto) {
    // Verificar si la alerta existe
    const alerta = await this.findOne(id)

    // Verificar si el usuario existe
    const usuario = await this.alertsRepository.findUserById(updateStatusDto.gestionado_por)
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
    return this.alertsRepository.updateAlertStatus(id, updateData)
  }

  async enviarCorreoAlerta(alertId: number) {
    // Obtener la alerta con todos los datos necesarios
    const alerta = await this.findOne(alertId)

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
      await this.alertsRepository.markAlertAsSent(alertId)

      return { success: true, message: "Correo enviado correctamente al encargado de compras" }
    } catch (error) {
      this.logger.error(`Error al enviar correo: ${error.message}`)
      throw new Error(`No se pudo enviar el correo: ${error.message}`)
    }
  }

  async enviarCorreosPendientes() {
    try {
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
    } catch (error) {
      // Si findPendientes() lanza NotFoundException, capturamos y devolvemos un mensaje apropiado
      if (error instanceof NotFoundException) {
        return { message: error.message, alertasEnviadas: 0 }
      }
      throw error // Re-lanzar otros tipos de errores
    }
  }
}

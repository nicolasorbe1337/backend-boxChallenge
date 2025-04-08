import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import { AlertStatus } from "../alerts/dto/update-status.dto"

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene un resumen del dashboard para administradores
   */
  async getAdminDashboard() {
    // Obtener conteo de alertas por estado
    const alertasPendientes = await this.prisma.alerts.count({
      where: { estado: AlertStatus.PENDIENTE },
    })

    const alertasGestionadas = await this.prisma.alerts.count({
      where: { estado: AlertStatus.GESTIONADO },
    })

    const alertasFinalizadas = await this.prisma.alerts.count({
      where: { estado: AlertStatus.FINALIZADO },
    })

    // Obtener las últimas 5 alertas pendientes
    const ultimasAlertasPendientes = await this.prisma.alerts.findMany({
      where: { estado: AlertStatus.PENDIENTE },
      include: {
        box: true,
      },
      orderBy: {
        fecha: "desc",
      },
      take: 5,
    })

    // Obtener las últimas 5 alertas gestionadas
    const ultimasAlertasGestionadas = await this.prisma.alerts.findMany({
      where: { estado: AlertStatus.GESTIONADO },
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
      orderBy: {
        fecha_gestion: "desc",
      },
      take: 5,
    })

    // Obtener cajas con stock bajo (por debajo del umbral)
    const cajasStockBajo = await this.prisma.box.findMany({
      where: {
        stock: {
          lte: this.prisma.box.fields.alerta_umbral,
        },
      },
      include: {
        supplier: true,
      },
      orderBy: {
        stock: "asc",
      },
    })

    // Obtener estadísticas de movimientos recientes
    const movimientosRecientes = await this.prisma.movements.count({
      where: {
        fecha: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Últimos 7 días
        },
      },
    })

    // Obtener total de cajas y proveedores
    const totalCajas = await this.prisma.box.count()
    const totalProveedores = await this.prisma.suppliers.count()

    return {
      alertas: {
        pendientes: alertasPendientes,
        gestionadas: alertasGestionadas,
        finalizadas: alertasFinalizadas,
        total: alertasPendientes + alertasGestionadas + alertasFinalizadas,
      },
      ultimasAlertasPendientes,
      ultimasAlertasGestionadas,
      cajasStockBajo,
      estadisticas: {
        movimientosRecientes,
        totalCajas,
        totalProveedores,
      },
    }
  }

  /**
   * Obtiene un resumen del dashboard para usuarios normales
   */
  async getUserDashboard() {
    // Obtener cajas con stock bajo (por debajo del umbral)
    const cajasStockBajo = await this.prisma.box.findMany({
      where: {
        stock: {
          lte: this.prisma.box.fields.alerta_umbral,
        },
      },
      include: {
        supplier: true,
        alerts: {
          where: {
            estado: {
              in: [AlertStatus.GESTIONADO, AlertStatus.FINALIZADO],
            },
          },
          orderBy: {
            fecha: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        stock: "asc",
      },
    })

    // Filtrar cajas para mostrar su estado de gestión
    const cajasConEstado = cajasStockBajo.map((caja) => {
      const ultimaAlerta = caja.alerts[0]
      return {
        ...caja,
        alerts: undefined, // Eliminar el array completo
        estado_gestion: ultimaAlerta ? ultimaAlerta.estado : AlertStatus.PENDIENTE,
        fecha_gestion: ultimaAlerta?.fecha_gestion || null,
        fecha_finalizacion: ultimaAlerta?.fecha_finalizacion || null,
        notas: ultimaAlerta?.notas || null,
      }
    })

    // Obtener estadísticas básicas
    const totalCajas = await this.prisma.box.count()
    const totalMovimientos = await this.prisma.movements.count()

    return {
      cajasStockBajo: cajasConEstado,
      estadisticas: {
        totalCajas,
        totalMovimientos,
      },
    }
  }
}


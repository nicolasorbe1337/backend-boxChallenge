import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAlertDto } from "../dto/create-alert.dto";
import { UpdateAlertDto } from "../dto/update-alert.dto";
import { AlertStatus } from "../dto/update-status.dto";


@Injectable()
export class AlertsRepository {
  constructor(private prisma: PrismaService) {}

  // Métodos para alertas
  async createAlert(createAlertDto: CreateAlertDto) {
    return this.prisma.alerts.create({
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
    });
  }

  async findAllAlerts() {
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
    });
  }

  async findAlertById(id: number) {
    return this.prisma.alerts.findUnique({
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
    });
  }

  async updateAlert(id: number, updateAlertDto: UpdateAlertDto) {
    return this.prisma.alerts.update({
      where: { id },
      data: updateAlertDto,
    });
  }

  async deleteAlert(id: number) {
    return this.prisma.alerts.delete({
      where: { id },
    });
  }

  async markAlertAsSent(id: number) {
    return this.prisma.alerts.update({
      where: { id },
      data: {
        send: true,
        email_enviado: new Date(),
      },
    });
  }

  async findAlertsByBox(boxId: number) {
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
    });
  }

  async findPendingAlerts() {
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
    });
  }

  async findAlertsByStatus(estado: AlertStatus) {
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
    });
  }

  async updateAlertStatus(id: number, updateData: any) {
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
    });
  }

  // Métodos para otras entidades relacionadas
  async findBoxById(boxId: number) {
    return this.prisma.box.findUnique({
      where: { id: boxId },
      include: {
        supplier: true,
      },
    });
  }

  async findUserById(userId: number) {
    return this.prisma.users.findUnique({
      where: { id: userId },
    });
  }
}
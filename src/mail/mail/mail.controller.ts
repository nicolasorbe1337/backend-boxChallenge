import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("test")
  async testEmail(@Body() data: { boxName?: string, medidas?: string }) {
    try {
      await this.mailService.sendStockAlert({
        subject: "PRUEBA: Correo de Alerta de Stock",
        boxName: data.boxName || "Caja de Prueba",
        medidas: data.medidas || "30x20x15",
        currentStock: 5,
        threshold: 10,
        boxId: 1,
        supplierInfo: {
          name: "Proveedor de Prueba",
          email: "proveedor@ejemplo.com",
          telefono: "123-456-7890",
        },
      })

      return { success: true, message: "Correo de prueba enviado correctamente" }
    } catch (error) {
      return {
        success: false,
        message: "Error al enviar correo de prueba",
        error: error.message,
      }
    }
  }
}

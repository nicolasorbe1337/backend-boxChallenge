
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'


@Injectable()
export class MailService {
    constructor(
      private mailerService: MailerService,
      private configService: ConfigService,
    ) {}
  
    /**
     * Envía un correo de alerta por stock bajo al encargado de compras interno
     */
    async sendStockAlert(options: {
      subject: string
      boxName: string
      currentStock: number
      medidas?: string
      threshold: number
      boxId: number
      supplierInfo?: {
        name: string
        email?: string
        telefono?: string
      }
    }) {
      const { subject, boxName, currentStock, medidas, threshold, boxId, supplierInfo } = options
  
      // Usar siempre el correo del encargado de compras interno
      const purchaseManagerEmail = this.configService.get("PURCHASE_MANAGER_EMAIL")
  
      if (!purchaseManagerEmail) {
        throw new Error("No se ha configurado el correo del encargado de compras (PURCHASE_MANAGER_EMAIL)")
      }
  
      await this.mailerService.sendMail({
        to: purchaseManagerEmail,
        subject: subject || `ALERTA: Stock bajo en ${boxName}`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #333;">
        <div style="background-color: #f8f9fa; border-top: 4px solid #dc3545; padding: 20px;">
          <h2 style="color: #dc3545; margin-top: 0; font-size: 22px; font-weight: 600;">⚠️ Alerta de Stock Bajo</h2>
          
          <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #dc3545;">
            <p style="margin-top: 0; margin-bottom: 15px; font-size: 16px;">Se ha detectado un nivel bajo de stock para el siguiente producto:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; width: 40%;">Producto:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${boxName}</td>
              </tr>
              ${medidas ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">Medidas:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${medidas}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">Stock actual:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #dc3545; font-weight: 600;">${currentStock} unidades</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">Umbral de alerta:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${threshold} unidades</td>
              </tr>
            </table>
            
            ${
              supplierInfo
                ? `
              <div style="margin-top: 20px; background-color: #f8f9fa; border-radius: 8px; padding: 15px;">
                <h3 style="margin-top: 0; font-size: 18px; color: #495057;">Información del Proveedor</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 10px; font-weight: 600; width: 40%;">Nombre:</td>
                    <td style="padding: 8px 10px;">${supplierInfo.name}</td>
                  </tr>
                  ${supplierInfo.email ? `
                  <tr>
                    <td style="padding: 8px 10px; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 10px;"><a href="mailto:${supplierInfo.email}" style="color: #0d6efd; text-decoration: none;">${supplierInfo.email}</a></td>
                  </tr>
                  ` : ""}
                  ${supplierInfo.telefono ? `
                  <tr>
                    <td style="padding: 8px 10px; font-weight: 600;">Teléfono:</td>
                    <td style="padding: 8px 10px;"><a href="tel:${supplierInfo.telefono}" style="color: #0d6efd; text-decoration: none;">${supplierInfo.telefono}</a></td>
                  </tr>
                  ` : ""}
                </table>
              </div>
            `
                : ""
            }
          </div>
          
          <p style="margin-bottom: 20px; font-size: 16px;">Por favor, realice un pedido al proveedor para reponer el inventario lo antes posible.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 13px; color: #6c757d; text-align: center;">
            <p style="margin: 0;">Este es un mensaje automático del Sistema de Gestión de Inventario.</p>
            <p style="margin: 5px 0 0 0;">No responda a este correo electrónico.</p>
          </div>
        </div>
      </div>
    `,
      })
  
      return true
    }
  }

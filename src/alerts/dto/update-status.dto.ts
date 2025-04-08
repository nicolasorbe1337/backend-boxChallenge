import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export enum AlertStatus {
  PENDIENTE = "PENDIENTE",
  GESTIONADO = "GESTIONADO",
  FINALIZADO = "FINALIZADO",
}

export class UpdateAlertStatusDto {
  @IsNotEmpty()
  @IsEnum(AlertStatus)
  estado: AlertStatus

  @IsOptional()
  @IsString()
  notas?: string

  @IsNotEmpty()
  @IsNumber()
  gestionado_por: number
}
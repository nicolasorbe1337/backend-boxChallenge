/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateBoxDto {
  @IsNotEmpty()
  @IsString()
  tipo: string

  @IsNotEmpty()
  @IsString()
  medidas: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  stock: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  proveedor_id: number
  
  @IsOptional()
  @IsNumber()
  @IsPositive()
  alerta_umbral?: number
}

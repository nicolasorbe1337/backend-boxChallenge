/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator"

export class CreateMovementDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  caja_id: number

  @IsNotEmpty()
  @IsNumber()
  cantidad: number

  @IsNotEmpty()
  @IsNumber()
  tipo_movimiento: number // 1 = ENTRADA, 2 = SALIDA

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  usuario_id: number
}


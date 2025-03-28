/* eslint-disable prettier/prettier */

import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateAlertDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  caja_id: number

  @IsNotEmpty()
  @IsString()
  mensaje: string

  @IsOptional()
  @IsBoolean()
  send?: boolean
}

/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  contacto: string

  @IsOptional()
  @IsString()
  telefono: string

  @IsOptional()
  @IsEmail()
  email: string
}


/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator"

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string

  @IsNotEmpty()
  @IsNumber()
  idRol: number
}

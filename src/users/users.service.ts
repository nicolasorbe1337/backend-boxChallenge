/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"

import  { PrismaService } from "../prisma/prisma.service"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import * as bcrypt from "bcrypt"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.users.findFirst({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException("El email ya está registrado")
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    // Crear el usuario
    return this.prisma.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    })
  }

  findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        idRol: true,
        password: false, // No devolver la contraseña
      },
    })
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        idRol: true,
        password: false, // No devolver la contraseña
      },
    })

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`)
    }

    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verificar si el usuario existe
    await this.findOne(id)

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    return this.prisma.users.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        idRol: true,
        password: false, // No devolver la contraseña
      },
    })
  }

  async remove(id: number) {
    // Verificar si el usuario existe
    await this.findOne(id)

    return this.prisma.users.delete({
      where: { id },
    })
  }
}


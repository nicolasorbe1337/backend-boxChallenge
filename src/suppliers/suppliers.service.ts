/* eslint-disable*/
import { Injectable, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import type { CreateSupplierDto } from "./dto/create-supplier.dto"
import type { UpdateSupplierDto } from "./dto/update-supplier.dto"

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.suppliers.create({
      data: createSupplierDto,
    })
  }

  findAll() {
    return this.prisma.suppliers.findMany()
  }

  async findOne(id: number) {
    const supplier = await this.prisma.suppliers.findUnique({
      where: { id },
      include: {
        boxes: true,
      },
    })

    if (!supplier) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`)
    }

    return supplier
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    // Verificar si el proveedor existe
    await this.findOne(id)

    return this.prisma.suppliers.update({
      where: { id },
      data: updateSupplierDto,
    })
  }

  async remove(id: number) {
    // Verificar si el proveedor existe
    await this.findOne(id)

    return this.prisma.suppliers.delete({
      where: { id },
    })
  }
}


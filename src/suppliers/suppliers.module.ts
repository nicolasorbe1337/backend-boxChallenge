/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common"
import { SuppliersService } from "./suppliers.service"
import { SuppliersController } from "./suppliers.controller"
import { PrismaModule } from "src/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}


/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common"
import { MovementsService } from "./movements.service"
import { MovementsController } from "./movements.controller"
import { BoxModule } from "../box/box.module"

@Module({
  imports: [BoxModule],
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}


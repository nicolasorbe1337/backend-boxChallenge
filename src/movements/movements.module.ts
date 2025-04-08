/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common"
import { MovementsService } from "./movements.service"
import { MovementsController } from "./movements.controller"
import { BoxModule } from "../box/box.module"
import { MailModule } from "src/mail/mail/mail.module"

@Module({
  imports: [BoxModule, MailModule],
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}


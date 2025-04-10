/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common"
import { AlertsService } from "./alerts.service"
import { AlertsController } from "./alerts.controller"
import { PrismaModule } from "src/prisma/prisma.module"

import { AlertsRepository } from "./repository/alerts.repository"
import { MailModule } from "src/mail/mail/mail.module"

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
  exports: [AlertsService],
})
export class AlertsModule {}


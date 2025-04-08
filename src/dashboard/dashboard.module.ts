import { Module } from "@nestjs/common"
import { DashboardController } from "./dashboard.controller"
import { DashboardService } from "./dashboard.service"
import { PrismaModule } from "../prisma/prisma.module"
import { AlertsModule } from "../alerts/alerts.module"
import { BoxModule } from "../box/box.module"

@Module({
  imports: [PrismaModule, AlertsModule, BoxModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}


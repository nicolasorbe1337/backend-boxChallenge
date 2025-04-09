import { Controller, Get, UseGuards } from "@nestjs/common"
import type { DashboardService } from "./dashboard.service.ts"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard.js"
import { RolesGuard } from "src/auth/guards/roles.guard.js"
import { Roles } from "src/auth/decorators/roles.decorator.js"

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)//guard para verificar que está autenticado
  @Roles(1) // Solo administradores (idRol = 1)
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard()
  }

  @Get("user")
  @UseGuards(JwtAuthGuard) // guard para verificar que está autenticado
  getUserDashboard() {
    return this.dashboardService.getUserDashboard()
  }
}
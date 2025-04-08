import { Controller, Get } from "@nestjs/common"
import type { DashboardService } from "./dashboard.service.ts"

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("admin")
  // @UseGuards(AdminGuard) // Aquí deberías añadir un guard para verificar que es admin
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard()
  }

  @Get("user")
  // @UseGuards(AuthGuard) // Aquí deberías añadir un guard para verificar que está autenticado
  getUserDashboard() {
    return this.dashboardService.getUserDashboard()
  }
}
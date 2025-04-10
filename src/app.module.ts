/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "./prisma/prisma.module"
import { UsersModule } from "./users/users.module"
import { SuppliersModule } from "./suppliers/suppliers.module"
import { BoxModule } from "./box/box.module"
import { MovementsModule } from "./movements/movements.module"
import { AlertsModule } from "./alerts/alerts.module"
import { MailModule } from "./mail/mail/mail.module"
import { AuthModule } from "./auth/auth.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    SuppliersModule,
    BoxModule,
    MovementsModule,
    AlertsModule,
    MailModule,
    AuthModule
  ],
})
export class AppModule {}

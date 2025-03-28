/* eslint-disable */
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Configuración global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Configuración de CORS
  app.enableCors()

  // Prefijo global para todas las rutas
  app.setGlobalPrefix("api")

  await app.listen(3000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()


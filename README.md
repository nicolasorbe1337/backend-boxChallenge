<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


### Módulo de Alertas

El módulo de alertas en tu aplicación NestJS está diseñado para monitorear y notificar sobre situaciones críticas relacionadas con el inventario de cajas. Vamos a analizar en detalle cómo funciona este módulo:

## 1. Estructura y Propósito

### Modelo de Datos

El modelo `Alerta` (o `alerts` en la base de datos) tiene la siguiente estructura:

```typescript
model Alerta {
  id        Int      @id @default(autoincrement())
  caja_id   Int
  fecha     DateTime @db.Date
  mensaje   String
  send      Boolean
  box       box      @relation(fields: [caja_id], references: [id])
}
```

Donde:

- `id`: Identificador único de la alerta
- `caja_id`: ID de la caja relacionada con la alerta
- `fecha`: Fecha en que se generó la alerta
- `mensaje`: Descripción del problema o situación
- `send`: Indicador de si la alerta ha sido enviada/procesada
- `box`: Relación con la caja asociada


### Propósito

El módulo de alertas tiene como objetivo principal:

1. Registrar situaciones de stock bajo o crítico
2. Permitir el seguimiento de problemas de inventario
3. Facilitar la gestión de notificaciones sobre estas situaciones


## 2. Generación de Alertas

Las alertas pueden generarse de dos maneras:

### 2.1 Generación Automática

Las alertas se generan automáticamente en dos situaciones:

1. **Durante movimientos de salida**: Cuando se realiza un movimiento de salida que reduce el stock por debajo de un umbral (por ejemplo, 10 unidades), se genera una alerta automáticamente:


```typescript
// En MovimentsService (create method)
if (nuevoStock < 10) {
  await prisma.alerts.create({
    data: {
      caja_id: createMovementDto.caja_id,
      fecha: new Date(),
      mensaje: `Stock bajo para caja ${box.tipo}: ${nuevoStock} unidades restantes`,
      send: false,
    },
  });
}
```

2. **Al verificar el stock**: Cuando se llama al endpoint de verificación de stock de una caja, también se puede generar una alerta si el stock está por debajo del umbral:


```typescript
// En BoxService (verificarStock method)
async verificarStock(id: number) {
  const box = await this.findOne(id);
  
  if (box.stock < 10) {
    await this.prisma.alerts.create({
      data: {
        caja_id: id,
        fecha: new Date(),
        mensaje: `Stock bajo para caja ${box.tipo}: ${box.stock} unidades restantes`,
        send: false,
      },
    });
  }
  
  return box;
}
```

### 2.2 Generación Manual

También es posible crear alertas manualmente a través del endpoint `POST /alerts`:

```typescript
// En AlertsService (create method)
async create(createAlertDto: CreateAlertDto) {
  // Verificar si la caja existe
  const box = await this.prisma.box.findUnique({
    where: { id: createAlertDto.caja_id },
  });

  if (!box) {
    throw new NotFoundException(`Caja con ID ${createAlertDto.caja_id} no encontrada`);
  }

  return this.prisma.alerts.create({
    data: {
      ...createAlertDto,
      fecha: new Date(),
      send: createAlertDto.send ?? false,
    },
  });
}
```

## 3. Gestión de Alertas

### 3.1 Consulta de Alertas

El módulo ofrece varias formas de consultar las alertas:

1. **Todas las alertas**: `GET /alerts`

```typescript
findAll() {
  return this.prisma.alerts.findMany({
    include: {
      box: true,
    },
    orderBy: {
      fecha: 'desc',
    },
  });
}
```


2. **Alertas pendientes**: `GET /alerts/pendientes`

```typescript
async findPendientes() {
  return this.prisma.alerts.findMany({
    where: { send: false },
    include: {
      box: true,
    },
    orderBy: {
      fecha: 'desc',
    },
  });
}
```


3. **Alertas por caja**: `GET /alerts/box/:id`

```typescript
async findByCaja(boxId: number) {
  return this.prisma.alerts.findMany({
    where: { caja_id: boxId },
    orderBy: {
      fecha: 'desc',
    },
  });
}
```




### 3.2 Procesamiento de Alertas

Una vez que una alerta ha sido atendida o procesada, se puede marcar como enviada:

```typescript
// En AlertsService (marcarComoEnviada method)
async marcarComoEnviada(id: number) {
  // Verificar si la alerta existe
  await this.findOne(id);

  return this.prisma.alerts.update({
    where: { id },
    data: { send: true },
  });
}
```

Este endpoint (`PATCH /alerts/:id/marcar-enviada`) permite cambiar el estado de una alerta de pendiente a procesada.

## 4. Integración con el Flujo de Trabajo

El módulo de alertas está integrado con el flujo de trabajo de la aplicación de la siguiente manera:

1. **Movimientos de inventario**: Cuando se realizan movimientos que afectan al stock, se verifica si es necesario generar alertas.
2. **Verificación periódica**: A través del endpoint `GET /box/:id/verificar-stock`, se puede implementar una verificación periódica del stock de las cajas.
3. **Gestión de notificaciones**: Las alertas pendientes (`send = false`) pueden ser consultadas para enviar notificaciones a los usuarios responsables.


## 5. Posibles Extensiones

El módulo de alertas podría extenderse para incluir:

1. **Niveles de alerta**: Diferenciar entre alertas de bajo stock, stock crítico, etc.
2. **Notificaciones automáticas**: Integrar con servicios de email o SMS para enviar notificaciones automáticas.
3. **Asignación de responsables**: Asignar usuarios responsables de atender cada alerta.
4. **Historial de acciones**: Registrar las acciones tomadas para resolver cada alerta.


## 6. Ejemplo de Flujo Completo

Un flujo completo de uso del módulo de alertas podría ser:

1. Se realiza un movimiento de salida que reduce el stock de una caja por debajo del umbral.
2. Se genera automáticamente una alerta con `send = false`.
3. Un administrador consulta las alertas pendientes a través de `GET /alerts/pendientes`.
4. El administrador toma acciones para resolver el problema (por ejemplo, realizar un pedido al proveedor).
5. Una vez resuelto, marca la alerta como enviada con `PATCH /alerts/:id/marcar-enviada`.
6. La alerta aparecerá en el historial pero ya no en las pendientes.


Este sistema permite mantener un control efectivo del inventario y asegurar que los problemas de stock bajo sean atendidos oportunamente.
# Sistema de Gestión de Inventario - Backend

## Descripción

Este proyecto es un backend para un Sistema de Gestión de Inventario desarrollado con NestJS y Prisma. Permite gestionar cajas, proveedores, movimientos de stock, alertas de inventario bajo y usuarios, con un sistema de notificaciones por correo electrónico.

## Tecnologías Utilizadas

- **NestJS**: Framework para construir aplicaciones del lado del servidor eficientes y escalables
- **Prisma**: ORM para Node.js y TypeScript
- **MySQL**: Base de datos relacional
- **Nodemailer**: Módulo para enviar correos electrónicos
- **TypeScript**: Lenguaje de programación tipado
- **Jest**: Framework de pruebas
- **Swagger**: Documentación de API

## Estructura del Proyecto

```
src/
├── alerts/                # Módulo de alertas
│   ├── dto/               # Objetos de transferencia de datos
│   ├── alerts.controller.ts
│   ├── alerts.module.ts
│   └── alerts.service.ts
├── box/                   # Módulo de cajas
├── dashboard/             # Módulo de dashboard
├── mail/                  # Módulo de correo electrónico
├── movements/             # Módulo de movimientos
├── prisma/                # Configuración de Prisma
├── suppliers/             # Módulo de proveedores
├── users/                 # Módulo de usuarios
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- MySQL (v8 o superior)

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/nicolasorbe1337/backend-boxChallenge.git
   cd backend-cajas



```markdown project="Sistema de Gestión de Inventario" file="README.md"
...
```

2. Instalar dependencias:

```shellscript
npm install
```


3. Configurar variables de entorno:
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```plaintext
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_base_datos"
PURCHASE_MANAGER_EMAIL="compras@empresa.com"
APP_URL="http://localhost:3000"
```


4. Generar el cliente Prisma:

```shellscript
npx prisma generate
```


5. Ejecutar migraciones:

```shellscript
npx prisma migrate dev
```




## Variables de Entorno

| Variable | Descripción | Valor por defecto
|-----|-----|-----
| `DATABASE_URL` | URL de conexión a la base de datos MySQL | -
| `PURCHASE_MANAGER_EMAIL` | Correo electrónico del encargado de compras | [test@example.com](mailto:test@example.com)
| `APP_URL` | URL base de la aplicación | [http://localhost:3000](http://localhost:3000)
| `PORT` | Puerto en el que se ejecutará el servidor | 3000


## Ejecución

### Desarrollo

```shellscript
npm run start:dev
```

### Producción

```shellscript
npm run build
npm run start:prod
```

## Endpoints API

### Alertas

| Método | Ruta | Descripción
|-----|-----|-----
| GET | `/alerts` | Obtener todas las alertas
| GET | `/alerts/pendientes` | Obtener alertas pendientes
| GET | `/alerts/by-status?estado=ESTADO` | Obtener alertas por estado
| GET | `/alerts/:id` | Obtener una alerta específica
| POST | `/alerts` | Crear una nueva alerta
| PATCH | `/alerts/:id` | Actualizar una alerta
| PATCH | `/alerts/:id/status` | Actualizar el estado de una alerta
| DELETE | `/alerts/:id` | Eliminar una alerta
| PATCH | `/alerts/:id/marcar-enviada` | Marcar una alerta como enviada
| POST | `/alerts/:id/enviar-correo` | Enviar correo de una alerta
| POST | `/alerts/enviar-correos-pendientes` | Enviar correos de alertas pendientes
| GET | `/alerts/box/:id` | Obtener alertas de una caja específica


### Cajas

| Método | Ruta | Descripción
|-----|-----|-----
| GET | `/box` | Obtener todas las cajas
| GET | `/box/:id` | Obtener una caja específica
| POST | `/box` | Crear una nueva caja
| PATCH | `/box/:id` | Actualizar una caja
| DELETE | `/box/:id` | Eliminar una caja


### Movimientos

| Método | Ruta | Descripción
|-----|-----|-----
| GET | `/movements` | Obtener todos los movimientos
| GET | `/movements/:id` | Obtener un movimiento específico
| POST | `/movements` | Crear un nuevo movimiento
| GET | `/movements/box/:id` | Obtener movimientos de una caja
| GET | `/movements/user/:id` | Obtener movimientos de un usuario


### Proveedores

| Método | Ruta | Descripción
|-----|-----|-----
| GET | `/suppliers` | Obtener todos los proveedores
| GET | `/suppliers/:id` | Obtener un proveedor específico
| POST | `/suppliers` | Crear un nuevo proveedor
| PATCH | `/suppliers/:id` | Actualizar un proveedor
| DELETE | `/suppliers/:id` | Eliminar un proveedor


### Usuarios

| Método | Ruta | Descripción
|-----|-----|-----
| GET | `/users` | Obtener todos los usuarios
| GET | `/users/:id` | Obtener un usuario específico
| POST | `/users` | Crear un nuevo usuario
| PATCH | `/users/:id` | Actualizar un usuario
| DELETE | `/users/:id` | Eliminar un usuario


### Dashboard

| Método | Ruta | Descripción
|-----|-----|-----
| GET | `/dashboard/admin` | Obtener dashboard para administradores
| GET | `/dashboard/user` | Obtener dashboard para usuarios


### Correo

| Método | Ruta | Descripción
|-----|-----|-----
| POST | `/mail/test` | Enviar correo de prueba


## Modelos de Datos

### Alertas (alerts)

| Campo | Tipo | Descripción
|-----|-----|-----
| id | Int | Identificador único
| caja_id | Int | ID de la caja relacionada
| fecha | DateTime | Fecha de creación
| mensaje | String | Mensaje de la alerta
| send | Boolean | Indica si se ha enviado el correo
| email_enviado | DateTime? | Fecha de envío del correo
| estado | String | Estado (PENDIENTE, GESTIONADO, FINALIZADO)
| fecha_gestion | DateTime? | Fecha de gestión
| fecha_finalizacion | DateTime? | Fecha de finalización
| notas | String? | Notas adicionales
| gestionado_por | Int? | ID del usuario que gestionó la alerta


### Cajas (box)

| Campo | Tipo | Descripción
|-----|-----|-----
| id | Int | Identificador único
| tipo | String | Tipo de caja
| medidas | String | Dimensiones de la caja
| stock | Int | Cantidad en stock
| proveedor_id | Int | ID del proveedor
| alerta_umbral | Int | Umbral para generar alertas


### Movimientos (movements)

| Campo | Tipo | Descripción
|-----|-----|-----
| id | Int | Identificador único
| caja_id | Int | ID de la caja
| cantidad | Int | Cantidad del movimiento
| tipo_movimiento | Int | Tipo (1=ENTRADA, 2=SALIDA)
| fecha | DateTime | Fecha del movimiento
| usuario_id | Int | ID del usuario que realizó el movimiento


### Proveedores (suppliers)

| Campo | Tipo | Descripción
|-----|-----|-----
| id | Int | Identificador único
| name | String | Nombre del proveedor
| email | String | Correo electrónico
| telefono | String | Número de teléfono


### Usuarios (users)

| Campo | Tipo | Descripción
|-----|-----|-----
| id | Int | Identificador único
| name | String | Nombre del usuario
| email | String | Correo electrónico
| password | String | Contraseña (hash)
| idRol | Int | Rol (1=ADMIN, 2=USER)


## Funcionalidades Principales

### Gestión de Stock

El sistema permite realizar movimientos de entrada y salida de stock, actualizando automáticamente los niveles de inventario.

```typescript
// Ejemplo de creación de un movimiento
const movimiento = await prisma.movements.create({
  data: {
    caja_id: 1,
    cantidad: 10,
    tipo_movimiento: 1, // 1 = ENTRADA // 2 = SALIDA
    fecha: new Date(),
    usuario_id: 1,
  },
});
```

### Sistema de Alertas

Cuando el stock de una caja cae por debajo del umbral definido, se genera automáticamente una alerta y se envía un correo electrónico al encargado de compras.

```typescript
// Verificar si el stock es bajo
if (nuevoStock <= box.alerta_umbral) {
  // Crear alerta y enviar correo
  // ...
}
```

### Gestión de Alertas

Las alertas pasan por tres estados:

1. **PENDIENTE**: Recién creada, sin gestionar
2. **GESTIONADO**: En proceso de resolución
3. **FINALIZADO**: Problema resuelto


```typescript
// Actualizar estado de alerta
await prisma.alerts.update({
  where: { id },
  data: {
    estado: AlertStatus.GESTIONADO,
    fecha_gestion: new Date(),
    gestionado_por: userId,
  },
});
```

### Notificaciones por Correo

El sistema envía correos electrónicos automáticos cuando:

- Se genera una alerta de stock bajo
- Un administrador solicita el reenvío de una alerta


```typescript
// Enviar correo de alerta
await mailService.sendStockAlert({
  subject: `ALERTA: Stock bajo en ${box.tipo}`,
  boxName: box.tipo,
  medidas: box.medidas,
  currentStock: nuevoStock,
  threshold: box.alerta_umbral,
  boxId: box.id,
  supplierInfo: { /* ... */ },
});
```

### Dashboard

El sistema proporciona dashboards específicos para:

- **Administradores**: Vista completa con estadísticas, alertas pendientes y gestionadas
- **Usuarios**: Vista simplificada con cajas de stock bajo y su estado de gestión

## Autenticación y Autorización con JWT

El Sistema implementa autenticación y autorización mediante JSON Web Tokens (JWT), proporcionando un mecanismo seguro para proteger los endpoints de la API y controlar el acceso basado en roles.

### Características principales

- **Autenticación segura**: Sistema de login/registro con contraseñas cifradas mediante bcrypt
- **Tokens JWT**: Generación de tokens firmados con expiración configurable
- **Control de acceso por roles**: Diferenciación entre administradores (idRol=1) y usuarios regulares (idRol=2)
- **Protección de rutas**: Middleware que verifica la autenticidad de los tokens en cada solicitud
- **Gestión de sesiones sin estado**: No requiere almacenamiento de sesiones en el servidor


### Flujo de autenticación

1. El usuario se registra o inicia sesión con sus credenciales
2. El servidor valida las credenciales y genera un token JWT
3. El cliente almacena el token y lo incluye en el encabezado `Authorization` de cada solicitud
4. El servidor verifica el token y permite o deniega el acceso según el rol del usuario


### Endpoints de autenticación

| Método | Ruta | Descripción | Acceso
|-----|-----|-----|-----
| POST | `/auth/register` | Registro de nuevos usuarios | Público
| POST | `/auth/login` | Inicio de sesión | Público
| GET | `/auth/profile` | Obtener perfil del usuario actual | Autenticado


### Control de acceso

- **Usuarios (idRol=2)**: Pueden registrar movimientos, consultar inventario y ver el dashboard básico
- **Administradores (idRol=1)**: Acceso completo, incluyendo gestión de alertas, configuración del sistema y dashboard avanzado


### Configuración

El sistema utiliza dos variables de entorno principales:

- `JWT_SECRET`: Clave secreta para firmar los tokens
- `JWT_EXPIRATION`: Tiempo de validez de los tokens (por defecto: "1d")


### Uso en clientes

Para consumir los endpoints protegidos, los clientes deben:

1. Obtener un token mediante login
2. Incluir el token en todas las solicitudes:

```plaintext
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Esta implementación asegura que solo los usuarios autorizados puedan acceder a funcionalidades específicas del sistema, manteniendo la seguridad y la integridad de los datos.


## Pruebas

### Pruebas Unitarias

```shellscript
npm run test
```

### Pruebas e2e

```shellscript
npm run test:e2e
```

### Cobertura de Pruebas

```shellscript
npm run test:cov
```

## Pruebas con Postman

Se incluye una colección de Postman para probar los endpoints de la API. Puedes importarla desde el archivo `Sistema_Inventario.postman_collection.json`.

### Flujo de Trabajo Recomendado

1. Probar la creación de proveedores
2. Probar la creación de cajas
3. Probar la creación de usuarios
4. Probar movimientos de stock
5. Verificar la generación automática de alertas
6. Probar la gestión de alertas
7. Verificar los dashboards


## Despliegue

### Preparación

1. Compilar la aplicación:

```shellscript
npm run build
```


2. Configurar variables de entorno para producción


### Opciones de Despliegue

#### Servidor Tradicional

```shellscript
npm run start:prod
```

#### Docker

```shellscript
docker build -t sistema-inventario-backend .
docker run -p 3000:3000 sistema-inventario-backend
```


## Mantenimiento

### Migraciones de Base de Datos

Para crear una nueva migración después de cambiar el esquema:

```shellscript
npx prisma migrate dev --name nombre_migracion
```

### Actualización de Dependencias

```shellscript
npm update
```

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos**

1. Verificar que la URL de conexión en `.env` sea correcta
2. Comprobar que el servidor MySQL esté en ejecución



2. **Error al enviar correos**

1. Verificar la configuración del servicio de correo
2. Comprobar que el correo del encargado de compras esté configurado
2. Comprobar que el app password este configurado.



3. **Prisma Client no generado**

1. Ejecutar `npx prisma generate`





## Contribución

1. Hacer fork del repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request


## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contacto

Para cualquier consulta o sugerencia, por favor contacta a:

- Email: [nicolasorbe4@gmail.com](mailto:nicolasorbe4@gmail.com)
- GitHub: [nicolasorbe1337](https://github.com/nicolasorbe1337)


```plaintext

```
# AGENTS.md — Guía de Contexto y Reglas de Desarrollo para Agentes IA (BigBangDelivery)

Este documento define la arquitectura, normas, modelos y restricciones del proyecto **BigBangDelivery** (Fundación Horizonte Sostenible - FHS / Universidad Politécnica Salesiana - UPS). Cualquier agente autónomo de programación (OpenCode / OpenClaw) debe seguir estrictamente los lineamientos descritos en esta guía antes de modificar o crear código.

---

## 🎯 Rol Asignado del Agente: Programador 1 (Líder Técnico - 240h)

**INSTRUCCIÓN PRIORITARIA:** En este repositorio, el usuario desempeña el rol de **Programador 1 (Líder Técnico)**. Por lo tanto, tú (como agente asistente) operarás estrictamente bajo la jurisdicción del **Programador 1**.
- **Tu alcance directo de modificación:** Infraestructura base, `docker-compose.yml`, `.env.example`, `.github/`, `backend/src/database/`, `backend/src/common/`, `backend/src/modules/auth/`, `backend/src/modules/users/`, `backend/src/modules/subscriptions/`, `backend/src/modules/admin-panel/`, `frontend/src/context/AuthContext.tsx`, `frontend/src/services/auth.service.ts` y `frontend/src/pages/admin/`.
- **Regla de aislamiento:** No modifiques los módulos exclusivos del Programador 2 (`catalog`, `orders`, `pages/buyer`) ni del Programador 3 (`seller-management`, `pages/seller`) a menos que el usuario te lo indique explícitamente por motivos de integración o arquitectura como Líder Técnico.

---

## 1. Resumen y Propósito del Sistema

**BigBangDelivery** es una plataforma digital comunitaria multivendedor (marketplace) y de servicios comunales orientada a fortalecer la economía popular y solidaria.

- **Propósito:** Digitalizar la oferta comercial de pequeños productores, comerciantes y prestadores de servicios comunales mediante tiendas virtuales, gestión de catálogo, pedidos y administración.
- **Roles Principales del Sistema:**
  1. `comprador`: Explora el catálogo, filtra por categorías, agrega items al carrito, realiza pedidos y solicita servicios comunales.
  2. `vendedor`: Administra su tienda virtual, gestiona inventario (perecibles, no perecibles, servicios), atiende solicitudes/pedidos y postula historias promocionales de sus productos.
  3. `administrador`: Supervisa usuarios y comercios, aprueba/suspende tiendas, modera historias promocionales, autoriza solicitudes de modificación de datos fiscales y administra planes comerciales y comisiones.
- **Flujo General de Negocio:**
  - Autenticación segura mediante JWT (`/api/auth/registro`, `/api/auth/login`).
  - Exploración y búsqueda de productos/servicios en el catálogo.
  - Gestión de carrito de compras (`ItemCarrito`) y emisión de pedidos (`Pedido`, `DetallePedido`) con desglose de subtotal, costo de envío e IVA (15%).
  - Procesamiento del pedido por el vendedor (confirmar o declinar con motivo).
  - Trazabilidad independiente entre el estado comercial/logístico (`estadoPedido`) y el estado financiero (`estadoPago`).

---

## 2. Stack Tecnológico Exacto

*(Nota de arquitectura: El proyecto utiliza un stack unificado **Full-Stack en TypeScript**; se descartan explícitamente Angular y Django/Spring Boot).*

- **Frontend:**
  - **Framework / Librería:** React 18+ con Vite.
  - **Lenguaje:** TypeScript.
  - **Gestión de Estado:** React Context API (`AuthContext.tsx`, `CartContext.tsx`).
  - **Iconos / UI:** Lucide React (`lucide-react`), CSS global (`index.css`, `App.css`).
  - **Puerto de desarrollo:** `http://localhost:5173`.
- **Backend:**
  - **Framework:** NestJS (Node.js).
  - **Lenguaje:** TypeScript.
  - **Arquitectura Backend:** Monolito Modular basado en `@Module()`.
  - **Seguridad & Autenticación:** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` (hash de contraseñas).
  - **Validación de Entradas:** `class-validator`, `class-transformer`, `ValidationPipe` global.
  - **ORM:** TypeORM (`@nestjs/typeorm`, `typeorm`).
  - **Puerto de desarrollo:** `http://localhost:3000` (con prefijo global `/api`).
- **Base de Datos:**
  - **Motor:** PostgreSQL 16.
  - **Entorno Local:** Contenedor Docker (`big_ban_postgres_db`) expuesto en el puerto `5432` vía `docker-compose.yml`.

---

## 3. Arquitectura y Estructura de Carpetas

### Estructura General del Repositorio (`big-ban-delivery/`)

```text
big-ban-delivery/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md      <-- Plantilla de Pull Request [Prog 1]
├── docker-compose.yml                <-- Servicio PostgreSQL 16 en puerto 5432 [Prog 1]
├── .env.example                      <-- Variables de entorno base [Prog 1]
├── README.md                         <-- Documentación general
├── backend/                          <-- Servidor NestJS
└── frontend/                         <-- Aplicación cliente React + Vite
```

### Backend (`backend/src/`)

```text
backend/src/
├── main.ts                           <-- Punto de entrada (Puerto 3000, ValidationPipe, prefijo /api) [Prog 1]
├── app.module.ts                     <-- Módulo orquestador raíz [Prog 1]
├── common/                           <-- Guards JWT (jwt-auth.guard.ts), middlewares, interceptores [Prog 1]
├── database/                         <-- Conexión PostgreSQL / TypeORM (database.module.ts, typeorm.config.ts) [Prog 1]
└── modules/                          <-- Módulos de dominio funcional
    ├── auth/                         <-- Registro, login, hash bcrypt, JwtStrategy [Prog 1]
    ├── users/                        <-- Perfiles de usuario, roles, GET /users/perfil [Prog 1]
    ├── subscriptions/                <-- Planes comerciales y suscripciones [Prog 1]
    ├── admin-panel/                  <-- Moderación, aprobación de tiendas e historias [Prog 1]
    ├── catalog/                      <-- Catálogo, productos, categorías y servicios [Prog 2]
    ├── orders/                       <-- Carrito, checkout y gestión de pedidos [Prog 2]
    └── seller-management/            <-- Inventarios, tiendas y postulación de historias [Prog 3]
```

### Frontend (`frontend/src/`)

```text
frontend/src/
├── main.tsx                          <-- Punto de entrada de React
├── App.tsx                           <-- Enrutador general y vistas
├── types/
│   └── index.ts                      <-- Interfaces TypeScript compartidas (User, Product, Order, etc.)
├── context/
│   ├── AuthContext.tsx               <-- Estado global de autenticación [Prog 1]
│   └── CartContext.tsx               <-- Estado global del carrito [Prog 2]
├── services/
│   ├── auth.service.ts               <-- Consumo de API /auth y /users [Prog 1]
│   ├── buyer.service.ts              <-- Consumo de API /catalog y /orders [Prog 2]
│   └── seller.service.ts             <-- Consumo de API /seller-management [Prog 3]
└── pages/
    ├── admin/                        <-- Vistas de Administrador [Prog 1]
    ├── buyer/                        <-- Catálogo, Ficha Producto, Carrito, Mis Compras [Prog 2]
    └── seller/                       <-- Panel Vendedor, Publicar Producto, Mis Ventas [Prog 3]
```

### Matriz de Responsabilidades por Programador

- **Programador 1 (Líder Técnico - 240h) [ROL ACTUAL]:** Infraestructura base, `database/`, `common/`, `auth/`, `users/`, `subscriptions/`, `admin-panel/`, `pages/admin/`, `AuthContext.tsx`, `auth.service.ts`, `docker-compose.yml`.
- **Programador 2 (E-Commerce Comprador - 120h):** `modules/catalog/`, `modules/orders/`, `pages/buyer/`, `CartContext.tsx`, `buyer.service.ts`.
- **Programador 3 (E-Commerce Vendedor - 120h):** `modules/seller-management/`, `pages/seller/`, `seller.service.ts`.

---

## 4. Modelos de Datos y Base de Datos

### Tipos y Enumeraciones Estandarizadas (`frontend/src/types/index.ts`)

- `RolUsuario`: `'comprador' | 'vendedor' | 'administrador'`
- `EstadoUsuario`: `'activo' | 'inactivo' | 'pendiente' | 'suspendido'`
- `EstadoTienda`: `'pendiente' | 'aprobado' | 'suspendido'`
- `EstadoProducto`: `'publicado' | 'borrador' | 'agotado' | 'desactivado'`
- `EstadoPedido`: `'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'completado' | 'cancelado'`
- `EstadoPago`: `'pendiente' | 'pagado' | 'rechazado' | 'reembolsado'`
- `EstadoSuscripcion`: `'activa' | 'vencida' | 'cancelada'`

### Entidades Principales

1. **Usuario (`usuarios`):** `id` (UUID), `numeroCedula` (único), `nombres`, `apellidos`, `email` (único), `telefono`, `password` (hash bcrypt), `rol`, `estado`, `direccionPrincipal`, `fechaCreacion`.
2. **Tienda (`tiendas` / `perfiles_vendedor`):** `id` (UUID), `vendedorId` (FK -> Usuario), `nombreComercial`, `ruc` (13 dígitos), `categoriaPrincipal`, `descripcion`, `direccion`, `telefono`, `emailComercial`, `logotipoUrl`, `horarioAtencion`, `estado`.
3. **Categoria (`categorias`):** `id`, `nombre`, `descripcion`, `icono`, `activa`.
4. **Producto (`productos`):** `id`, `tiendaId` (FK -> Tienda), `categoriaId` (FK -> Categoria), `nombre`, `descripcion`, `precio` (DECIMAL 10,2), `unidadMedida` (`'unidad'`, `'kg'`, `'libra'`, `'paquete'`), `stock`, `imagenUrl`, `estado`.
   - *Clasificación en Inventario:* Perecible (requiere `fechaCaducidad` y `condicionesAlmacenamiento`), No Perecible (stock estándar), Servicio (`cuposDiarios`, `duracionEstimada`, `modalidad`: `'presencial' | 'a_domicilio' | 'virtual'`).
5. **ProductoDetalle (`producto_detalles`):** `id`, `productoId` (FK -> Producto), `marca`, `garantia`, `dimensiones`, `peso`, `caracteristicasAdicionales`, `especificacionesTecnicas`.
6. **Pedido (`pedidos`):** `id` (UUID), `numeroPedido` (ej: `'PED-2026-001'`), `compradorId` (FK -> Usuario), `tiendaId` (FK -> Tienda), `subtotal`, `costoEnvio`, `descuento`, `total`, `estadoPedido`, `estadoPago`, `medioPago`, `direccionEntrega`, `observaciones`, `fechaCreacion`.
7. **DetallePedido (`detalles_pedido`):** `id`, `pedidoId` (FK -> Pedido), `productoId` (FK -> Producto), `nombreProducto`, `cantidad`, `precioUnitario`, `subtotal`.
8. **Servicio (`servicios`):** `id`, `prestadorId` (FK -> Usuario), `categoriaId`, `nombre`, `descripcion`, `precioReferencial`, `modalidadCotizacion` (`'por_hora' | 'precio_fijo' | 'a_convenir'`), `zonaAtencion`, `disponible`, `estado`.
9. **PlanSuscripcion & SuscripcionVendedor:** Gestión de planes comerciales con límite de productos, vigencia en días y porcentaje de comisión.

### Reglas de Negocio a Nivel de Datos

- **Nombres de Atributos:** En TypeScript/JSON se escriben en español `camelCase` (`numeroCedula`, `direccionPrincipal`, `costoEnvio`). En la base de datos PostgreSQL/TypeORM se mapean a `snake_case` (`numero_cedula`, `direccion_principal`, `fecha_creacion`).
- **Desglose de IVA:** Cálculo con tarifa oficial del **15% IVA** sobre el subtotal.
- **Independencia Financiera/Logística:** Los estados `estadoPedido` (logístico/comercial) y `estadoPago` (financiero) nunca se fusionan. Un pedido no se marca como pagado automáticamente sin la validación correspondiente.

---

## 5. Convenciones de Código y Patrones

### Backend (NestJS)

- **Activación de `ValidationPipe` Global (`main.ts`):**
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  ```
- **Uso de DTOs:** Replicar las interfaces de negocio en clases DTO utilizando decoradores de `class-validator` (`@IsEmail()`, `@IsNotEmpty()`, `@IsString()`, `@MinLength()`, `@IsEnum()`).
- **Protección de Rutas:** Endpoints privados deben decorarse con `@UseGuards(JwtAuthGuard)`. El `JwtStrategy` extrae el Bearer Token e inyecta `{ id, email, rol }` en `req.user`.

### Git Workflow y Convención de Commits

- **Regla de Oro:** Estrictamente prohibido realizar commits directos en la rama `main`.
- **Nomenclatura de Ramas:** `feature/<modulo>-<descripcion-corta>` o `fix/<modulo>-<descripcion-corta>`.

---

## 6. Reglas Estrictas y Restricciones (Qué NO Hacer)

1. ❌ **NO realizar importaciones cruzadas del Backend al Frontend (`../../../frontend/...`):** El servidor NestJS debe ser 100% independiente para compilar en su contenedor Docker sin depender de archivos del cliente. Los DTOs deben residir dentro del backend.
2. ❌ **NO utilizar Supabase u otros servicios BaaS en la nube:** El proyecto exige el uso de la base de datos PostgreSQL ejecutada en el contenedor local Docker (`big_ban_postgres_db`).
3. ❌ **NO implementar Facturación Electrónica Real SRI (Archivos `.p12` o clientes SOAP):** La facturación electrónica real con firma digital XAdES-BES y conexión SOAP con el SRI está excluida del MVP. Solo deben generarse comprobantes y facturas internas de prueba con desglose del 15% de IVA.
4. ❌ **NO modificar carpetas fuera del rol asignado (Programador 1):** No editar archivos pertenecientes a los módulos de Programador 2 o Programador 3 sin autorización explícita del usuario.
5. ❌ **NO almacenar contraseñas en texto plano:** Todas las contraseñas deben ser encriptadas obligatoriamente mediante `bcrypt` (sal de 10 rondas mínimo).
6. ❌ **NO hacer bypass de validaciones de entrada:** Toda petición HTTP debe ser filtrada y validada mediante DTOs y `ValidationPipe`.
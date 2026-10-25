# 🛒 Big Ban - Plataforma E-Commerce & Servicios Comunales

Plataforma digital multi-vendedor y de gestión de servicios comunales desarrollada en el marco del convenio entre la **Universidad Politécnica Salesiana (UPS)** y la **Fundación Horizonte Sostenible (FHS)**.

---

## 🛠️ Stack Tecnológico

* **Lenguaje:** TypeScript (Full-Stack)
* **Backend:** NestJS (Monolito Modular)
* **Frontend:** React + Vite
* **Base de Datos:** PostgreSQL 16
* **Entorno Local:** Docker & Docker Compose

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* Node.js (v20 o superior)
* Docker Desktop (debe estar abierto al ejecutar la base de datos)
* Git

---

## 🚀 Inicio Rápido Local

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd big-ban-delivery
```

### 2. Configurar variables de entorno
Copia el archivo de plantilla a `.env` en la raíz (y/o dentro de `backend/`):
```bash
cp .env.example .env
```

### 3. Iniciar la Base de Datos (PostgreSQL)
Asegúrate de que **Docker Desktop** esté abierto y ejecuta:
```bash
docker compose up -d
```

### 4. Iniciar el Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
> Servidor corriendo en `http://localhost:3000`

### 5. Iniciar el Frontend (React + Vite)
En otra terminal desde la raíz:
```bash
cd frontend
npm install
npm run dev
```
> Aplicación corriendo en `http://localhost:5173`

---

## 📂 Estructura del Repositorio

```text
big-ban-delivery/
├── .github/              # Plantillas de Pull Request
├── backend/              # API REST con NestJS (Auth, Usuarios, Catálogo, Pedidos, Vendedor)
├── frontend/             # Cliente React + Vite (Paneles Admin, Comprador y Vendedor)
├── docker-compose.yml    # Contenedor local de PostgreSQL
├── .env.example          # Plantilla de variables de entorno
└── README.md             # Documentación principal
```

---

## 🌿 Flujo de Git y Commits

* **Ramas prohibidas para commit directo:** `main` (usar siempre Pull Requests).
* **Nombres de ramas:**
  * `feature/<modulo>-<descripcion-corta>` *(Ej: `feature/catalog-product-list`)*
  * `fix/<modulo>-<descripcion-corta>` *(Ej: `fix/auth-login-jwt`)*
* **Formato de Commits:** `<tipo>(<módulo>): <descripción>`
  * `feat(catalog): agregar catálogo de productos`
  * `fix(orders): corregir cálculo de subtotal`

---

## 👥 Reparto de Carga Horaria y Módulos

* **Programador 1 (Líder Técnico - 240h):** Infraestructura, Auth, Usuarios, Suscripciones y Panel Admin.
* **Programador 2 (E-Commerce Comprador - 120h):** Catálogo, Búsqueda, Carrito y Pedidos.
* **Programador 3 (E-Commerce Vendedor - 120h):** Panel del Comercio, Publicación de Productos y Gestión de Ventas.

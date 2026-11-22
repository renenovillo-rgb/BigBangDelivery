import type {
  Categoria, EstadoSolicitud, EstadoTienda, Pedido, PlanSuscripcion, Producto, SolicitudActualizacionPerfil,
  SolicitudHistoriaProducto, Usuario,
} from '../types';
import { SELLERS } from '../pages/buyer/catalog';
import {
  INITIAL_CHANGE_REQUESTS, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_STORIES, PLAN, buildOrder, item,
} from '../pages/seller/sellerData';
import { dateKey, daysFromNow, stamp } from '../components/utils';

/* ------------------------------------------------------------------ */
/*  Datos simulados de la plataforma (se reemplazan al conectar la API) */
/*  Los datos de la tienda "store-1" son los del panel del vendedor.     */
/* ------------------------------------------------------------------ */

export interface Vendor {
  id: string;
  tiendaId: string;
  /** Id del perfil público que ve el comprador en "Conoce quiénes somos" */
  catalogId?: string;
  tipo: 'productor' | 'prestador';
  nombreCompleto: string;
  nombreComercial: string;
  email: string;
  telefono: string;
  identificacionFiscal: string;
  direccionNegocio: string;
  establecimiento: string;
  puntoEmision: string;
  categoriaPrincipal: string;
  estado: EstadoTienda;
  motivoSuspension?: string;
  fechaRegistro: string;
  planId: string;
  suscripcionFin: string;
}

export interface PublicProfileChanges {
  tagline?: string;
  location?: string;
  about?: string;
  activities?: string[];
}

export interface ProfileRequest {
  id: string;
  vendedorId: string;
  cambios: PublicProfileChanges;
  justificacion: string;
  estado: EstadoSolicitud;
  respuestaAdmin?: string;
  fechaCreacion: string;
}

export interface ActivityEntry {
  id: string;
  texto: string;
  fecha: string;
  tono: 'ok' | 'warn' | 'error';
}

/* --------------------------------- Planes --------------------------------- */

export const INITIAL_PLANS: PlanSuscripcion[] = [
  { id: 'PLAN-BAS', nombre: 'Plan Básico', precioMensual: 4.99, duracionDias: 30, limiteProductos: 5, comisionPorcentaje: 8, activo: true },
  PLAN,
  { id: 'PLAN-PRO', nombre: 'Plan Profesional', precioMensual: 24.99, duracionDias: 30, limiteProductos: 50, comisionPorcentaje: 3, activo: true },
];

/* ------------------------------- Vendedores ------------------------------- */

const vendor = (
  n: number, tipo: Vendor['tipo'], catalogId: string | undefined, nombreCompleto: string, nombreComercial: string,
  ruc: string, direccion: string, categoria: string, estado: EstadoTienda, planId: string, registroDias: number, venceDias: number,
  extra: Partial<Vendor> = {},
): Vendor => ({
  id: `SEL-00${n}`,
  tiendaId: `store-${n}`,
  catalogId,
  tipo,
  nombreCompleto,
  nombreComercial,
  email: `contacto${n}@bigban.test`,
  telefono: `09${String(80000000 + n * 1234567).slice(0, 8)}`,
  identificacionFiscal: ruc,
  direccionNegocio: direccion,
  establecimiento: '001',
  puntoEmision: '001',
  categoriaPrincipal: categoria,
  estado,
  fechaRegistro: dateKey(daysFromNow(-registroDias)),
  planId,
  suscripcionFin: dateKey(daysFromNow(venceDias)),
  ...extra,
});

export const INITIAL_VENDORS: Vendor[] = [
  vendor(1, 'productor', 'gomez', 'Alexis Sebastian Gómez', 'Distribuidora Gómez & Hijos', '0102030405001',
    'Av. Huayna Cápac y Calle Larga, Cuenca', 'Alimentos', 'aprobado', 'PLAN-EMP', 60, 20,
    { email: 'alexis.gomez@ejemplo.com', telefono: '0998765432' }),
  vendor(2, 'productor', 'horizonte', 'Fundación Horizonte Sostenible', SELLERS.horizonte.name, '1790012345001',
    'Panamericana Norte km 12, Quito', 'Hortalizas', 'aprobado', 'PLAN-PRO', 180, 12),
  vendor(3, 'productor', 'agroandina', 'María Cachimuel', SELLERS.agroandina.name, '1791234567001',
    'Cayambe, Pichincha', 'Granos y tubérculos', 'aprobado', 'PLAN-EMP', 120, 5),
  vendor(4, 'productor', 'lacteos', 'José Almeida', SELLERS.lacteos.name, '1709876543001',
    'Machachi, Pichincha', 'Lácteos', 'aprobado', 'PLAN-BAS', 90, 25),
  vendor(5, 'prestador', 'mecanico-andes', 'Carlos Tapia', SELLERS['mecanico-andes'].name, '1712345678001',
    'Norte de Quito', 'Servicios del hogar', 'aprobado', 'PLAN-BAS', 75, 18),
  vendor(6, 'productor', undefined, 'Rosa Quishpe', 'Panadería Sol Naciente', '1723456789001',
    'Calderón, Quito', 'Alimentos', 'pendiente', 'PLAN-BAS', 2, 28),
  vendor(7, 'productor', 'frutales', 'Familia Toapanta', SELLERS.frutales.name, '1803456789001',
    'Píllaro, Tungurahua', 'Frutas', 'suspendido', 'PLAN-BAS', 150, -3,
    { motivoSuspension: 'Tres reclamos de compradores por fruta en mal estado en la última semana.' }),
  vendor(8, 'prestador', 'electricista-ruiz', 'Luis Ruiz', SELLERS['electricista-ruiz'].name, '1704567890001',
    'Quito urbano', 'Servicios del hogar', 'aprobado', 'PLAN-EMP', 45, 9),
];

/* ------------------------------- Publicaciones ------------------------------- */

const other = (
  id: string, tiendaId: string, nombre: string, categoria: string, precio: number, estado: Producto['estado'],
  extra: Partial<Producto> = {},
): Producto => ({
  id, tiendaId, categoriaId: `cat-${categoria.toLowerCase()}`, categoriaNombre: categoria, nombre,
  descripcion: `${nombre}: producto de calidad de productores de la comunidad.`,
  precio, tipo: 'NO_PERECIBLE', estado, stock: 30, unidadMedida: 'unidad', imagenUrl: '', ...extra,
});

export const INITIAL_PLATFORM_PRODUCTS: Producto[] = [
  ...INITIAL_PRODUCTS,
  other('PROD-101', 'store-2', 'Lechuga crespa hidropónica', 'Hortalizas', 2.6, 'PUBLICADO', { tipo: 'PERECIBLE', unidadMedida: 'malla' }),
  other('PROD-102', 'store-2', 'Albahaca hidropónica', 'Hortalizas', 1.8, 'PENDIENTE_REVISION', { tipo: 'PERECIBLE', unidadMedida: 'atado', stock: 40, fechaCaducidad: dateKey(daysFromNow(6)) }),
  other('PROD-103', 'store-3', 'Quinua roja 1 kg', 'Granos', 4.2, 'PENDIENTE_REVISION', { unidadMedida: 'bolsa', stock: 80 }),
  other('PROD-104', 'store-3', 'Zanahoria orgánica', 'Hortalizas', 1.2, 'PUBLICADO', { tipo: 'PERECIBLE', unidadMedida: 'funda' }),
  other('PROD-105', 'store-4', 'Queso fresco artesanal', 'Lácteos', 3.5, 'PUBLICADO', { tipo: 'PERECIBLE', unidadMedida: 'unidad' }),
  other('PROD-106', 'store-6', 'Pan de masa madre', 'Alimentos', 2.0, 'PENDIENTE_REVISION', { tipo: 'PERECIBLE', stock: 25, fechaCaducidad: dateKey(daysFromNow(3)) }),
  other('PROD-107', 'store-5', 'Mecánica general a domicilio', 'Servicios del hogar', 18, 'PUBLICADO', {
    tipo: 'SERVICIO', stock: undefined, unidadMedida: undefined, duracionServicio: '1 hora', modalidadServicio: 'A_DOMICILIO', cuposDiarios: 4,
  }),
];

/* --------------------------------- Pedidos --------------------------------- */

const o = (
  n: number, tiendaId: string, customer: string, items: ReturnType<typeof item>[], estado: Pedido['estadoPedido'],
  daysAgo: number, hour: number, pay: string,
): Pedido => buildOrder(n, customer, items, estado, daysAgo, hour, 15, {
  tiendaId,
  medioPago: pay,
  estadoPago: estado === 'COMPLETADO' || pay !== '01' ? 'pagado' : 'pendiente',
  invoiced: estado !== 'PENDIENTE' && estado !== 'CANCELADO',
  costoEnvio: 2.5,
  motivoCancelacion: estado === 'CANCELADO' ? 'El comprador no respondió al contacto.' : undefined,
});

export const INITIAL_PLATFORM_ORDERS: Pedido[] = [
  ...INITIAL_ORDERS,
  o(2008, 'store-2', 'maria', [item('h1', 'PROD-101', 'Lechuga crespa hidropónica', 6, 2.6, 'malla')], 'PENDIENTE', 0, 10, '19'),
  o(2007, 'store-3', 'carlos', [item('a1', 'PROD-104', 'Zanahoria orgánica', 5, 1.2, 'funda'), item('a2', 'PROD-103', 'Quinua roja 1 kg', 2, 4.2, 'bolsa')], 'EN_PREPARACION', 0, 9, '20'),
  o(2006, 'store-4', 'lucia', [item('l1', 'PROD-105', 'Queso fresco artesanal', 4, 3.5, 'unidad')], 'LISTO', 1, 15, '01'),
  o(2005, 'store-5', 'juan', [item('m1', 'PROD-107', 'Mecánica general a domicilio', 1, 18, 'servicio')], 'COMPLETADO', 2, 11, '01'),
  o(2004, 'store-2', 'pedro', [item('h2', 'PROD-101', 'Lechuga crespa hidropónica', 10, 2.6, 'malla')], 'COMPLETADO', 3, 16, '19'),
  o(2003, 'store-3', 'maria', [item('a3', 'PROD-104', 'Zanahoria orgánica', 8, 1.2, 'funda')], 'COMPLETADO', 4, 12, '20'),
  o(2002, 'store-4', 'carlos', [item('l2', 'PROD-105', 'Queso fresco artesanal', 2, 3.5, 'unidad')], 'CANCELADO', 5, 9, '01'),
  o(2001, 'store-2', 'lucia', [item('h3', 'PROD-101', 'Lechuga crespa hidropónica', 12, 2.6, 'malla')], 'COMPLETADO', 7, 14, '19'),
  o(2000, 'store-5', 'pedro', [item('m2', 'PROD-107', 'Mecánica general a domicilio', 2, 18, 'servicio')], 'COMPLETADO', 9, 10, '20'),
];

/* --------------------------- Historias y solicitudes --------------------------- */

const story = (
  id: string, codigo: string, productoId: string, nombre: string, vendedorId: string, texto: string, daysAgo: number,
): SolicitudHistoriaProducto => ({
  id, codigoHistoria: codigo, productoId, nombreProducto: nombre, vendedorId, historiaPropuesta: texto,
  mediaUrl: '', estado: 'EN_REVISION', fechaCreacion: stamp(daysFromNow(-daysAgo, 11, 0)),
});

export const INITIAL_PLATFORM_STORIES: SolicitudHistoriaProducto[] = [
  ...INITIAL_STORIES,
  story('s-201', 'HIS-201', 'PROD-101', 'Lechuga crespa hidropónica', 'SEL-002',
    'Nuestras lechugas crecen en agua recirculada dentro de invernaderos de la Fundación. Cada cosecha se reparte el mismo día a familias de Quito, sin pesticidas y con un 90% menos de agua que el cultivo tradicional.', 1),
  story('s-202', 'HIS-202', 'PROD-104', 'Zanahoria orgánica', 'SEL-003',
    'Las familias de la cooperativa cultivan zanahoria con rotación de cultivos y abonos naturales. Cada funda apoya directamente a pequeños agricultores de Cayambe que mantienen sus terrenos desde hace tres generaciones.', 3),
];

export const INITIAL_FISCAL_REQUESTS: SolicitudActualizacionPerfil[] = [
  ...INITIAL_CHANGE_REQUESTS,
  {
    id: 'REQ-101', vendedorId: 'SEL-003', campoAModificar: 'telefono', valorActual: '0991234567', nuevoValor: '0987766554',
    justificacion: 'Cambié de operadora y el número anterior ya no existe.', estado: 'PENDIENTE', fechaCreacion: stamp(daysFromNow(-1, 15, 20)),
  },
  {
    id: 'REQ-102', vendedorId: 'SEL-002', campoAModificar: 'direccionNegocio', valorActual: 'Panamericana Norte km 12, Quito',
    nuevoValor: 'Panamericana Norte km 14, Calderón, Quito', justificacion: 'Trasladamos las bodegas a un nuevo local.',
    estado: 'PENDIENTE', fechaCreacion: stamp(daysFromNow(-2, 9, 40)),
  },
];

export const INITIAL_PROFILE_REQUESTS: ProfileRequest[] = [
  {
    id: 'PUB-001', vendedorId: 'SEL-002',
    cambios: { tagline: 'Hidroponía con propósito para tu mesa', activities: ['Cultivo hidropónico', 'Huevos de libre pastoreo', 'Frutos rojos agroecológicos', 'Entrega el mismo día', 'Talleres de huertos urbanos'] },
    justificacion: 'Actualizamos nuestro lema e incorporamos los talleres.', estado: 'PENDIENTE', fechaCreacion: stamp(daysFromNow(0, 8, 30)),
  },
];

/* ------------------------------ Usuarios y categorías ------------------------------ */

const user = (id: string, nombres: string, apellidos: string, rol: Usuario['rol'], estado: Usuario['estado'], dias: number): Usuario => ({
  id, numeroCedula: `17${String(10000000 + Number(id.slice(-2)) * 77777).slice(0, 8)}`, nombres, apellidos,
  email: `${nombres.split(' ')[0].toLowerCase()}.${apellidos.split(' ')[0].toLowerCase()}@bigban.test`,
  telefono: `09${String(70000000 + Number(id.slice(-2)) * 91357).slice(0, 8)}`,
  rol, estado, fechaCreacion: dateKey(daysFromNow(-dias)),
});

export const INITIAL_USERS: Usuario[] = [
  user('USR-01', 'Admin', 'General', 'administrador', 'activo', 200),
  user('USR-02', 'Alexis Sebastian', 'Gómez', 'vendedor', 'activo', 60),
  user('USR-03', 'María', 'Cachimuel', 'vendedor', 'activo', 120),
  user('USR-04', 'Rosa', 'Quishpe', 'vendedor', 'pendiente', 2),
  user('USR-05', 'Familia', 'Toapanta', 'vendedor', 'suspendido', 150),
  user('USR-06', 'Juan', 'Pérez', 'comprador', 'activo', 80),
  user('USR-07', 'María', 'Torres', 'comprador', 'activo', 70),
  user('USR-08', 'Carlos', 'Andrade', 'comprador', 'activo', 40),
  user('USR-09', 'Lucía', 'Mendoza', 'comprador', 'activo', 22),
  user('USR-10', 'Pedro', 'Zhunio', 'comprador', 'inactivo', 15),
];

export const INITIAL_CATEGORIES: Categoria[] = [
  { id: 'CAT-1', nombre: 'Alimentos', descripcion: 'Conservas, miel, panadería y productos procesados.', activa: true },
  { id: 'CAT-2', nombre: 'Lácteos', descripcion: 'Leche, quesos, yogur y derivados.', activa: true },
  { id: 'CAT-3', nombre: 'Hortalizas', descripcion: 'Verduras y hojas frescas.', activa: true },
  { id: 'CAT-4', nombre: 'Frutas', descripcion: 'Fruta fresca de temporada.', activa: true },
  { id: 'CAT-5', nombre: 'Granos', descripcion: 'Quinua, fréjol, lenteja y cereales.', activa: true },
  { id: 'CAT-6', nombre: 'Artesanías', descripcion: 'Productos hechos a mano por la comunidad.', activa: true },
  { id: 'CAT-7', nombre: 'Servicios del hogar', descripcion: 'Mecánica, electricidad, plomería y más.', activa: true },
  { id: 'CAT-8', nombre: 'Tecnología', descripcion: 'Reparación y soporte técnico.', activa: false },
];

export const INITIAL_LOG: ActivityEntry[] = [
  { id: 'LOG-1', texto: 'Se registró la tienda “Panadería Sol Naciente” (pendiente de aprobación).', fecha: stamp(daysFromNow(-2, 10, 5)), tono: 'warn' },
  { id: 'LOG-2', texto: 'Se aprobó la solicitud de teléfono de Distribuidora Gómez & Hijos.', fecha: stamp(daysFromNow(-30, 10, 30)), tono: 'ok' },
  { id: 'LOG-3', texto: 'Se suspendió la tienda “Frutales de Altura” por reclamos de calidad.', fecha: stamp(daysFromNow(-3, 16, 0)), tono: 'error' },
];

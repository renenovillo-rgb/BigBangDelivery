import type {
  EstadoPago, EstadoPedido, ItemPedido, ModalidadServicio, PerfilVendedor, Pedido, PlanSuscripcion,
  Producto, SolicitudActualizacionPerfil, SolicitudHistoriaProducto, SuscripcionVendedor, TipoItem,
} from '../../types';
import { IVA, dateKey, daysFromNow, round2, stamp } from './utils';

/* ------------------------------------------------------------------ */
/*  Datos simulados del vendedor (se reemplazan al conectar la API)     */
/* ------------------------------------------------------------------ */

export const INITIAL_PROFILE: PerfilVendedor = {
  id: 'SEL-001',
  usuarioId: 'USR-001',
  nombreCompleto: 'Alexis Sebastian Gómez',
  nombreComercial: 'Distribuidora Gómez & Hijos',
  fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  email: 'alexis.gomez@ejemplo.com',
  telefono: '0998765432',
  identificacionFiscal: '0102030405001',
  direccionNegocio: 'Av. Huayna Cápac y Calle Larga, Cuenca',
  establecimiento: '001',
  puntoEmision: '001',
  esEditable: false,
};

export interface SellerSettings {
  nuevosPedidos: boolean;
  stockBajo: boolean;
  historias: boolean;
  resumenSemanal: boolean;
  stockMinimo: number;
  horarioAtencion: string;
}

export const INITIAL_SETTINGS: SellerSettings = {
  nuevosPedidos: true,
  stockBajo: true,
  historias: true,
  resumenSemanal: false,
  stockMinimo: 5,
  horarioAtencion: 'Lun a Sáb · 08:00 - 18:00',
};

export const PLAN: PlanSuscripcion = {
  id: 'PLAN-EMP',
  nombre: 'Plan Emprendedor',
  precioMensual: 9.99,
  duracionDias: 30,
  limiteProductos: 10,
  comisionPorcentaje: 5,
  activo: true,
};

export const SUBSCRIPTION: SuscripcionVendedor = {
  id: 'SUB-001',
  tiendaId: 'store-1',
  planId: PLAN.id,
  fechaInicio: dateKey(daysFromNow(-10)),
  fechaFin: dateKey(daysFromNow(20)),
  estado: 'activa',
};

/* ------------------------------- Productos ------------------------------- */

export const INITIAL_PRODUCTS: Producto[] = [
  {
    id: 'PROD-001',
    tiendaId: 'store-1',
    categoriaId: 'cat-alimentos',
    categoriaNombre: 'Alimentos',
    nombre: 'Miel Artesanal 500g',
    descripcion: 'Miel 100% natural de flores silvestres recolectada localmente.',
    precio: 10.0,
    stock: 25,
    unidadMedida: 'frasco',
    tipo: 'PERECIBLE',
    estado: 'PUBLICADO',
    fechaCaducidad: dateKey(daysFromNow(400)),
    condicionesAlmacenamiento: 'Lugar fresco y seco',
    imagenUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-002',
    tiendaId: 'store-1',
    categoriaId: 'cat-lacteos',
    categoriaNombre: 'Lácteos',
    nombre: 'Queso Andino Madurado',
    descripcion: 'Queso artesanal elaborado con leche fresca de granja.',
    precio: 15.5,
    stock: 8,
    unidadMedida: 'kg',
    tipo: 'PERECIBLE',
    estado: 'PUBLICADO',
    fechaCaducidad: dateKey(daysFromNow(6)),
    condicionesAlmacenamiento: 'Refrigerado a 4°C',
    imagenUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-003',
    tiendaId: 'store-1',
    categoriaId: 'cat-servicios',
    categoriaNombre: 'Servicios',
    nombre: 'Asesoría en Huertos Urbanos',
    descripcion: 'Mantenimiento e instalación de cultivos orgánicos en casa.',
    precio: 25.0,
    tipo: 'SERVICIO',
    estado: 'PENDIENTE_REVISION',
    duracionServicio: '2 horas',
    modalidadServicio: 'A_DOMICILIO',
    cuposDiarios: 3,
    imagenUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-004',
    tiendaId: 'store-1',
    categoriaId: 'cat-hortalizas',
    categoriaNombre: 'Hortalizas',
    nombre: 'Lechuga hidropónica',
    descripcion: 'Lechuga crespa cosechada el mismo día, cultivada sin pesticidas.',
    precio: 1.2,
    stock: 3,
    unidadMedida: 'unidad',
    tipo: 'PERECIBLE',
    estado: 'PUBLICADO',
    fechaCaducidad: dateKey(daysFromNow(3)),
    condicionesAlmacenamiento: 'Refrigerado',
    imagenUrl: '',
  },
  {
    id: 'PROD-005',
    tiendaId: 'store-1',
    categoriaId: 'cat-alimentos',
    categoriaNombre: 'Alimentos',
    nombre: 'Mermelada de mora 250g',
    descripcion: 'Mermelada casera de mora de castilla, sin conservantes.',
    precio: 4.5,
    stock: 40,
    unidadMedida: 'frasco',
    tipo: 'NO_PERECIBLE',
    estado: 'PUBLICADO',
    imagenUrl: '',
  },
  {
    id: 'PROD-006',
    tiendaId: 'store-1',
    categoriaId: 'cat-hortalizas',
    categoriaNombre: 'Hortalizas',
    nombre: 'Canasta de hortalizas',
    descripcion: 'Selección semanal de hortalizas de temporada.',
    precio: 12.0,
    stock: 10,
    unidadMedida: 'canasta',
    tipo: 'PERECIBLE',
    estado: 'RECHAZADO',
    motivoRechazo: 'La imagen no corresponde al producto. Sube una foto real de la canasta.',
    fechaCaducidad: dateKey(daysFromNow(5)),
    imagenUrl: '',
  },
];

export interface ProductForm {
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaNombre: string;
  tipo: TipoItem;
  unidadMedida: string;
  stock: number;
  fechaCaducidad: string;
  condicionesAlmacenamiento: string;
  duracionServicio: string;
  modalidadServicio: ModalidadServicio;
  cuposDiarios: number;
  imagenUrl: string;
}

export const EMPTY_PRODUCT_FORM: ProductForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  categoriaNombre: '',
  tipo: 'NO_PERECIBLE',
  unidadMedida: 'unidad',
  stock: 0,
  fechaCaducidad: '',
  condicionesAlmacenamiento: '',
  duracionServicio: '',
  modalidadServicio: 'PRESENCIAL',
  cuposDiarios: 1,
  imagenUrl: '',
};

/* -------------------------------- Pedidos -------------------------------- */

const item = (
  id: string, productoId: string, nombreProducto: string, cantidad: number, precioUnitario: number, unidadMedida: string,
): ItemPedido => ({ id, productoId, nombreProducto, cantidad, precioUnitario, subtotal: round2(cantidad * precioUnitario), unidadMedida });

interface Customer { nombre: string; cedula: string; email: string; telefono: string; direccion: string }

const CUSTOMERS: Record<string, Customer> = {
  juan: { nombre: 'Juan Pérez', cedula: '0102345678', email: 'juan.perez@ejemplo.com', telefono: '0991234567', direccion: 'Calle Larga y Benigno Malo, Cuenca' },
  maria: { nombre: 'María Torres', cedula: '0104567890', email: 'maria.torres@ejemplo.com', telefono: '0987654321', direccion: 'Av. Remigio Crespo 3-45, Cuenca' },
  carlos: { nombre: 'Carlos Andrade', cedula: '0106789012', email: 'carlos.andrade@ejemplo.com', telefono: '0979876543', direccion: 'Gran Colombia y Tarqui, Cuenca' },
  lucia: { nombre: 'Lucía Mendoza', cedula: '0109012345001', email: 'lucia.mendoza@ejemplo.com', telefono: '0961237890', direccion: 'Av. Loja 12-30, Cuenca' },
  pedro: { nombre: 'Pedro Zhunio', cedula: '0103456789', email: 'pedro.zhunio@ejemplo.com', telefono: '0995551234', direccion: 'Sucre y Hermano Miguel, Cuenca' },
};

const buildOrder = (
  n: number, customer: keyof typeof CUSTOMERS, items: ItemPedido[], estadoPedido: EstadoPedido,
  daysAgo: number, hour: number, minute: number,
  extra: { medioPago?: string; estadoPago?: EstadoPago; costoEnvio?: number; invoiced?: boolean; motivoCancelacion?: string } = {},
): Pedido => {
  const c = CUSTOMERS[customer];
  const subtotal = round2(items.reduce((s, i) => s + i.subtotal, 0));
  const montoIva = round2(subtotal * IVA);
  const costoEnvio = extra.costoEnvio ?? 0;
  const created = stamp(daysFromNow(-daysAgo, hour, minute));
  return {
    id: `ORD-${n}`,
    numeroPedido: `ORD-${n}`,
    tiendaId: 'store-1',
    compradorId: `user-${customer}`,
    nombreCliente: c.nombre,
    identificacionCliente: c.cedula,
    emailCliente: c.email,
    telefonoCliente: c.telefono,
    direccionEntrega: c.direccion,
    subtotal,
    montoIva,
    costoEnvio,
    descuento: 0,
    total: round2(subtotal + montoIva + costoEnvio),
    medioPago: extra.medioPago ?? '01',
    estadoPedido,
    estadoPago: extra.estadoPago ?? 'pendiente',
    motivoCancelacion: extra.motivoCancelacion,
    numeroFactura: extra.invoiced ? `001-001-${String(n).padStart(9, '0')}` : undefined,
    fechaCreacion: created,
    fechaActualizacion: created,
    items,
  };
};

const MIEL = (q: number) => item(`m${q}`, 'PROD-001', 'Miel Artesanal 500g', q, 10, 'frasco');
const QUESO = (q: number) => item(`q${q}`, 'PROD-002', 'Queso Andino Madurado', q, 15.5, 'kg');
const LECHUGA = (q: number) => item(`l${q}`, 'PROD-004', 'Lechuga hidropónica', q, 1.2, 'unidad');
const MERMELADA = (q: number) => item(`e${q}`, 'PROD-005', 'Mermelada de mora 250g', q, 4.5, 'frasco');

export const INITIAL_ORDERS: Pedido[] = [
  buildOrder(1042, 'juan', [MIEL(2), QUESO(1)], 'PENDIENTE', 0, 9, 40, { costoEnvio: 2.5 }),
  buildOrder(1041, 'maria', [LECHUGA(2), MERMELADA(2)], 'PENDIENTE', 0, 8, 15, { medioPago: '19', estadoPago: 'pagado', costoEnvio: 2.5 }),
  buildOrder(1040, 'carlos', [QUESO(1), MIEL(1)], 'EN_PREPARACION', 1, 17, 5, { medioPago: '20', estadoPago: 'pagado', invoiced: true, costoEnvio: 2.5 }),
  buildOrder(1039, 'lucia', [MERMELADA(4)], 'LISTO', 1, 11, 30, { medioPago: '19', estadoPago: 'pagado', invoiced: true }),
  buildOrder(1038, 'pedro', [MIEL(3)], 'COMPLETADO', 2, 15, 0, { estadoPago: 'pagado', invoiced: true, costoEnvio: 2.5 }),
  buildOrder(1037, 'juan', [MIEL(1), MERMELADA(3)], 'COMPLETADO', 3, 10, 20, { medioPago: '20', estadoPago: 'pagado', invoiced: true }),
  buildOrder(1036, 'maria', [QUESO(2)], 'COMPLETADO', 4, 12, 10, { medioPago: '19', estadoPago: 'pagado', invoiced: true, costoEnvio: 2.5 }),
  buildOrder(1035, 'carlos', [LECHUGA(6)], 'CANCELADO', 5, 9, 0, { motivoCancelacion: 'Sin stock suficiente para la fecha solicitada.' }),
  buildOrder(1034, 'lucia', [MIEL(2), MERMELADA(2)], 'COMPLETADO', 6, 16, 45, { estadoPago: 'pagado', invoiced: true }),
  buildOrder(1033, 'pedro', [QUESO(3)], 'COMPLETADO', 9, 13, 30, { medioPago: '20', estadoPago: 'pagado', invoiced: true, costoEnvio: 2.5 }),
  buildOrder(1032, 'juan', [MIEL(4), LECHUGA(5)], 'COMPLETADO', 14, 10, 0, { estadoPago: 'pagado', invoiced: true }),
  buildOrder(1031, 'maria', [MERMELADA(6)], 'COMPLETADO', 21, 18, 15, { medioPago: '19', estadoPago: 'pagado', invoiced: true, costoEnvio: 2.5 }),
];

/* -------------------------------- Historias -------------------------------- */

export const INITIAL_STORIES: SolicitudHistoriaProducto[] = [
  {
    id: '1',
    codigoHistoria: 'HIS-001',
    productoId: 'PROD-001',
    nombreProducto: 'Miel Artesanal 500g',
    vendedorId: 'SEL-001',
    historiaPropuesta:
      'Esta miel se extrae de colmenas ubicadas en los valles altoandinos. Las familias apicultoras locales mantienen un proceso 100% orgánico sin refinados artificiales, preservando el ecosistema de abejas nativas.',
    mediaUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38',
    estado: 'PUBLICADA',
    observacionesAdmin: '¡Excelente narrativa! Ya está publicada en la sección destacada de la tienda.',
    fechaCreacion: stamp(daysFromNow(-20, 14, 30)),
  },
  {
    id: '2',
    codigoHistoria: 'HIS-002',
    productoId: 'PROD-002',
    nombreProducto: 'Queso Andino Madurado',
    vendedorId: 'SEL-001',
    historiaPropuesta:
      'Producido con leche de vacas alimentadas solo con pasto natural en zonas altas de Cuenca. Su maduración artesanal de 60 días le otorga un sabor único.',
    mediaUrl: '',
    estado: 'EN_REVISION',
    fechaCreacion: stamp(daysFromNow(-2, 9, 15)),
  },
  {
    id: '3',
    codigoHistoria: 'HIS-003',
    productoId: 'PROD-003',
    nombreProducto: 'Asesoría en Huertos Urbanos',
    vendedorId: 'SEL-001',
    historiaPropuesta: 'Enseñamos a cultivar alimentos en espacios reducidos de la ciudad.',
    mediaUrl: '',
    estado: 'RECHAZADA',
    observacionesAdmin:
      'La historia es muy corta. Por favor amplía la descripción indicando la experiencia de los instructores y fotos del proceso.',
    fechaCreacion: stamp(daysFromNow(-9, 11, 0)),
  },
];

/* ------------------------- Solicitudes de cambio de perfil ------------------------- */

export const INITIAL_CHANGE_REQUESTS: SolicitudActualizacionPerfil[] = [
  {
    id: 'REQ-001',
    vendedorId: 'SEL-001',
    campoAModificar: 'telefono',
    valorActual: '0998000000',
    nuevoValor: '0998765432',
    justificacion: 'Renové mi número de contacto.',
    estado: 'APROBADA',
    respuestaAdmin: 'Dato actualizado correctamente.',
    fechaCreacion: stamp(daysFromNow(-30, 10, 0)),
  },
];

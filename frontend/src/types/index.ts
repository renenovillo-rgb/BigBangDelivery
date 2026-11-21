// ==========================================
// PROYECTO BIG BAN - ESPECIFICACIÓN COMPLETA DE INTERFACES TS
// Ruta: frontend/src/types/index.ts
// ==========================================

// ==========================================
// 1. ROLES Y ESTADOS GENERALES
// ==========================================
export type RolUsuario = 'comprador' | 'vendedor' | 'administrador';

export type EstadoUsuario = 'activo' | 'inactivo' | 'pendiente' | 'suspendido';

export type EstadoTienda = 'pendiente' | 'aprobado' | 'suspendido';

export type TipoItem = 'PERECIBLE' | 'NO_PERECIBLE' | 'SERVICIO';

export type EstadoProducto = 
  | 'BORRADOR' 
  | 'PENDIENTE_REVISION' 
  | 'PUBLICADO' 
  | 'RECHAZADO' 
  | 'AGOTADO' 
  | 'DESACTIVADO';

export type EstadoPedido = 
  | 'PENDIENTE' 
  | 'CONFIRMADO' 
  | 'EN_PREPARACION' 
  | 'LISTO' 
  | 'COMPLETADO' 
  | 'CANCELADO';

export type EstadoPago = 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado';

export type ModalidadServicio = 'A_DOMICILIO' | 'PRESENCIAL' | 'VIRTUAL';

export type EstadoSuscripcion = 'activa' | 'vencida' | 'cancelada';

export type EstadoHistoria = 'EN_REVISION' | 'PUBLICADA' | 'RECHAZADA';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';


// ==========================================
// 2. USUARIO Y AUTENTICACIÓN
// ==========================================
export interface Usuario {
  id: string;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  direccionPrincipal?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface RespuestaAutenticacion {
  tokenAcceso: string; // Token JWT
  usuario: Usuario;
}


// ==========================================
// 3. TIENDA Y PERFIL COMERCIAL (VENDEDOR)
// ==========================================
export interface Tienda {
  id: string;
  vendedorId: string;
  nombreComercial: string;
  ruc: string;
  categoriaPrincipal: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  emailComercial: string;
  logotipoUrl?: string;
  horarioAtencion?: string;
  estado: EstadoTienda;
  fechaCreacion: string;
}

export interface PerfilVendedor {
  id: string;
  usuarioId: string;
  nombreCompleto: string;
  fotoUrl?: string;
  email: string;
  telefono: string;
  identificacionFiscal: string; // RUC de 13 dígitos o Cédula de 10 dígitos
  nombreComercial?: string;
  direccionNegocio: string;
  
  // Parámetros fiscales requeridos por el SRI
  establecimiento: string; // Ejemplo: '001'
  puntoEmision: string; // Ejemplo: '001'
  
  esEditable: boolean; // Bloqueado por defecto (false)
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface SolicitudActualizacionPerfil {
  id: string;
  vendedorId: string;
  campoAModificar: 'telefono' | 'email' | 'identificacionFiscal' | 'direccionNegocio' | 'nombreComercial';
  valorActual: string;
  nuevoValor: string;
  justificacion: string;
  estado: EstadoSolicitud;
  respuestaAdmin?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}


// ==========================================
// 4. CATEGORÍAS Y PRODUCTOS
// ==========================================
export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activa: boolean;
}

export interface Producto {
  id: string;
  tiendaId: string;
  vendedorId?: string;
  categoriaId: string;
  categoriaNombre?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  tipo: TipoItem;
  estado: EstadoProducto;
  motivoRechazo?: string;

  // Campos para Productos (PERECIBLE y NO_PERECIBLE)
  stock?: number;
  unidadMedida?: string; // 'kg', 'libra', 'atado', 'unidad'

  // Específicos para PERECIBLE
  fechaCaducidad?: string;
  condicionesAlmacenamiento?: string;

  // Específicos para SERVICIO
  duracionServicio?: string;
  modalidadServicio?: ModalidadServicio;
  cuposDiarios?: number;

  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ProductoDetalle {
  id: string;
  productoId: string;
  marca?: string;
  garantia?: string;
  dimensiones?: string;
  peso?: string;
  caracteristicasAdicionales?: Record<string, string>;
  especificacionesTecnicas?: string;
}


// ==========================================
// 5. CARRITO Y PEDIDOS (E-COMMERCE)
// ==========================================
export interface ItemCarrito {
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ItemPedido {
  id: string;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  unidadMedida?: string;
}

export interface Pedido {
  id: string;
  numeroPedido: string;
  tiendaId: string;
  compradorId: string;

  // Datos del Comprador (Facturación SRI)
  nombreCliente: string;
  identificacionCliente: string; // RUC o Cédula
  emailCliente: string;
  telefonoCliente: string;
  direccionEntrega: string;

  // Desglose Financiero (IVA 15% SRI)
  subtotal: number;
  montoIva: number;
  costoEnvio: number;
  descuento: number;
  total: number;

  // Estado y Pago
  medioPago: string;
  estadoPedido: EstadoPedido;
  estadoPago: EstadoPago;
  motivoCancelacion?: string;
  numeroFactura?: string; // Se asigna al aceptar el pedido y emitir la factura

  fechaCreacion: string;
  fechaActualizacion?: string;

  items: ItemPedido[];
}

export interface DetallePedido {
  id: string;
  pedidoId: string;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}


// ==========================================
// 6. SERVICIOS COMUNALES
// ==========================================
export interface Servicio {
  id: string;
  prestadorId: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  precioReferencial: number;
  modalidadCotizacion: 'por_hora' | 'precio_fijo' | 'a_convenir';
  zonaAtencion: string;
  disponible: boolean;
  estado: 'publicado' | 'borrador' | 'desactivado';
  fechaCreacion: string;
}


// ==========================================
// 7. HISTORIAS NARRATIVAS DE VENDEDOR
// ==========================================
export interface SolicitudHistoriaProducto {
  id: string;
  codigoHistoria: string; // Ej: 'HIS-001'
  productoId: string;
  nombreProducto: string;
  vendedorId: string;
  historiaPropuesta: string;
  mediaUrl?: string; // Foto o video
  estado: EstadoHistoria;
  observacionesAdmin?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}


// ==========================================
// 8. PLANES COMERCIALES Y SUSCRIPCIONES
// ==========================================
export interface PlanSuscripcion {
  id: string;
  nombre: string;
  precioMensual: number;
  duracionDias: number;
  limiteProductos: number;
  comisionPorcentaje: number;
  activo: boolean;
}

export interface SuscripcionVendedor {
  id: string;
  tiendaId: string;
  planId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoSuscripcion;
}

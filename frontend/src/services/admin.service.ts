import type {
  Tienda,
  Categoria,
  Pedido,
  Usuario,
  SuscripcionVendedor,
  SolicitudHistoriaProducto,
  EstadoTienda,
  EstadoHistoria,
  EstadoUsuario,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface DashboardStats {
  totalUsuarios: number;
  tiendasPendientes: number;
  historiasPendientes: number;
  totalPedidos: number;
}

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('tokenAcceso');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || `Error ${res.status} al consultar ${path}`);
  }

  return res.json() as Promise<T>;
}

export const adminService = {
  getDashboardStats: (): Promise<DashboardStats> =>
    requestJson<DashboardStats>('/admin/dashboard-stats'),

  // Tiendas
  getTiendas: (): Promise<Tienda[]> => requestJson<Tienda[]>('/admin/stores'),

  updateEstadoTienda: (id: string, estado: EstadoTienda): Promise<Tienda> =>
    requestJson<Tienda>(`/admin/stores/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  // Historias
  getHistorias: (): Promise<SolicitudHistoriaProducto[]> =>
    requestJson<SolicitudHistoriaProducto[]>('/admin/stories'),

  moderarHistoria: (
    id: string,
    estado: EstadoHistoria,
    observacionesAdmin?: string,
  ): Promise<SolicitudHistoriaProducto> =>
    requestJson<SolicitudHistoriaProducto>(`/admin/stories/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, observacionesAdmin }),
    }),

  // Categorías
  getCategorias: (): Promise<Categoria[]> =>
    requestJson<Categoria[]>('/admin/categories'),

  crearCategoria: (data: Partial<Categoria>): Promise<Categoria> =>
    requestJson<Categoria>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategoria: (id: string, data: Partial<Categoria>): Promise<Categoria> =>
    requestJson<Categoria>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Usuarios
  getUsuarios: (): Promise<Usuario[]> => requestJson<Usuario[]>('/admin/users'),

  updateEstadoUsuario: (id: string, estado: EstadoUsuario): Promise<Usuario> =>
    requestJson<Usuario>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  // Pedidos
  getPedidos: (): Promise<Pedido[]> => requestJson<Pedido[]>('/admin/orders'),

  // Suscripciones
  getSuscripciones: (): Promise<SuscripcionVendedor[]> =>
    requestJson<SuscripcionVendedor[]>('/admin/subscriptions'),
};
import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type {
  Categoria, EstadoTienda, EstadoUsuario, Pedido, PlanSuscripcion, Producto, SolicitudActualizacionPerfil,
  SolicitudHistoriaProducto, Usuario,
} from '../types';
import type { Seller } from '../pages/buyer/catalog';
import type { ActivityEntry, ProfileRequest, PublicProfileChanges, Vendor } from './platformData';

export interface PlatformContextValue {
  vendors: Vendor[];
  plans: PlanSuscripcion[];
  products: Producto[];
  orders: Pedido[];
  stories: SolicitudHistoriaProducto[];
  fiscalRequests: SolicitudActualizacionPerfil[];
  profileRequests: ProfileRequest[];
  users: Usuario[];
  categories: Categoria[];
  log: ActivityEntry[];
  /** Cambios aprobados al perfil público de cada vendedor (por id del perfil del comprador) */
  publicProfiles: Record<string, PublicProfileChanges>;

  notify: (message: string, tone?: 'ok' | 'error') => void;
  addLog: (texto: string, tono?: ActivityEntry['tono']) => void;

  /* Setters que usa el panel del vendedor para sus propios datos */
  setProducts: Dispatch<SetStateAction<Producto[]>>;
  setOrders: Dispatch<SetStateAction<Pedido[]>>;
  setStories: Dispatch<SetStateAction<SolicitudHistoriaProducto[]>>;
  setFiscalRequests: Dispatch<SetStateAction<SolicitudActualizacionPerfil[]>>;
  setProfileRequests: Dispatch<SetStateAction<ProfileRequest[]>>;

  /* Acciones del administrador */
  setVendorStatus: (id: string, estado: EstadoTienda, motivo?: string) => void;
  setVendorPlan: (id: string, planId: string) => void;
  resolveFiscalRequest: (id: string, approve: boolean, respuesta: string) => void;
  resolveProfileRequest: (id: string, approve: boolean, respuesta: string) => void;
  reviewProduct: (id: string, approve: boolean, motivo: string) => void;
  reviewStory: (id: string, approve: boolean, observacion: string) => void;
  cancelOrderByAdmin: (id: string, motivo: string) => void;
  saveCategory: (data: { id?: string; nombre: string; descripcion: string }) => boolean;
  toggleCategory: (id: string) => void;
  deleteCategory: (id: string) => void;
  savePlan: (plan: PlanSuscripcion) => void;
  setUserStatus: (id: string, estado: EstadoUsuario) => void;

  /** Perfil público de un vendedor tal como lo ve el comprador (con los cambios aprobados) */
  publicSeller: (catalogId: string) => Seller;
}

export const PlatformContext = createContext<PlatformContextValue | null>(null);

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform debe usarse dentro de <PlatformProvider>');
  return ctx;
};

/* Datos del comprador: perfil del vendedor con los cambios que aprobó el administrador */
export const usePublicSeller = (catalogId: string) => usePlatform().publicSeller(catalogId);

/* Ventas facturadas (no canceladas) de una tienda */
export const billedOrders = (orders: Pedido[], tiendaId?: string) =>
  orders.filter((o) => o.numeroFactura && o.estadoPedido !== 'CANCELADO' && (!tiendaId || o.tiendaId === tiendaId));

/* Cola de revisión del administrador */
export const reviewQueue = (ctx: Pick<PlatformContextValue, 'products' | 'stories' | 'fiscalRequests' | 'profileRequests' | 'vendors'>) => ({
  products: ctx.products.filter((p) => p.estado === 'PENDIENTE_REVISION'),
  stories: ctx.stories.filter((s) => s.estado === 'EN_REVISION'),
  fiscal: ctx.fiscalRequests.filter((r) => r.estado === 'PENDIENTE'),
  profile: ctx.profileRequests.filter((r) => r.estado === 'PENDIENTE'),
  vendors: ctx.vendors.filter((v) => v.estado === 'pendiente'),
});

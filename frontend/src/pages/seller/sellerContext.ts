import { createContext, useContext } from 'react';
import type {
  PerfilVendedor, Pedido, PlanSuscripcion, Producto, SolicitudActualizacionPerfil,
  SolicitudHistoriaProducto, SuscripcionVendedor,
} from '../../types';
import type { ProductForm, SellerSettings } from './sellerData';

export type ChangeField = SolicitudActualizacionPerfil['campoAModificar'];

export interface SellerContextValue {
  profile: PerfilVendedor;
  plan: PlanSuscripcion;
  subscription: SuscripcionVendedor;
  settings: SellerSettings;
  storeOpen: boolean;
  products: Producto[];
  orders: Pedido[];
  stories: SolicitudHistoriaProducto[];
  changeRequests: SolicitudActualizacionPerfil[];

  notify: (message: string, tone?: 'ok' | 'error') => void;
  setStoreOpen: (open: boolean) => void;
  updateSettings: (patch: Partial<SellerSettings>) => void;

  /** Acepta el pedido, emite la factura y descuenta el stock. Devuelve el N° de factura. */
  confirmOrder: (id: string) => string | undefined;
  advanceOrder: (id: string) => void;
  cancelOrder: (id: string, motivo: string) => void;

  /** Devuelve false si no se pudo guardar (por ejemplo, límite del plan). */
  saveProduct: (form: ProductForm, editingId: string | null, asDraft: boolean) => boolean;
  deleteProduct: (id: string) => void;
  togglePublished: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  addStory: (productId: string, historia: string, mediaUrl: string) => void;
  addChangeRequest: (campo: ChangeField, nuevoValor: string, justificacion: string) => void;
}

export const SellerContext = createContext<SellerContextValue | null>(null);

export const useSeller = () => {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error('useSeller debe usarse dentro de <SellerProvider>');
  return ctx;
};

/* Un ítem cuenta como "stock bajo" si es un producto físico publicado con pocas unidades */
export const isLowStock = (p: Producto, min: number) =>
  p.tipo !== 'SERVICIO' && (p.estado === 'PUBLICADO' || p.estado === 'AGOTADO') && (p.stock ?? 0) <= min;

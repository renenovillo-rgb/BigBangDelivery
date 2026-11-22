import type { Pedido, PlanSuscripcion } from '../../types';
import type { Vendor } from '../../platform/platformData';
import { billedOrders } from '../../platform/platformContext';
import { dateKey, daysFromNow, round2 } from '../../components/utils';

/* Estadísticas de ventas de la plataforma (calculadas sobre los pedidos facturados) */

export interface VendorSales { vendorId: string; orders: number; subtotal: number; commission: number }

export const monthStart = () => `${dateKey(new Date()).slice(0, 7)}-01`;

export const salesByVendor = (orders: Pedido[], vendors: Vendor[], plans: PlanSuscripcion[], sinceKey = ''): VendorSales[] =>
  vendors.map((v) => {
    const mine = billedOrders(orders, v.tiendaId).filter((o) => o.fechaCreacion.slice(0, 10) >= sinceKey);
    const subtotal = round2(mine.reduce((s, o) => s + o.subtotal, 0));
    const pct = plans.find((p) => p.id === v.planId)?.comisionPorcentaje ?? 0;
    return { vendorId: v.id, orders: mine.length, subtotal, commission: round2(subtotal * (pct / 100)) };
  });

export const sumSales = (list: VendorSales[]) => ({
  orders: list.reduce((s, x) => s + x.orders, 0),
  subtotal: round2(list.reduce((s, x) => s + x.subtotal, 0)),
  commission: round2(list.reduce((s, x) => s + x.commission, 0)),
});

/* Ventas (con IVA) de los últimos 7 días de toda la plataforma */
export const lastSevenDays = (orders: Pedido[]) => {
  const billed = billedOrders(orders);
  return Array.from({ length: 7 }, (_, i) => {
    const key = dateKey(daysFromNow(i - 6));
    return { key, total: round2(billed.filter((o) => o.fechaCreacion.startsWith(key)).reduce((s, o) => s + o.total, 0)) };
  });
};

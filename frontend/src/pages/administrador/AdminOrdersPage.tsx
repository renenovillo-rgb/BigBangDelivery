import { useState } from 'react';
import { Ban, FileText, MapPin, Phone, Receipt, Search, X } from 'lucide-react';
import type { EstadoPedido, Pedido } from '../../types';
import { usePlatform } from '../../platform/platformContext';
import { Button, Card, Chip, EmptyState, Field, Modal, PageHeading, Pill, StatCard } from '../../components/ui';
import { ORDER_STATUS, PAYMENT_LABEL, inputCls, money, prettyStamp } from '../../components/utils';
import { VendorLink } from './parts';

type Filter = 'TODOS' | EstadoPedido;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDIENTE', label: 'Nuevos' },
  { id: 'CONFIRMADO', label: 'Confirmados' },
  { id: 'EN_PREPARACION', label: 'En preparación' },
  { id: 'LISTO', label: 'Listos' },
  { id: 'COMPLETADO', label: 'Entregados' },
  { id: 'CANCELADO', label: 'Cancelados' },
];

export const AdminOrdersPage = () => {
  const { orders, vendors, cancelOrderByAdmin } = usePlatform();

  const [filter, setFilter] = useState<Filter>('TODOS');
  const [vendorId, setVendorId] = useState('');
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const vendorOf = (o: Pedido) => vendors.find((v) => v.tiendaId === o.tiendaId);
  const detail = orders.find((o) => o.id === detailId);
  const cancelling = orders.find((o) => o.id === cancelId);

  const q = query.trim().toLowerCase();
  const list = orders
    .filter((o) => filter === 'TODOS' || o.estadoPedido === filter)
    .filter((o) => !vendorId || vendorOf(o)?.id === vendorId)
    .filter((o) => !q || `${o.numeroPedido} ${o.nombreCliente}`.toLowerCase().includes(q))
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  const valid = orders.filter((o) => o.estadoPedido !== 'CANCELADO');
  const cancelled = orders.length - valid.length;

  const closeCancel = () => { setCancelId(null); setReason(''); setReasonError(false); };
  const confirmCancel = () => {
    if (!reason.trim()) { setReasonError(true); return; }
    if (cancelling) cancelOrderByAdmin(cancelling.id, reason.trim());
    closeCancel();
  };

  return (
    <div className="space-y-5">
      <PageHeading title="Pedidos" subtitle="Supervisa los pedidos de toda la plataforma e interviene cuando haya un problema." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Receipt} label="Pedidos" value={orders.length} hint="En toda la plataforma" />
        <StatCard icon={Receipt} label="Sin aceptar" value={orders.filter((o) => o.estadoPedido === 'PENDIENTE').length} hint="Esperan al vendedor" accent={orders.some((o) => o.estadoPedido === 'PENDIENTE')} />
        <StatCard icon={Receipt} label="Facturado" value={money(valid.filter((o) => o.numeroFactura).reduce((s, o) => s + o.total, 0))} hint="Con IVA incluido" />
        <StatCard icon={Ban} label="Cancelados" value={cancelled} hint={`${orders.length ? Math.round((cancelled / orders.length) * 100) : 0}% del total`} />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={f.id === 'TODOS' ? orders.length : orders.filter((o) => o.estadoPedido === f.id).length}>{f.label}</Chip>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#2F3A2F]/10 focus-within:ring-2 focus-within:ring-[#4F6F52] sm:max-w-md">
          <Search className="h-5 w-5 shrink-0 text-[#86A789]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca por N° de pedido o cliente…" aria-label="Buscar pedidos" className={inputCls} />
          {query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X className="h-4 w-4 text-[#2F3A2F]/50" /></button>}
        </div>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          aria-label="Filtrar por vendedor"
          className="rounded-2xl bg-white px-4 py-3 text-[15px] text-[#2F3A2F] outline-none ring-1 ring-[#2F3A2F]/10 focus:ring-2 focus:ring-[#4F6F52] sm:w-64"
        >
          <option value="">Todos los vendedores</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.nombreComercial}</option>)}
        </select>
      </div>

      {list.length ? (
        <div className="space-y-3">
          {list.map((o) => {
            const st = ORDER_STATUS[o.estadoPedido];
            const v = vendorOf(o);
            return (
              <Card key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCE8D2] text-[#4F6F52]"><Receipt className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-sm font-bold text-[#4F6F52]">#{o.numeroPedido}</span>
                    <span className="text-xs text-[#2F3A2F]/50">{prettyStamp(o.fechaCreacion)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#2F3A2F]/80">{o.nombreCliente} → {v ? <VendorLink id={v.id} name={v.nombreComercial} /> : o.tiendaId}</p>
                  <p className="truncate text-xs text-[#2F3A2F]/55">{o.items.map((i) => `${i.cantidad}× ${i.nombreProducto}`).join(', ')}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="text-lg font-extrabold text-[#2F3A2F]">{money(o.total)}</span>
                  <Pill tone={st.tone}>{st.label}</Pill>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDetailId(o.id)}>Ver detalle</Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Receipt} title="No hay pedidos con estos filtros" text="Cambia el estado, el vendedor o la búsqueda." />
      )}

      {detail && (
        <Modal
          wide
          onClose={() => setDetailId(null)}
          title={`Pedido #${detail.numeroPedido}`}
          subtitle={`${prettyStamp(detail.fechaCreacion)} · ${PAYMENT_LABEL[detail.medioPago] ?? 'Otro medio de pago'}`}
          footer={(
            <>
              {detail.estadoPedido === 'PENDIENTE' && (
                <Button variant="danger" onClick={() => { setDetailId(null); setCancelId(detail.id); }}><Ban className="h-4 w-4" /> Cancelar pedido</Button>
              )}
              <Button variant="secondary" onClick={() => setDetailId(null)}>Cerrar</Button>
            </>
          )}
        >
          <div className="space-y-4 pb-2">
            <div className="flex flex-wrap gap-2">
              <Pill tone={ORDER_STATUS[detail.estadoPedido].tone}>{ORDER_STATUS[detail.estadoPedido].label}</Pill>
              {detail.numeroFactura && <Pill tone="gray" icon={FileText}>Factura {detail.numeroFactura}</Pill>}
              <Pill tone={detail.estadoPago === 'pagado' ? 'green' : 'amber'}>{detail.estadoPago === 'pagado' ? 'Pagado' : 'Pago pendiente'}</Pill>
            </div>
            {detail.motivoCancelacion && <p className="rounded-2xl bg-[#F2D9D0]/70 p-3.5 text-sm text-[#7A3322]"><b>Motivo de cancelación:</b> {detail.motivoCancelacion}</p>}

            <div className="space-y-2 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
              <p className="font-bold text-[#2F3A2F]">{detail.nombreCliente}</p>
              <p className="flex items-center gap-2 text-[#2F3A2F]/70"><FileText className="h-4 w-4 text-[#86A789]" /> {detail.identificacionCliente}</p>
              <p className="flex items-start gap-2 text-[#2F3A2F]/70"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#86A789]" /> {detail.direccionEntrega}</p>
              <p className="flex items-center gap-2 text-[#2F3A2F]/70"><Phone className="h-4 w-4 text-[#86A789]" /> {detail.telefonoCliente}</p>
            </div>

            <ul className="divide-y divide-[#2F3A2F]/10 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
              {detail.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span><b>{i.cantidad}×</b> {i.nombreProducto}</span>
                  <span className="font-semibold">{money(i.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
              <div className="flex justify-between text-[#2F3A2F]/70"><span>Subtotal</span><span>{money(detail.subtotal)}</span></div>
              <div className="flex justify-between text-[#2F3A2F]/70"><span>IVA (15%)</span><span>{money(detail.montoIva)}</span></div>
              {detail.costoEnvio > 0 && <div className="flex justify-between text-[#2F3A2F]/70"><span>Envío</span><span>{money(detail.costoEnvio)}</span></div>}
              <div className="flex justify-between border-t border-[#2F3A2F]/10 pt-2 text-base font-extrabold"><span>Total</span><span>{money(detail.total)}</span></div>
            </div>
          </div>
        </Modal>
      )}

      {cancelling && (
        <Modal
          onClose={closeCancel}
          title={`Cancelar pedido #${cancelling.numeroPedido}`}
          subtitle="Solo se pueden cancelar pedidos que el vendedor aún no aceptó."
          footer={(
            <>
              <Button variant="secondary" onClick={closeCancel}>Volver</Button>
              <Button variant="danger" onClick={confirmCancel}>Cancelar pedido</Button>
            </>
          )}
        >
          <div className="pb-3">
            <Field label="Motivo" error={reasonError ? 'Indica un motivo para continuar.' : undefined}>
              <textarea rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(false); }} placeholder="Ej: pedido duplicado o reclamo del comprador." className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

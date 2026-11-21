import { useState } from 'react';
import {
  AlertTriangle, ArrowRight, Ban, Check, FileText, MapPin, Phone, Receipt, Search, Truck, X,
} from 'lucide-react';
import type { EstadoPedido, Pedido } from '../../types';
import { useSeller } from './sellerContext';
import { Button, Card, Chip, EmptyState, Field, Modal, PageHeading, Pill } from './ui';
import {
  NEXT_ORDER_STEP, ORDER_STATUS, ORDER_STEPS, PAYMENT_LABEL, inputCls, money, prettyStamp,
} from './utils';

type Filter = 'TODOS' | 'NUEVOS' | 'EN_CURSO' | 'LISTOS' | 'ENTREGADOS' | 'CANCELADOS';

const FILTERS: { id: Filter; label: string; match: EstadoPedido[] }[] = [
  { id: 'TODOS', label: 'Todos', match: [] },
  { id: 'NUEVOS', label: 'Nuevos', match: ['PENDIENTE'] },
  { id: 'EN_CURSO', label: 'En curso', match: ['CONFIRMADO', 'EN_PREPARACION'] },
  { id: 'LISTOS', label: 'Listos para entrega', match: ['LISTO'] },
  { id: 'ENTREGADOS', label: 'Entregados', match: ['COMPLETADO'] },
  { id: 'CANCELADOS', label: 'Cancelados', match: ['CANCELADO'] },
];

const CANCEL_REASONS = [
  'Sin stock suficiente',
  'Fuera de horario de atención',
  'Dirección fuera de la zona de entrega',
  'No pude contactar al cliente',
];

const summary = (o: Pedido) => o.items.map((i) => `${i.cantidad}× ${i.nombreProducto}`).join(', ');

/* Barra de progreso del pedido: Recibido → Confirmado → Preparación → Listo → Entregado */
const OrderProgress = ({ status }: { status: EstadoPedido }) => {
  if (status === 'CANCELADO') return null;
  const current = ORDER_STEPS.findIndex((s) => s.id === status);
  return (
    <ol className="flex items-center" aria-label="Progreso del pedido">
      {ORDER_STEPS.map((s, i) => (
        <li key={s.id} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= current ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-white text-[#2F3A2F]/40 ring-1 ring-black/10'}`}>
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-[10px] font-semibold ${i <= current ? 'text-[#4F6F52]' : 'text-[#2F3A2F]/40'}`}>{s.label}</span>
          </div>
          {i < ORDER_STEPS.length - 1 && <div className={`mx-1 mb-4 h-1 flex-1 rounded-full ${i < current ? 'bg-[#4F6F52]' : 'bg-[#2F3A2F]/10'}`} />}
        </li>
      ))}
    </ol>
  );
};

const TotalsBox = ({ order }: { order: Pedido }) => (
  <div className="space-y-1.5 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
    <div className="flex justify-between text-[#2F3A2F]/70"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
    <div className="flex justify-between text-[#2F3A2F]/70"><span>IVA (15%)</span><span>{money(order.montoIva)}</span></div>
    {order.costoEnvio > 0 && <div className="flex justify-between text-[#2F3A2F]/70"><span>Envío</span><span>{money(order.costoEnvio)}</span></div>}
    {order.descuento > 0 && <div className="flex justify-between text-[#4F6F52]"><span>Descuento</span><span>-{money(order.descuento)}</span></div>}
    <div className="flex justify-between border-t border-[#2F3A2F]/10 pt-2 text-base font-extrabold text-[#2F3A2F]">
      <span>Total</span><span>{money(order.total)}</span>
    </div>
  </div>
);

export const SellerOrdersPage = () => {
  const { orders, products, confirmOrder, advanceOrder, cancelOrder } = useSeller();

  const [filter, setFilter] = useState<Filter>('TODOS');
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const byId = (id: string | null) => orders.find((o) => o.id === id);
  const detail = byId(detailId);
  const invoice = byId(invoiceId);
  const cancelling = byId(cancelId);

  const countFor = (f: (typeof FILTERS)[number]) => (f.id === 'TODOS' ? orders.length : orders.filter((o) => f.match.includes(o.estadoPedido)).length);
  const active = FILTERS.find((f) => f.id === filter)!;
  const q = query.trim().toLowerCase();
  const list = orders
    .filter((o) => active.id === 'TODOS' || active.match.includes(o.estadoPedido))
    .filter((o) => !q || `${o.numeroPedido} ${o.nombreCliente}`.toLowerCase().includes(q))
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  // Verifica si el inventario alcanza para aceptar el pedido
  const shortages = (o: Pedido) =>
    o.items.filter((i) => {
      const p = products.find((x) => x.id === i.productoId);
      return p?.stock !== undefined && p.stock < i.cantidad;
    });

  const openCancel = (id: string) => { setDetailId(null); setCancelId(id); setReason(''); setReasonError(false); };
  const openInvoice = (id: string) => { setDetailId(null); setInvoiceId(id); };
  const closeCancel = () => setCancelId(null);

  const submitCancel = () => {
    if (!reason.trim()) { setReasonError(true); return; }
    if (cancelling) cancelOrder(cancelling.id, reason.trim());
    closeCancel();
  };

  const submitInvoice = () => {
    if (invoice) confirmOrder(invoice.id);
    setInvoiceId(null);
  };

  const canCancel = (o: Pedido) => o.estadoPedido === 'CONFIRMADO' || o.estadoPedido === 'EN_PREPARACION';

  return (
    <div className="space-y-5">
      <PageHeading
        title="Pedidos"
        subtitle="Acepta las solicitudes, prepáralas y confírmalas al entregarlas."
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={countFor(f)}>{f.label}</Chip>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#2F3A2F]/10 focus-within:ring-2 focus-within:ring-[#4F6F52] sm:max-w-md">
        <Search className="h-5 w-5 shrink-0 text-[#86A789]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por N° de pedido o cliente…"
          aria-label="Buscar pedidos"
          className={inputCls}
        />
        {query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X className="h-4 w-4 text-[#2F3A2F]/50" /></button>}
      </div>

      {list.length ? (
        <div className="space-y-3">
          {list.map((o) => {
            const st = ORDER_STATUS[o.estadoPedido];
            const step = NEXT_ORDER_STEP[o.estadoPedido];
            return (
              <Card key={o.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCE8D2] text-[#4F6F52]">
                    <Receipt className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-mono text-sm font-bold text-[#4F6F52]">#{o.numeroPedido}</span>
                      <span className="text-xs text-[#2F3A2F]/50">{prettyStamp(o.fechaCreacion)}</span>
                      {o.estadoPago === 'pagado'
                        ? <Pill tone="green" className="!py-0.5 !text-[11px]">Pagado</Pill>
                        : <Pill tone="amber" className="!py-0.5 !text-[11px]">Cobrar {PAYMENT_LABEL[o.medioPago]?.toLowerCase() ?? ''}</Pill>}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#2F3A2F]">{o.nombreCliente}</p>
                    <p className="truncate text-sm text-[#2F3A2F]/65">{summary(o)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                    <span className="text-lg font-extrabold text-[#2F3A2F]">{money(o.total)}</span>
                    <Pill tone={st.tone}>{st.label}</Pill>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#2F3A2F]/10 pt-3">
                  <Button variant="ghost" size="sm" onClick={() => setDetailId(o.id)}>Ver detalle</Button>
                  {o.estadoPedido === 'PENDIENTE' && (
                    <>
                      <Button variant="danger" size="sm" onClick={() => openCancel(o.id)}>Declinar</Button>
                      <Button size="sm" onClick={() => openInvoice(o.id)}>Aceptar y facturar <ArrowRight className="h-4 w-4" /></Button>
                    </>
                  )}
                  {step && <Button size="sm" onClick={() => advanceOrder(o.id)}>{step.label} <ArrowRight className="h-4 w-4" /></Button>}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title={q ? 'No encontramos pedidos' : 'No hay pedidos en esta vista'}
          text={q ? `Nada coincide con “${query}”.` : 'Cuando recibas pedidos con este estado aparecerán aquí.'}
        />
      )}

      {/* Detalle del pedido */}
      {detail && (
        <Modal
          wide
          onClose={() => setDetailId(null)}
          title={`Pedido #${detail.numeroPedido}`}
          subtitle={`${prettyStamp(detail.fechaCreacion)} · ${PAYMENT_LABEL[detail.medioPago] ?? 'Otro medio de pago'}`}
          footer={(
            <>
              {detail.estadoPedido === 'PENDIENTE' && (
                <>
                  <Button variant="danger" onClick={() => openCancel(detail.id)}>Declinar</Button>
                  <Button onClick={() => openInvoice(detail.id)}>Aceptar y facturar</Button>
                </>
              )}
              {canCancel(detail) && <Button variant="danger" onClick={() => openCancel(detail.id)}><Ban className="h-4 w-4" /> Cancelar pedido</Button>}
              {NEXT_ORDER_STEP[detail.estadoPedido] && (
                <Button onClick={() => advanceOrder(detail.id)}>{NEXT_ORDER_STEP[detail.estadoPedido]!.label}</Button>
              )}
              {(detail.estadoPedido === 'COMPLETADO' || detail.estadoPedido === 'CANCELADO') && (
                <Button variant="secondary" onClick={() => setDetailId(null)}>Cerrar</Button>
              )}
            </>
          )}
        >
          <div className="space-y-4 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={ORDER_STATUS[detail.estadoPedido].tone}>{ORDER_STATUS[detail.estadoPedido].label}</Pill>
              {detail.numeroFactura && <Pill tone="gray" icon={FileText}>Factura {detail.numeroFactura}</Pill>}
            </div>

            <OrderProgress status={detail.estadoPedido} />

            {detail.estadoPedido === 'CANCELADO' && detail.motivoCancelacion && (
              <p className="rounded-2xl bg-[#F2D9D0]/70 p-3.5 text-sm text-[#7A3322]">
                <b>Motivo de cancelación:</b> {detail.motivoCancelacion}
              </p>
            )}

            <div className="space-y-2.5 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
              <p className="font-bold text-[#2F3A2F]">{detail.nombreCliente}</p>
              <p className="flex items-center gap-2 text-[#2F3A2F]/70"><FileText className="h-4 w-4 text-[#86A789]" /> {detail.identificacionCliente}</p>
              <p className="flex items-start gap-2 text-[#2F3A2F]/70"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#86A789]" /> {detail.direccionEntrega}</p>
              <a href={`tel:${detail.telefonoCliente}`} className="inline-flex items-center gap-2 font-semibold text-[#4F6F52]">
                <Phone className="h-4 w-4" /> {detail.telefonoCliente}
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
              <ul className="divide-y divide-[#2F3A2F]/10">
                {detail.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0 text-[#2F3A2F]"><b>{i.cantidad}×</b> {i.nombreProducto}</span>
                    <span className="shrink-0 font-semibold text-[#2F3A2F]">{money(i.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <TotalsBox order={detail} />
          </div>
        </Modal>
      )}

      {/* Vista previa de facturación */}
      {invoice && (
        <Modal
          wide
          onClose={() => setInvoiceId(null)}
          title="Aceptar pedido y emitir factura"
          subtitle="Verifica los datos del cliente antes de emitir la factura electrónica (SRI)."
          footer={(
            <>
              <Button variant="secondary" onClick={() => setInvoiceId(null)}>Volver</Button>
              <Button onClick={submitInvoice} disabled={shortages(invoice).length > 0}>Confirmar y generar factura</Button>
            </>
          )}
        >
          <div className="space-y-4 pb-2">
            {shortages(invoice).length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl bg-[#F2D9D0]/70 p-3.5 text-sm text-[#7A3322]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  No tienes stock suficiente de {shortages(invoice).map((i) => `“${i.nombreProducto}”`).join(', ')}. Actualiza tu inventario o declina el pedido.
                </p>
              </div>
            )}

            <div className="space-y-1 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#6B7A6B]">Datos del cliente</p>
              <p><b>{invoice.nombreCliente}</b></p>
              <p className="text-[#2F3A2F]/70">{invoice.identificacionCliente} · {invoice.telefonoCliente}</p>
              <p className="text-[#2F3A2F]/70">{invoice.direccionEntrega}</p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#DCE8D2]/50 text-xs uppercase tracking-wide text-[#3E5C41]">
                  <tr>
                    <th className="px-4 py-2.5">Ítem</th>
                    <th className="px-2 py-2.5 text-center">Cant.</th>
                    <th className="px-2 py-2.5 text-right">P. unit.</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2F3A2F]/10">
                  {invoice.items.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-2.5">{i.nombreProducto}</td>
                      <td className="px-2 py-2.5 text-center">{i.cantidad}</td>
                      <td className="px-2 py-2.5 text-right">{money(i.precioUnitario)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{money(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TotalsBox order={invoice} />
            <p className="flex items-center gap-2 text-xs text-[#2F3A2F]/55">
              <Truck className="h-4 w-4" /> Al confirmar, el stock se descuenta y el pedido pasa a “Confirmado”.
            </p>
          </div>
        </Modal>
      )}

      {/* Declinar / cancelar */}
      {cancelling && (
        <Modal
          onClose={closeCancel}
          title={cancelling.estadoPedido === 'PENDIENTE' ? `Declinar pedido #${cancelling.numeroPedido}` : `Cancelar pedido #${cancelling.numeroPedido}`}
          subtitle="El comprador verá el motivo que indiques."
          footer={(
            <>
              <Button variant="secondary" onClick={closeCancel}>Volver</Button>
              <Button variant="danger" onClick={submitCancel}>Confirmar</Button>
            </>
          )}
        >
          <div className="space-y-3 pb-2">
            <div className="flex flex-wrap gap-2">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => { setReason(r); setReasonError(false); }}
                  aria-pressed={reason === r}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${reason === r ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-[#DCE8D2]/60 text-[#3E5C41] hover:bg-[#DCE8D2]'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Field label="Motivo" error={reasonError ? 'Indica un motivo para continuar.' : undefined}>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => { setReason(e.target.value); setReasonError(false); }}
                placeholder="Escribe la razón por la que no puedes atender este pedido…"
                className={`${inputCls} resize-none`}
              />
            </Field>
            {cancelling.numeroFactura && (
              <p className="rounded-2xl bg-[#F8EBC2]/70 p-3.5 text-xs text-[#6B5410]">
                Este pedido ya tiene la factura {cancelling.numeroFactura}. Recuerda emitir la nota de crédito correspondiente. El stock volverá a tu inventario.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

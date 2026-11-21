import { useState } from 'react';
import { Download, FileText, Percent, Receipt, Wallet } from 'lucide-react';
import { useSeller } from './sellerContext';
import { Button, Card, Chip, EmptyState, PageHeading, Pill, SectionTitle, StatCard } from './ui';
import { ORDER_STATUS, PAYMENT_LABEL, dateKey, daysFromNow, money, prettyStamp, round2 } from './utils';

// Marca de orden de bytes para que Excel abra bien las tildes
const BOM = String.fromCharCode(0xfeff);

type Period = '7' | '30' | 'TODO';

const PERIODS: { id: Period; label: string }[] = [
  { id: '7', label: 'Últimos 7 días' },
  { id: '30', label: 'Últimos 30 días' },
  { id: 'TODO', label: 'Todo' },
];

export const SellerSalesPage = () => {
  const { orders, plan, profile, notify } = useSeller();
  const [period, setPeriod] = useState<Period>('30');

  // Una venta cuenta cuando el pedido fue aceptado y facturado (y no se canceló después)
  const since = period === 'TODO' ? '' : dateKey(daysFromNow(-(Number(period) - 1)));
  const invoiced = orders
    .filter((o) => o.numeroFactura && o.estadoPedido !== 'CANCELADO' && o.fechaCreacion.slice(0, 10) >= since)
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  const sum = (pick: (o: (typeof invoiced)[number]) => number) => round2(invoiced.reduce((s, o) => s + pick(o), 0));
  const subtotal = sum((o) => o.subtotal);
  const iva = sum((o) => o.montoIva);
  const shipping = sum((o) => o.costoEnvio);
  const commission = round2(subtotal * (plan.comisionPorcentaje / 100));
  const net = round2(subtotal - commission);

  const byPayment = invoiced.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
    const cur = acc[o.medioPago] ?? { count: 0, total: 0 };
    acc[o.medioPago] = { count: cur.count + 1, total: round2(cur.total + o.total) };
    return acc;
  }, {});

  const exportCsv = () => {
    const rows = [
      ['Factura', 'Pedido', 'Fecha', 'Cliente', 'Identificación', 'Subtotal', 'IVA 15%', 'Envío', 'Total', 'Medio de pago', 'Estado'],
      ...invoiced.map((o) => [
        o.numeroFactura, o.numeroPedido, o.fechaCreacion, o.nombreCliente, o.identificacionCliente,
        o.subtotal.toFixed(2), o.montoIva.toFixed(2), o.costoEnvio.toFixed(2), o.total.toFixed(2),
        PAYMENT_LABEL[o.medioPago] ?? o.medioPago, ORDER_STATUS[o.estadoPedido].label,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([BOM, csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas-${profile.establecimiento}-${profile.puntoEmision}-${dateKey(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Reporte descargado.');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeading
        title="Ventas y facturas"
        subtitle="Resumen de lo que has vendido, la comisión de la plataforma y las facturas electrónicas emitidas."
        action={<Button variant="secondary" onClick={exportCsv} disabled={!invoiced.length}><Download className="h-4 w-4" /> Descargar CSV</Button>}
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {PERIODS.map((p) => <Chip key={p.id} active={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</Chip>)}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Ventas (sin IVA)" value={money(subtotal)} hint={`${invoiced.length} factura${invoiced.length === 1 ? '' : 's'}`} />
        <StatCard icon={Percent} label={`Comisión ${plan.comisionPorcentaje}%`} value={money(commission)} hint="Cobrada por la plataforma" />
        <StatCard icon={Receipt} label="IVA cobrado" value={money(iva)} hint="Se declara al SRI" />
        <StatCard icon={Wallet} label="Neto a recibir" value={money(net)} hint={shipping ? `+ ${money(shipping)} de envíos` : 'Ventas menos comisión'} accent />
      </div>

      {invoiced.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#DCE8D2]/50 text-xs uppercase tracking-wide text-[#3E5C41]">
                  <tr>
                    <th className="px-5 py-3">Factura</th>
                    <th className="px-3 py-3">Cliente</th>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2F3A2F]/10">
                  {invoiced.map((o) => (
                    <tr key={o.id} className="transition hover:bg-[#F7F3E8]/60">
                      <td className="px-5 py-3.5">
                        <p className="flex items-center gap-1.5 font-mono text-[13px] font-bold text-[#4F6F52]"><FileText className="h-4 w-4" /> {o.numeroFactura}</p>
                        <p className="mt-0.5 text-xs text-[#2F3A2F]/50">Pedido #{o.numeroPedido}</p>
                      </td>
                      <td className="px-3 py-3.5 text-[#2F3A2F]">{o.nombreCliente}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-[#2F3A2F]/60">{prettyStamp(o.fechaCreacion)}</td>
                      <td className="px-3 py-3.5"><Pill tone={ORDER_STATUS[o.estadoPedido].tone}>{ORDER_STATUS[o.estadoPedido].label}</Pill></td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-[#2F3A2F]">{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="h-fit p-5 sm:p-6">
            <SectionTitle>Por medio de pago</SectionTitle>
            <ul className="space-y-3">
              {Object.entries(byPayment).map(([code, v]) => (
                <li key={code} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-bold text-[#2F3A2F]">{PAYMENT_LABEL[code] ?? 'Otro'}</p>
                    <p className="text-xs text-[#2F3A2F]/55">{v.count} pedido{v.count === 1 ? '' : 's'}</p>
                  </div>
                  <span className="font-extrabold text-[#4F6F52]">{money(v.total)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-[#2F3A2F]/10 pt-3 text-xs leading-relaxed text-[#2F3A2F]/55">
              Emisión desde el establecimiento {profile.establecimiento}, punto {profile.puntoEmision}. La comisión se calcula sobre el subtotal sin IVA.
            </p>
          </Card>
        </div>
      ) : (
        <EmptyState icon={Receipt} title="Sin ventas en este periodo" text="Cuando aceptes pedidos y se emitan sus facturas, las verás aquí." />
      )}
    </div>
  );
};

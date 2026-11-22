import { Link } from 'react-router-dom';
import {
  BookOpen, CalendarClock, ChevronRight, ClipboardCheck, Package, Percent, Receipt, Store, TrendingUp, UserRound,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { reviewQueue, usePlatform } from '../../platform/platformContext';
import { Card, Pill, SectionTitle, StatCard } from '../../components/ui';
import { dateKey, daysUntil, money, prettyStamp, weekdayShort } from '../../components/utils';
import { lastSevenDays, monthStart, salesByVendor, sumSales } from './stats';
import { Avatar } from './parts';

export const AdminDashboardPage = () => {
  const platform = usePlatform();
  const { vendors, plans, orders, log, users } = platform;

  const q = reviewQueue(platform);
  const pendingTotal = q.products.length + q.stories.length + q.fiscal.length + q.profile.length + q.vendors.length;

  const month = salesByVendor(orders, vendors, plans, monthStart());
  const monthTotals = sumSales(month);
  const active = vendors.filter((v) => v.estado === 'aprobado').length;

  const week = lastSevenDays(orders);
  const weekMax = Math.max(...week.map((d) => d.total), 1);
  const weekTotal = week.reduce((s, d) => s + d.total, 0);
  const todayKey = dateKey(new Date());

  const top = month
    .map((m) => ({ ...m, vendor: vendors.find((v) => v.id === m.vendorId)! }))
    .filter((m) => m.subtotal > 0)
    .sort((a, b) => b.subtotal - a.subtotal)
    .slice(0, 5);

  const expiring = vendors
    .filter((v) => v.estado === 'aprobado' && daysUntil(v.suscripcionFin) <= 7)
    .sort((a, b) => daysUntil(a.suscripcionFin) - daysUntil(b.suscripcionFin));
  const openOrders = orders.filter((o) => o.estadoPedido === 'PENDIENTE').length;

  const queue: { label: string; count: number; icon: LucideIcon; to: string }[] = [
    { label: 'Tiendas por aprobar', count: q.vendors.length, icon: Store, to: '/administrador/aprobaciones?tab=tiendas' },
    { label: 'Cambios de perfil', count: q.profile.length + q.fiscal.length, icon: UserRound, to: '/administrador/aprobaciones?tab=perfiles' },
    { label: 'Productos en revisión', count: q.products.length, icon: Package, to: '/administrador/aprobaciones?tab=productos' },
    { label: 'Historias en revisión', count: q.stories.length, icon: BookOpen, to: '/administrador/aprobaciones?tab=historias' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Panel de administración</h1>
        <p className="mt-1 text-sm text-[#2F3A2F]/55">
          {pendingTotal
            ? `Hay ${pendingTotal} elemento${pendingTotal === 1 ? '' : 's'} esperando tu revisión.`
            : 'No hay aprobaciones pendientes. Todo está al día.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Store} label="Vendedores activos" value={active} hint={`${vendors.length} registrados · ${users.length} usuarios`} />
        <StatCard icon={ClipboardCheck} label="Por aprobar" value={pendingTotal} hint="Tiendas, perfiles, productos e historias" accent={pendingTotal > 0} />
        <StatCard icon={Wallet} label="Ventas del mes" value={money(monthTotals.subtotal)} hint={`${monthTotals.orders} pedidos facturados (sin IVA)`} />
        <StatCard icon={Percent} label="Comisiones del mes" value={money(monthTotals.commission)} hint="Según el plan de cada vendedor" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <SectionTitle action={<span className="text-sm font-bold text-[#4F6F52]">{money(weekTotal)}</span>}>
              Ventas de la plataforma · últimos 7 días
            </SectionTitle>
            <div className="flex h-44 items-end gap-2 sm:gap-4" role="img" aria-label={`Ventas de los últimos 7 días: ${money(weekTotal)} en total`}>
              {week.map((d) => (
                <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[10px] font-bold text-[#2F3A2F]/60 sm:text-xs">{d.total ? `$${Math.round(d.total)}` : ''}</span>
                  <div
                    title={`${d.key}: ${money(d.total)}`}
                    className={`w-full rounded-t-xl ${d.total === 0 ? 'bg-[#2F3A2F]/10' : d.key === todayKey ? 'bg-[#4F6F52]' : 'bg-[#86A789]'}`}
                    style={{ height: `${Math.max(d.total ? 6 : 3, (d.total / weekMax) * 100)}%` }}
                  />
                  <span className={`text-[11px] font-semibold ${d.key === todayKey ? 'text-[#4F6F52]' : 'text-[#6B7A6B]'}`}>
                    {d.key === todayKey ? 'Hoy' : weekdayShort(d.key)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <SectionTitle action={<Link to="/administrador/aprobaciones" className="flex items-center gap-1 text-sm font-semibold text-[#4F6F52]">Abrir bandeja <ChevronRight className="h-4 w-4" /></Link>}>
              Bandeja de aprobaciones
            </SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {queue.map(({ label, count, icon: Icon, to }) => (
                <Link key={label} to={to} className="flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${count ? 'bg-[#F8EBC2] text-[#8A6D12]' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}><Icon className="h-6 w-6" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-extrabold text-[#2F3A2F]">{count}</p>
                    <p className="text-sm text-[#2F3A2F]/60">{label}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#86A789]" />
                </Link>
              ))}
            </div>
          </div>

          <Card className="p-5 sm:p-6">
            <SectionTitle>Actividad reciente</SectionTitle>
            {log.length ? (
              <ul className="space-y-3">
                {log.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-start gap-3 text-sm">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${e.tono === 'ok' ? 'bg-[#4F6F52]' : e.tono === 'warn' ? 'bg-[#D9A441]' : 'bg-[#B4533C]'}`} />
                    <p className="flex-1 leading-snug text-[#2F3A2F]/85">{e.texto}</p>
                    <span className="shrink-0 text-xs text-[#2F3A2F]/45">{prettyStamp(e.fecha)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#2F3A2F]/55">Aún no hay actividad registrada.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionTitle>Top vendedores del mes</SectionTitle>
            {top.length ? (
              <ol className="space-y-3">
                {top.map((t, i) => (
                  <li key={t.vendorId}>
                    <Link to={`/administrador/vendedores/${t.vendorId}`} className="flex items-center gap-3 rounded-2xl transition hover:bg-[#F7F3E8]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCE8D2] text-sm font-bold text-[#4F6F52]">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#2F3A2F]">{t.vendor.nombreComercial}</p>
                        <p className="text-xs text-[#2F3A2F]/55">{t.orders} pedido{t.orders === 1 ? '' : 's'}</p>
                      </div>
                      <span className="text-sm font-extrabold text-[#4F6F52]">{money(t.subtotal)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#2F3A2F]/55">Aún no hay ventas este mes.</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle>Seguimiento</SectionTitle>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[#2F3A2F]/70"><Receipt className="h-4 w-4 text-[#86A789]" /> Pedidos sin aceptar</span>
                <Pill tone={openOrders ? 'amber' : 'green'}>{openOrders}</Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[#2F3A2F]/70"><Store className="h-4 w-4 text-[#86A789]" /> Tiendas suspendidas</span>
                <Pill tone={vendors.some((v) => v.estado === 'suspendido') ? 'red' : 'green'}>{vendors.filter((v) => v.estado === 'suspendido').length}</Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[#2F3A2F]/70"><TrendingUp className="h-4 w-4 text-[#86A789]" /> Ventas totales (sin IVA)</span>
                <b className="text-[#2F3A2F]">{money(sumSales(salesByVendor(orders, vendors, plans)).subtotal)}</b>
              </li>
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle>Suscripciones por vencer</SectionTitle>
            {expiring.length ? (
              <ul className="space-y-3">
                {expiring.map((v) => {
                  const d = daysUntil(v.suscripcionFin);
                  return (
                    <li key={v.id}>
                      <Link to={`/administrador/vendedores/${v.id}`} className="flex items-center gap-3 rounded-2xl transition hover:bg-[#F7F3E8]">
                        <Avatar name={v.nombreComercial} className="h-9 w-9 text-sm" />
                        <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#2F3A2F]">{v.nombreComercial}</p>
                        <Pill tone={d <= 2 ? 'red' : 'amber'} icon={CalendarClock}>{d <= 0 ? 'Vence hoy' : `${d} día${d === 1 ? '' : 's'}`}</Pill>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl bg-[#DCE8D2]/60 p-4 text-sm text-[#3E5C41]">Ninguna suscripción vence en los próximos 7 días.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

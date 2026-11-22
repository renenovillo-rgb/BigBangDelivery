import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, BookOpen, CalendarClock, ChevronRight, Clock, PackageX, Receipt, Star,
  TrendingUp, UserRound, Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { isLowStock, useSeller } from './sellerContext';
import { Card, EmptyState, LinkButton, Pill, SectionTitle, StatCard } from '../../components/ui';
import { ORDER_STATUS, daysFromNow, dateKey, daysUntil, money, prettyStamp, weekdayShort } from '../../components/utils';

interface Alert { icon: LucideIcon; text: string; to: string; tone: 'red' | 'amber' }

export const SellerDashboardPage = () => {
  const { profile, plan, subscription, settings, orders, products, stories, changeRequests, storeOpen } = useSeller();

  const sales = orders.filter((o) => o.estadoPedido !== 'CANCELADO' && o.estadoPedido !== 'PENDIENTE');
  const todayKey = dateKey(new Date());
  const monthKey = todayKey.slice(0, 7);
  const sumTotal = (list: typeof sales) => list.reduce((s, o) => s + o.total, 0);

  const todaySales = sales.filter((o) => o.fechaCreacion.startsWith(todayKey));
  const monthSales = sales.filter((o) => o.fechaCreacion.startsWith(monthKey));
  const pending = orders.filter((o) => o.estadoPedido === 'PENDIENTE');
  const inProgress = orders.filter((o) => ['CONFIRMADO', 'EN_PREPARACION', 'LISTO'].includes(o.estadoPedido));
  const lowStock = products.filter((p) => isLowStock(p, settings.stockMinimo));

  // Ventas de los últimos 7 días (hoy al final)
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = dateKey(daysFromNow(i - 6));
    return { key, total: sumTotal(sales.filter((o) => o.fechaCreacion.startsWith(key))) };
  });
  const weekMax = Math.max(...week.map((d) => d.total), 1);
  const weekTotal = week.reduce((s, d) => s + d.total, 0);

  // Productos más vendidos
  const sold = new Map<string, { name: string; qty: number; revenue: number }>();
  sales.forEach((o) => o.items.forEach((i) => {
    const prev = sold.get(i.productoId) ?? { name: i.nombreProducto, qty: 0, revenue: 0 };
    sold.set(i.productoId, { name: prev.name, qty: prev.qty + i.cantidad, revenue: prev.revenue + i.subtotal });
  }));
  const top = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 4);

  const alerts: Alert[] = [
    ...products.filter((p) => p.estado === 'RECHAZADO').map((p) => ({
      icon: PackageX, text: `“${p.nombre}” fue rechazado. Corrígelo y vuelve a enviarlo.`, to: '/vendedor/productos', tone: 'red' as const,
    })),
    ...products.filter((p) => p.fechaCaducidad && p.estado === 'PUBLICADO' && daysUntil(p.fechaCaducidad) <= 7).map((p) => {
      const d = daysUntil(p.fechaCaducidad!);
      return {
        icon: CalendarClock,
        text: d < 0 ? `“${p.nombre}” ya está vencido.` : `“${p.nombre}” vence ${d === 0 ? 'hoy' : `en ${d} día${d === 1 ? '' : 's'}`}.`,
        to: '/vendedor/productos', tone: d <= 2 ? 'red' as const : 'amber' as const,
      };
    }),
    ...lowStock.map((p) => ({
      icon: AlertTriangle, text: `Stock bajo: “${p.nombre}” (${p.stock} ${p.unidadMedida ?? 'u.'}).`, to: '/vendedor/productos', tone: 'amber' as const,
    })),
    ...stories.filter((s) => s.estado === 'RECHAZADA').map((s) => ({
      icon: BookOpen, text: `La historia ${s.codigoHistoria} fue rechazada.`, to: '/vendedor/historias', tone: 'amber' as const,
    })),
    ...changeRequests.filter((r) => r.estado === 'PENDIENTE').map(() => ({
      icon: UserRound, text: 'Tienes una solicitud de cambio de datos pendiente.', to: '/vendedor/perfil', tone: 'amber' as const,
    })),
  ];

  const used = products.length;
  const usedPct = Math.min(100, Math.round((used / plan.limiteProductos) * 100));
  const renewIn = daysUntil(subscription.fechaFin);
  const urgent = [...pending, ...orders.filter((o) => o.estadoPedido === 'LISTO')];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Hola, {profile.nombreCompleto.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-[#2F3A2F]/55">
            {pending.length
              ? `Tienes ${pending.length} pedido${pending.length === 1 ? '' : 's'} nuevo${pending.length === 1 ? '' : 's'} esperando tu respuesta.`
              : 'No tienes pedidos pendientes. ¡Buen trabajo!'}
          </p>
        </div>
        {!storeOpen && (
          <Pill tone="red" icon={Clock} className="self-start sm:self-auto">Tu tienda está cerrada: no recibes pedidos nuevos</Pill>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Ventas de hoy" value={money(sumTotal(todaySales))} hint={`${todaySales.length} pedido${todaySales.length === 1 ? '' : 's'} confirmados`} />
        <StatCard icon={TrendingUp} label="Ventas del mes" value={money(sumTotal(monthSales))} hint={`${monthSales.length} pedidos`} />
        <StatCard icon={Receipt} label="Por atender" value={pending.length} hint={`${inProgress.length} en curso`} accent={pending.length > 0} />
        <StatCard icon={AlertTriangle} label="Stock bajo" value={lowStock.length} hint={`Mínimo: ${settings.stockMinimo} unidades`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <SectionTitle action={<span className="text-sm font-bold text-[#4F6F52]">{money(weekTotal)}</span>}>
              Ventas de los últimos 7 días
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
            <SectionTitle action={<Link to="/vendedor/pedidos" className="flex items-center gap-1 text-sm font-semibold text-[#4F6F52]">Ver todos <ChevronRight className="h-4 w-4" /></Link>}>
              Pedidos que requieren acción
            </SectionTitle>
            {urgent.length ? (
              <div className="space-y-3">
                {urgent.map((o) => {
                  const st = ORDER_STATUS[o.estadoPedido];
                  return (
                    <Card key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCE8D2] text-[#4F6F52]">
                        <Receipt className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-sm font-bold text-[#4F6F52]">#{o.numeroPedido}</span>
                          <span className="text-xs text-[#2F3A2F]/50">{prettyStamp(o.fechaCreacion)}</span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-[#2F3A2F]/80">
                          {o.nombreCliente} · {o.items.map((i) => `${i.cantidad}× ${i.nombreProducto}`).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                        <span className="text-lg font-extrabold text-[#2F3A2F]">{money(o.total)}</span>
                        <Pill tone={st.tone}>{st.label}</Pill>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Receipt} title="Todo al día" text="Cuando llegue un pedido nuevo aparecerá aquí para que lo atiendas." />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionTitle>Requiere tu atención</SectionTitle>
            {alerts.length ? (
              <ul className="space-y-2">
                {alerts.slice(0, 6).map((a) => (
                  <li key={a.text}>
                    <Link
                      to={a.to}
                      className={`flex items-start gap-3 rounded-2xl p-3 text-sm transition hover:brightness-95 ${a.tone === 'red' ? 'bg-[#F2D9D0]/70 text-[#7A3322]' : 'bg-[#F8EBC2]/70 text-[#6B5410]'}`}
                    >
                      <a.icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="flex-1 leading-snug">{a.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-[#DCE8D2]/60 p-4 text-sm text-[#3E5C41]">Nada pendiente por ahora. Tu tienda está en orden.</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle>Más vendidos</SectionTitle>
            {top.length ? (
              <ol className="space-y-3">
                {top.map((t, i) => (
                  <li key={t.name} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCE8D2] text-sm font-bold text-[#4F6F52]">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#2F3A2F]">{t.name}</p>
                      <p className="text-xs text-[#2F3A2F]/55">{t.qty} vendidos</p>
                    </div>
                    <span className="text-sm font-extrabold text-[#4F6F52]">{money(t.revenue)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#2F3A2F]/55">Aún no hay ventas confirmadas.</p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#2F3A2F] sm:text-lg">{plan.nombre}</h2>
              <Pill tone={renewIn <= 7 ? 'amber' : 'green'} icon={Star}>{subscription.estado === 'activa' ? 'Activo' : subscription.estado}</Pill>
            </div>
            <p className="mt-3 flex justify-between text-sm text-[#2F3A2F]/70">
              <span>Publicaciones</span>
              <span className="font-bold text-[#2F3A2F]">{used} de {plan.limiteProductos}</span>
            </p>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#2F3A2F]/10">
              <div className={`h-full rounded-full ${usedPct >= 90 ? 'bg-[#B4533C]' : 'bg-[#4F6F52]'}`} style={{ width: `${usedPct}%` }} />
            </div>
            <p className="mt-3 text-xs text-[#2F3A2F]/55">
              Comisión {plan.comisionPorcentaje}% por venta · se renueva en {renewIn} día{renewIn === 1 ? '' : 's'}.
            </p>
            <LinkButton to="/vendedor/perfil" variant="ghost" className="mt-2 -ml-2">Ver mi plan <ArrowRight className="h-4 w-4" /></LinkButton>
          </Card>
        </div>
      </div>
    </div>
  );
};

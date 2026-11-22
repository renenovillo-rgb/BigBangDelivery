import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Store, Wrench, X } from 'lucide-react';
import type { EstadoTienda } from '../../types';
import { reviewQueue, usePlatform } from '../../platform/platformContext';
import { Card, Chip, EmptyState, PageHeading, Pill } from '../../components/ui';
import { inputCls, money } from '../../components/utils';
import { monthStart, salesByVendor } from './stats';
import { VENDOR_STATUS } from './labels';
import { Avatar } from './parts';

type Filter = 'todos' | EstadoTienda;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'aprobado', label: 'Activos' },
  { id: 'pendiente', label: 'Por aprobar' },
  { id: 'suspendido', label: 'Suspendidos' },
];

export const AdminVendorsPage = () => {
  const platform = usePlatform();
  const { vendors, plans, orders, products } = platform;

  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const sales = salesByVendor(orders, vendors, plans, monthStart());
  const queue = reviewQueue(platform);
  const pendingOf = (id: string, tiendaId: string) =>
    queue.products.filter((p) => p.tiendaId === tiendaId).length
    + queue.stories.filter((s) => s.vendedorId === id).length
    + queue.fiscal.filter((r) => r.vendedorId === id).length
    + queue.profile.filter((r) => r.vendedorId === id).length;

  const list = vendors
    .filter((v) => filter === 'todos' || v.estado === filter)
    .filter((v) => !q || `${v.nombreComercial} ${v.nombreCompleto} ${v.identificacionFiscal}`.toLowerCase().includes(q));
  const count = (f: Filter) => (f === 'todos' ? vendors.length : vendors.filter((v) => v.estado === f).length);

  return (
    <div className="space-y-5">
      <PageHeading
        title="Vendedores"
        subtitle="Controla quién vende en la plataforma, su plan y lo que publican. Entra a un vendedor para aprobar sus cambios de perfil."
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {FILTERS.map((f) => <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={count(f.id)}>{f.label}</Chip>)}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#2F3A2F]/10 focus-within:ring-2 focus-within:ring-[#4F6F52] sm:max-w-md">
        <Search className="h-5 w-5 shrink-0 text-[#86A789]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca por nombre, responsable o RUC…" aria-label="Buscar vendedores" className={inputCls} />
        {query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X className="h-4 w-4 text-[#2F3A2F]/50" /></button>}
      </div>

      {list.length ? (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((v) => {
            const st = VENDOR_STATUS[v.estado];
            const plan = plans.find((p) => p.id === v.planId);
            const s = sales.find((x) => x.vendorId === v.id)!;
            const pending = pendingOf(v.id, v.tiendaId);
            const published = products.filter((p) => p.tiendaId === v.tiendaId && p.estado === 'PUBLICADO').length;
            return (
              <Link key={v.id} to={`/administrador/vendedores/${v.id}`} className="group block">
                <Card className="flex h-full flex-col p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <Avatar name={v.nombreComercial} className="h-12 w-12 text-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-extrabold text-[#2F3A2F]">{v.nombreComercial}</p>
                      <p className="truncate text-xs text-[#2F3A2F]/55">{v.nombreCompleto}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#4F6F52]">
                        {v.tipo === 'prestador' ? <Wrench className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
                        {v.tipo === 'prestador' ? 'Prestador de servicios' : 'Productor'} · {v.categoriaPrincipal}
                      </p>
                    </div>
                    <Pill tone={st.tone}>{st.label}</Pill>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#F7F3E8] p-3 text-center">
                    <div><dd className="text-base font-extrabold text-[#2F3A2F]">{money(s.subtotal)}</dd><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A6B]">Ventas mes</dt></div>
                    <div><dd className="text-base font-extrabold text-[#2F3A2F]">{published}</dd><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A6B]">Publicados</dt></div>
                    <div><dd className="text-base font-extrabold text-[#2F3A2F]">{plan?.comisionPorcentaje ?? 0}%</dd><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A6B]">Comisión</dt></div>
                  </dl>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#2F3A2F]/60">{plan?.nombre}</span>
                    {pending > 0
                      ? <Pill tone="amber">{pending} por revisar</Pill>
                      : <span className="flex items-center gap-0.5 text-xs font-semibold text-[#4F6F52]">Ver detalle <ChevronRight className="h-4 w-4" /></span>}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Store} title="No hay vendedores con estos filtros" text="Prueba con otro estado o cambia la búsqueda." />
      )}
    </div>
  );
};

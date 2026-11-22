import { useSearchParams } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Package, Store, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { reviewQueue, usePlatform } from '../../platform/platformContext';
import { Card, Chip, EmptyState, LinkButton, PageHeading, Pill } from '../../components/ui';
import { prettyStamp } from '../../components/utils';
import {
  Avatar, FiscalRequestCard, ProductReviewCard, ProfileRequestCard, ReviewActions, StoryReviewCard,
} from './parts';

type Tab = 'tiendas' | 'perfiles' | 'productos' | 'historias';

const TABS: { id: Tab; label: string; icon: LucideIcon; empty: string }[] = [
  { id: 'tiendas', label: 'Tiendas nuevas', icon: Store, empty: 'No hay tiendas esperando aprobación.' },
  { id: 'perfiles', label: 'Cambios de perfil', icon: UserRound, empty: 'No hay solicitudes de cambio de perfil pendientes.' },
  { id: 'productos', label: 'Productos y servicios', icon: Package, empty: 'No hay publicaciones esperando revisión.' },
  { id: 'historias', label: 'Historias', icon: BookOpen, empty: 'No hay historias esperando revisión.' },
];

export const AdminApprovalsPage = () => {
  const platform = usePlatform();
  const { setVendorStatus } = platform;
  const [params, setParams] = useSearchParams();

  const q = reviewQueue(platform);
  const counts: Record<Tab, number> = {
    tiendas: q.vendors.length,
    perfiles: q.profile.length + q.fiscal.length,
    productos: q.products.length,
    historias: q.stories.length,
  };
  const requested = params.get('tab') as Tab | null;
  const tab: Tab = TABS.some((t) => t.id === requested) ? (requested as Tab) : TABS.find((t) => counts[t.id] > 0)?.id ?? 'tiendas';
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-5">
      <PageHeading
        title="Aprobaciones"
        subtitle="Revisa lo que envían los vendedores antes de que llegue a los compradores."
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {TABS.map((t) => (
          <Chip key={t.id} active={tab === t.id} onClick={() => setParams({ tab: t.id })} count={counts[t.id]}>
            <t.icon className="h-4 w-4" /> {t.label}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {tab === 'tiendas' && q.vendors.map((v) => (
          <Card key={v.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={v.nombreComercial} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#2F3A2F]">{v.nombreComercial}</p>
                  <p className="text-xs text-[#2F3A2F]/55">{v.nombreCompleto} · registrada el {prettyStamp(v.fechaRegistro)}</p>
                </div>
              </div>
              <Pill tone="amber">Por aprobar</Pill>
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div><dt className="text-xs font-bold uppercase tracking-wide text-[#6B7A6B]">RUC / Cédula</dt><dd className="font-mono">{v.identificacionFiscal}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-[#6B7A6B]">Categoría</dt><dd>{v.categoriaPrincipal}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-[#6B7A6B]">Dirección</dt><dd>{v.direccionNegocio}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#2F3A2F]/10 pt-3">
              <LinkButton to={`/administrador/vendedores/${v.id}`} variant="ghost">Ver detalle</LinkButton>
              <ReviewActions
                approveLabel="Aprobar tienda"
                rejectLabel="Rechazar"
                onApprove={() => setVendorStatus(v.id, 'aprobado')}
                onReject={(reason) => setVendorStatus(v.id, 'suspendido', reason)}
                reasonTitle={`Rechazar a “${v.nombreComercial}”`}
                reasonHint="Ej: el RUC no corresponde a la actividad declarada."
              />
            </div>
          </Card>
        ))}

        {tab === 'perfiles' && (
          <>
            {q.profile.map((r) => <ProfileRequestCard key={r.id} req={r} />)}
            {q.fiscal.map((r) => <FiscalRequestCard key={r.id} req={r} />)}
          </>
        )}
        {tab === 'productos' && q.products.map((p) => <ProductReviewCard key={p.id} product={p} />)}
        {tab === 'historias' && q.stories.map((s) => <StoryReviewCard key={s.id} story={s} />)}

        {counts[tab] === 0 && <EmptyState icon={ClipboardCheck} title="Todo al día" text={current.empty} />}
      </div>
    </div>
  );
};

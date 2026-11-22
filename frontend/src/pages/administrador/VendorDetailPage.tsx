import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, CalendarClock, FileText, Globe, Mail, MapPin, Phone, ShieldCheck, Star, Store, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { reviewQueue, usePlatform } from '../../platform/platformContext';
import { Button, Card, Chip, EmptyState, Field, LinkButton, Modal, Pill, SectionTitle, StatCard } from '../../components/ui';
import { ITEM_TYPE, PRODUCT_STATUS, STORY_STATUS, daysUntil, inputCls, money, prettyStamp } from '../../components/utils';
import { monthStart, salesByVendor } from './stats';
import { VENDOR_STATUS } from './labels';
import { Avatar, FiscalRequestCard, ProductReviewCard, ProfileRequestCard, StoryReviewCard } from './parts';

type Tab = 'resumen' | 'solicitudes' | 'publicaciones' | 'perfil';

export const AdminVendorDetailPage = () => {
  const { id } = useParams();
  const platform = usePlatform();
  const { vendors, plans, orders, products, stories, fiscalRequests, profileRequests, setVendorStatus, setVendorPlan, publicSeller } = platform;

  const [tab, setTab] = useState<Tab>('resumen');
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const v = vendors.find((x) => x.id === id);
  if (!v) {
    return (
      <EmptyState
        icon={Store}
        title="No encontramos a este vendedor"
        action={<LinkButton to="/administrador/vendedores" variant="primary">Volver a vendedores</LinkButton>}
      />
    );
  }

  const st = VENDOR_STATUS[v.estado];
  const plan = plans.find((p) => p.id === v.planId);
  const month = salesByVendor(orders, [v], plans, monthStart())[0];
  const total = salesByVendor(orders, [v], plans)[0];
  const myProducts = products.filter((p) => p.tiendaId === v.tiendaId);
  const myStories = stories.filter((s) => s.vendedorId === v.id);
  const myFiscal = fiscalRequests.filter((r) => r.vendedorId === v.id);
  const myProfile = profileRequests.filter((r) => r.vendedorId === v.id);
  const queue = reviewQueue(platform);
  const pendingRequests = myFiscal.filter((r) => r.estado === 'PENDIENTE').length + myProfile.filter((r) => r.estado === 'PENDIENTE').length;
  const pendingPublications = queue.products.filter((p) => p.tiendaId === v.tiendaId).length + queue.stories.filter((s) => s.vendedorId === v.id).length;
  const renew = daysUntil(v.suscripcionFin);
  const buyerView = v.catalogId ? publicSeller(v.catalogId) : undefined;

  const closeSuspend = () => { setSuspending(false); setReason(''); setReasonError(false); };
  const confirmSuspend = () => {
    if (!reason.trim()) { setReasonError(true); return; }
    setVendorStatus(v.id, 'suspendido', reason.trim());
    closeSuspend();
  };

  const info: { label: string; value: string; icon: LucideIcon; mono?: boolean }[] = [
    { label: 'Correo', value: v.email, icon: Mail },
    { label: 'Teléfono', value: v.telefono, icon: Phone },
    { label: 'RUC / Cédula', value: v.identificacionFiscal, icon: FileText, mono: true },
    { label: 'Establecimiento – punto de emisión', value: `${v.establecimiento} – ${v.puntoEmision}`, icon: ShieldCheck, mono: true },
    { label: 'Dirección fiscal', value: v.direccionNegocio, icon: MapPin },
    { label: 'Registro', value: prettyStamp(v.fechaRegistro), icon: CalendarClock },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <Link to="/administrador/vendedores" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F6F52] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Todos los vendedores
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={v.nombreComercial} className="h-16 w-16 text-2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold text-[#2F3A2F] sm:text-2xl">{v.nombreComercial}</h1>
            <p className="text-sm text-[#2F3A2F]/60">{v.nombreCompleto} · {v.id}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill tone={st.tone}>{st.label}</Pill>
              <Pill tone="gray" icon={v.tipo === 'prestador' ? Wrench : Store}>{v.tipo === 'prestador' ? 'Prestador' : 'Productor'}</Pill>
              <Pill tone="blue" icon={BadgeCheck}>{plan?.nombre}</Pill>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {v.estado !== 'aprobado' && (
              <Button onClick={() => setVendorStatus(v.id, 'aprobado')}>{v.estado === 'pendiente' ? 'Aprobar tienda' : 'Reactivar tienda'}</Button>
            )}
            {v.estado !== 'suspendido' && <Button variant="danger" onClick={() => setSuspending(true)}>{v.estado === 'pendiente' ? 'Rechazar' : 'Suspender'}</Button>}
          </div>
        </div>
        {v.estado === 'suspendido' && v.motivoSuspension && (
          <p className="mt-4 rounded-2xl bg-[#F2D9D0]/70 p-3.5 text-sm text-[#7A3322]"><b>Motivo de la suspensión:</b> {v.motivoSuspension}</p>
        )}
      </Card>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        <Chip active={tab === 'resumen'} onClick={() => setTab('resumen')}>Resumen</Chip>
        <Chip active={tab === 'solicitudes'} onClick={() => setTab('solicitudes')} count={pendingRequests}>Solicitudes de cambio</Chip>
        <Chip active={tab === 'publicaciones'} onClick={() => setTab('publicaciones')} count={pendingPublications}>Publicaciones</Chip>
        <Chip active={tab === 'perfil'} onClick={() => setTab('perfil')}>Perfil público</Chip>
      </div>

      {tab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard icon={Store} label="Ventas del mes" value={money(month.subtotal)} hint={`${month.orders} pedidos (sin IVA)`} />
            <StatCard icon={Store} label="Ventas totales" value={money(total.subtotal)} hint={`${total.orders} pedidos facturados`} />
            <StatCard icon={Store} label="Comisión generada" value={money(total.commission)} hint={`${plan?.comisionPorcentaje ?? 0}% por venta`} />
            <StatCard icon={Store} label="Publicaciones" value={`${myProducts.length}/${plan?.limiteProductos ?? 0}`} hint="Usadas del plan" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 sm:p-6 lg:col-span-2">
              <SectionTitle>Datos del vendedor</SectionTitle>
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {info.map(({ label, value, icon: Icon, mono }) => (
                  <div key={label} className="flex items-start gap-3 border-b border-[#2F3A2F]/10 py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#86A789]" />
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">{label}</dt>
                      <dd className={`break-words text-sm text-[#2F3A2F] ${mono ? 'font-mono' : ''}`}>{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="h-fit p-5 sm:p-6">
              <SectionTitle>Plan y suscripción</SectionTitle>
              <Field label="Plan asignado">
                <select value={v.planId} onChange={(e) => setVendorPlan(v.id, e.target.value)} className={inputCls}>
                  {plans.map((p) => <option key={p.id} value={p.id} disabled={!p.activo}>{p.nombre} · {money(p.precioMensual)}/mes{p.activo ? '' : ' (inactivo)'}</option>)}
                </select>
              </Field>
              <ul className="mt-4 space-y-2 text-sm text-[#2F3A2F]/70">
                <li className="flex justify-between"><span>Límite</span><b className="text-[#2F3A2F]">{plan?.limiteProductos} publicaciones</b></li>
                <li className="flex justify-between"><span>Comisión</span><b className="text-[#2F3A2F]">{plan?.comisionPorcentaje}%</b></li>
                <li className="flex justify-between"><span>Vence</span>
                  <Pill tone={renew < 0 ? 'red' : renew <= 7 ? 'amber' : 'green'}>{renew < 0 ? `Venció hace ${-renew} d` : `en ${renew} días`}</Pill>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === 'solicitudes' && (
        <div className="space-y-3">
          {myProfile.length + myFiscal.length === 0 && <EmptyState icon={ShieldCheck} title="Sin solicitudes" text="Este vendedor no ha pedido cambios en su perfil." />}
          {[...myProfile].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)).map((r) => <ProfileRequestCard key={r.id} req={r} showVendor={false} />)}
          {[...myFiscal].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)).map((r) => <FiscalRequestCard key={r.id} req={r} showVendor={false} />)}
        </div>
      )}

      {tab === 'publicaciones' && (
        <div className="space-y-6">
          <div>
            <SectionTitle>Productos y servicios</SectionTitle>
            {myProducts.length ? (
              <div className="space-y-3">
                {myProducts.map((p) => {
                  if (p.estado === 'PENDIENTE_REVISION') return <ProductReviewCard key={p.id} product={p} showVendor={false} />;
                  const ps = PRODUCT_STATUS[p.estado];
                  const type = ITEM_TYPE[p.tipo];
                  return (
                    <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#2F3A2F]">{p.nombre}</p>
                        <p className="text-xs text-[#2F3A2F]/55">{p.categoriaNombre} · {money(p.precio)}{p.unidadMedida ? ` / ${p.unidadMedida}` : ''}</p>
                      </div>
                      <div className="flex gap-2"><Pill tone={type.tone}>{type.label}</Pill><Pill tone={ps.tone}>{ps.label}</Pill></div>
                      {p.estado === 'RECHAZADO' && p.motivoRechazo && <p className="w-full rounded-2xl bg-[#F2D9D0]/70 p-3 text-xs text-[#7A3322]"><b>Motivo:</b> {p.motivoRechazo}</p>}
                    </Card>
                  );
                })}
              </div>
            ) : <EmptyState icon={Store} title="Sin publicaciones" text="Aún no ha creado productos ni servicios." />}
          </div>

          <div>
            <SectionTitle>Historias</SectionTitle>
            {myStories.length ? (
              <div className="space-y-3">
                {myStories.map((s) => {
                  if (s.estado === 'EN_REVISION') return <StoryReviewCard key={s.id} story={s} showVendor={false} />;
                  const ss = STORY_STATUS[s.estado];
                  return (
                    <Card key={s.id} className="flex items-center justify-between gap-3 p-4">
                      <p className="min-w-0 truncate text-sm font-bold text-[#2F3A2F]">{s.codigoHistoria} · {s.nombreProducto}</p>
                      <Pill tone={ss.tone}>{ss.label}</Pill>
                    </Card>
                  );
                })}
              </div>
            ) : <p className="text-sm text-[#2F3A2F]/55">Sin historias enviadas.</p>}
          </div>
        </div>
      )}

      {tab === 'perfil' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <SectionTitle>Así lo ve el comprador</SectionTitle>
            {buyerView ? (
              <>
                <p className="-mt-1 mb-4 flex items-center gap-1.5 text-xs text-[#2F3A2F]/55"><Globe className="h-3.5 w-3.5" /> Botón “{buyerView.legend}” en el detalle del producto.</p>
                <div className="overflow-hidden rounded-3xl ring-1 ring-black/5">
                  <div className="h-24 bg-gradient-to-br from-[#DCE8D2] to-[#B9D1AE]" />
                  <div className="px-5 pb-5">
                    <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-4 ring-white"><Store className="h-7 w-7 text-[#4F6F52]" /></span>
                    <h3 className="mt-3 text-lg font-extrabold text-[#2F3A2F]">{buyerView.name}</h3>
                    <p className="text-sm font-medium text-[#4F6F52]">{buyerView.tagline}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#2F3A2F]/60"><MapPin className="h-3.5 w-3.5 text-[#86A789]" /> {buyerView.location} · desde {buyerView.since}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#2F3A2F]/60"><Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" /> {buyerView.rating.toFixed(1)} · {buyerView.reviews} reseñas</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#2F3A2F]/75">{buyerView.about}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {buyerView.activities.map((a) => <li key={a} className="rounded-full bg-[#DCE8D2]/60 px-3 py-1 text-xs font-semibold text-[#3E5C41]">{a}</li>)}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState icon={Globe} title="Aún sin perfil público" text="Se creará cuando apruebes la tienda y publique su primer producto." />
            )}
          </Card>

          <Card className="h-fit p-5 sm:p-6">
            <SectionTitle>Cambios pendientes</SectionTitle>
            {myProfile.some((r) => r.estado === 'PENDIENTE') ? (
              <div className="space-y-3">
                {myProfile.filter((r) => r.estado === 'PENDIENTE').map((r) => <ProfileRequestCard key={r.id} req={r} showVendor={false} />)}
              </div>
            ) : (
              <p className="text-sm text-[#2F3A2F]/55">No hay cambios esperando aprobación. Cuando el vendedor edite su perfil público, aparecerá aquí.</p>
            )}
          </Card>
        </div>
      )}

      {suspending && (
        <Modal
          onClose={closeSuspend}
          title={v.estado === 'pendiente' ? `Rechazar a “${v.nombreComercial}”` : `Suspender “${v.nombreComercial}”`}
          subtitle="Sus publicaciones dejarán de mostrarse a los compradores."
          footer={(
            <>
              <Button variant="secondary" onClick={closeSuspend}>Volver</Button>
              <Button variant="danger" onClick={confirmSuspend}>{v.estado === 'pendiente' ? 'Rechazar' : 'Suspender'}</Button>
            </>
          )}
        >
          <div className="pb-3">
            <Field label="Motivo" error={reasonError ? 'Indica un motivo para continuar.' : undefined}>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => { setReason(e.target.value); setReasonError(false); }}
                placeholder="Ej: reclamos reiterados por productos en mal estado."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

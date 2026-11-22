import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, X } from 'lucide-react';
import type { Producto, SolicitudActualizacionPerfil, SolicitudHistoriaProducto } from '../../types';
import { Button, Card, Field, Modal, Pill, ProductThumb } from '../../components/ui';
import { ITEM_TYPE, inputCls, money, prettyStamp } from '../../components/utils';
import type { Tone } from '../../components/utils';
import { usePlatform } from '../../platform/platformContext';
import type { ProfileRequest } from '../../platform/platformData';
import { FISCAL_FIELD_LABEL, PUBLIC_FIELD_LABEL } from './labels';

/* ------------------------------------------------------------------ */
/*  Piezas compartidas del panel del administrador                      */
/* ------------------------------------------------------------------ */

export const Avatar = ({ name, className = 'h-11 w-11 text-base' }: { name: string; className?: string }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full bg-[#4F6F52] font-bold text-[#F7F3E8] ${className}`}>
    {name.charAt(0).toUpperCase()}
  </span>
);

export const VendorLink = ({ id, name }: { id: string; name: string }) => (
  <Link to={`/administrador/vendedores/${id}`} className="inline-flex items-center gap-0.5 font-bold text-[#2F3A2F] hover:text-[#4F6F52] hover:underline">
    {name} <ChevronRight className="h-3.5 w-3.5" />
  </Link>
);

/* Botones Aprobar / Rechazar. Rechazar pide un motivo que verá el vendedor. */
export const ReviewActions = ({ onApprove, onReject, approveLabel = 'Aprobar', rejectLabel = 'Rechazar', reasonTitle, reasonHint }: {
  onApprove: () => void;
  onReject: (reason: string) => void;
  approveLabel?: string;
  rejectLabel?: string;
  reasonTitle: string;
  reasonHint: string;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  const close = () => { setOpen(false); setReason(''); setError(false); };
  const confirm = () => {
    if (!reason.trim()) { setError(true); return; }
    onReject(reason.trim());
    close();
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}><X className="h-4 w-4" /> {rejectLabel}</Button>
      <Button size="sm" onClick={onApprove}><Check className="h-4 w-4" /> {approveLabel}</Button>

      {open && (
        <Modal
          onClose={close}
          title={reasonTitle}
          subtitle="El vendedor verá este mensaje."
          footer={(
            <>
              <Button variant="secondary" onClick={close}>Volver</Button>
              <Button variant="danger" onClick={confirm}>{rejectLabel}</Button>
            </>
          )}
        >
          <div className="pb-3">
            <Field label="Motivo" error={error ? 'Indica un motivo para continuar.' : undefined}>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(false); }}
                placeholder={reasonHint}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
};

const Diff = ({ label, from, to }: { label: string; from?: string; to: string }) => (
  <div className="rounded-2xl bg-[#F7F3E8] p-3.5 text-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-[#6B7A6B]">{label}</p>
    {from !== undefined && (
      <p className="mt-1 text-[#2F3A2F]/55 line-through decoration-[#B4533C]/60">{from || '—'}</p>
    )}
    <p className="mt-0.5 flex items-start gap-1.5 font-semibold text-[#2F3A2F]">
      {from !== undefined && <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#4F6F52]" />}
      <span className="whitespace-pre-line">{to}</span>
    </p>
  </div>
);

const ReviewShell = ({ vendor, date, pill, children, actions }: {
  vendor?: ReactNode; date?: string; pill: ReactNode; children: ReactNode; actions?: ReactNode;
}) => (
  <Card className="p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 text-sm">
        {vendor && <p className="text-[#2F3A2F]">{vendor}</p>}
        {date && <p className="text-xs text-[#2F3A2F]/50">{prettyStamp(date)}</p>}
      </div>
      {pill}
    </div>
    <div className="mt-3 space-y-3">{children}</div>
    {actions && <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#2F3A2F]/10 pt-3">{actions}</div>}
  </Card>
);

const ResolvedNote = ({ ok, text }: { ok: boolean; text?: string }) =>
  text ? (
    <p className={`rounded-2xl p-3 text-xs leading-relaxed ${ok ? 'bg-[#DCE8D2]/70 text-[#3E5C41]' : 'bg-[#F2D9D0]/70 text-[#7A3322]'}`}>
      <b>Respuesta:</b> {text}
    </p>
  ) : null;

const REQUEST_PILL: Record<string, { label: string; tone: Tone }> = {
  PENDIENTE: { label: 'Pendiente', tone: 'amber' },
  APROBADA: { label: 'Aprobada', tone: 'green' },
  RECHAZADA: { label: 'Rechazada', tone: 'red' },
};

/* Cambio de datos fiscales (RUC, teléfono, dirección…) */
export const FiscalRequestCard = ({ req, showVendor = true }: { req: SolicitudActualizacionPerfil; showVendor?: boolean }) => {
  const { vendors, resolveFiscalRequest } = usePlatform();
  const v = vendors.find((x) => x.id === req.vendedorId);
  const st = REQUEST_PILL[req.estado];
  return (
    <ReviewShell
      vendor={showVendor && v ? <VendorLink id={v.id} name={v.nombreComercial} /> : undefined}
      date={req.fechaCreacion}
      pill={<Pill tone={st.tone}>{st.label}</Pill>}
      actions={req.estado === 'PENDIENTE' && (
        <ReviewActions
          approveLabel="Aprobar y aplicar"
          onApprove={() => resolveFiscalRequest(req.id, true, '')}
          onReject={(reason) => resolveFiscalRequest(req.id, false, reason)}
          reasonTitle={`Rechazar cambio de ${FISCAL_FIELD_LABEL[req.campoAModificar].toLowerCase()}`}
          reasonHint="Ej: el documento de respaldo no es legible."
        />
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#4F6F52]">Datos fiscales · {FISCAL_FIELD_LABEL[req.campoAModificar]}</p>
      <Diff label="Cambio solicitado" from={req.valorActual} to={req.nuevoValor} />
      <p className="text-xs text-[#2F3A2F]/65"><b>Motivo del vendedor:</b> {req.justificacion}</p>
      <ResolvedNote ok={req.estado === 'APROBADA'} text={req.respuestaAdmin} />
    </ReviewShell>
  );
};

/* Cambio del perfil público ("Conoce quiénes somos" del comprador) */
export const ProfileRequestCard = ({ req, showVendor = true }: { req: ProfileRequest; showVendor?: boolean }) => {
  const { vendors, publicSeller, resolveProfileRequest } = usePlatform();
  const v = vendors.find((x) => x.id === req.vendedorId);
  const current = v?.catalogId ? publicSeller(v.catalogId) : undefined;
  const st = REQUEST_PILL[req.estado];
  const c = req.cambios;
  return (
    <ReviewShell
      vendor={showVendor && v ? <VendorLink id={v.id} name={v.nombreComercial} /> : undefined}
      date={req.fechaCreacion}
      pill={<Pill tone={st.tone}>{st.label}</Pill>}
      actions={req.estado === 'PENDIENTE' && (
        <ReviewActions
          approveLabel="Aprobar y publicar"
          onApprove={() => resolveProfileRequest(req.id, true, '')}
          onReject={(reason) => resolveProfileRequest(req.id, false, reason)}
          reasonTitle="Rechazar cambio del perfil público"
          reasonHint="Ej: la descripción incluye afirmaciones que no podemos verificar."
        />
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#4F6F52]">Perfil público · lo que ve el comprador</p>
      {c.tagline !== undefined && <Diff label={PUBLIC_FIELD_LABEL.tagline} from={current?.tagline} to={c.tagline} />}
      {c.location !== undefined && <Diff label={PUBLIC_FIELD_LABEL.location} from={current?.location} to={c.location} />}
      {c.about !== undefined && <Diff label={PUBLIC_FIELD_LABEL.about} from={current?.about} to={c.about} />}
      {c.activities !== undefined && (
        <Diff label={PUBLIC_FIELD_LABEL.activities} from={current?.activities.join(' · ')} to={c.activities.join(' · ')} />
      )}
      <p className="text-xs text-[#2F3A2F]/65"><b>Motivo del vendedor:</b> {req.justificacion}</p>
      <ResolvedNote ok={req.estado === 'APROBADA'} text={req.respuestaAdmin} />
    </ReviewShell>
  );
};

/* Producto o servicio en moderación */
export const ProductReviewCard = ({ product, showVendor = true }: { product: Producto; showVendor?: boolean }) => {
  const { vendors, reviewProduct } = usePlatform();
  const v = vendors.find((x) => x.tiendaId === product.tiendaId);
  const type = ITEM_TYPE[product.tipo];
  return (
    <ReviewShell
      vendor={showVendor && v ? <VendorLink id={v.id} name={v.nombreComercial} /> : undefined}
      date={product.fechaCreacion}
      pill={<Pill tone="amber">En revisión</Pill>}
      actions={(
        <ReviewActions
          approveLabel="Aprobar y publicar"
          onApprove={() => reviewProduct(product.id, true, '')}
          onReject={(reason) => reviewProduct(product.id, false, reason)}
          reasonTitle={`Rechazar “${product.nombre}”`}
          reasonHint="Ej: la imagen no corresponde al producto."
        />
      )}
    >
      <div className="flex gap-3">
        <ProductThumb key={product.imagenUrl} src={product.imagenUrl} name={product.nombre} tipo={product.tipo} className="h-20 w-20 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#2F3A2F]">{product.nombre}</p>
          <p className="mt-0.5 text-xs text-[#2F3A2F]/55">{product.categoriaNombre ?? 'General'} · <Pill tone={type.tone} className="!px-2 !py-0 !text-[10px]">{type.label}</Pill></p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#2F3A2F]/65">{product.descripcion}</p>
          <p className="mt-1 text-sm font-extrabold text-[#4F6F52]">
            {money(product.precio)}{product.unidadMedida && <span className="text-[11px] font-medium text-[#2F3A2F]/45"> / {product.unidadMedida}</span>}
            {product.stock !== undefined && <span className="ml-2 text-[11px] font-medium text-[#2F3A2F]/55">Stock: {product.stock}</span>}
          </p>
        </div>
      </div>
    </ReviewShell>
  );
};

/* Historia de producto en revisión */
export const StoryReviewCard = ({ story, showVendor = true }: { story: SolicitudHistoriaProducto; showVendor?: boolean }) => {
  const { vendors, reviewStory } = usePlatform();
  const v = vendors.find((x) => x.id === story.vendedorId);
  return (
    <ReviewShell
      vendor={showVendor && v ? <VendorLink id={v.id} name={v.nombreComercial} /> : undefined}
      date={story.fechaCreacion}
      pill={<Pill tone="amber">En revisión</Pill>}
      actions={(
        <ReviewActions
          approveLabel="Publicar historia"
          onApprove={() => reviewStory(story.id, true, '')}
          onReject={(reason) => reviewStory(story.id, false, reason)}
          reasonTitle={`Rechazar historia ${story.codigoHistoria}`}
          reasonHint="Ej: amplía la historia e indica la experiencia del equipo."
        />
      )}
    >
      <p className="text-sm font-bold text-[#2F3A2F]">{story.codigoHistoria} · {story.nombreProducto}</p>
      <p className="rounded-2xl bg-[#F7F3E8] p-3.5 text-[13px] italic leading-relaxed text-[#2F3A2F]/80">“{story.historiaPropuesta}”</p>
    </ReviewShell>
  );
};

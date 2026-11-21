import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  BadgeCheck, BookOpen, Clock, FileText, Lock, Mail, MapPin, Phone, ShieldCheck, Store, UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SolicitudActualizacionPerfil } from '../../types';
import { useSeller } from './sellerContext';
import type { ChangeField } from './sellerContext';
import { Button, Card, Field, LinkButton, Modal, PageHeading, Pill, SectionTitle } from './ui';
import type { Tone } from './utils';
import { daysUntil, inputCls, money, prettyStamp } from './utils';

const FIELD_LABEL: Record<ChangeField, string> = {
  direccionNegocio: 'Dirección fiscal del negocio',
  telefono: 'Teléfono de contacto',
  identificacionFiscal: 'RUC / Cédula',
  email: 'Correo electrónico',
  nombreComercial: 'Nombre comercial',
};

const REQUEST_STATUS: Record<SolicitudActualizacionPerfil['estado'], { label: string; tone: Tone }> = {
  PENDIENTE: { label: 'Pendiente', tone: 'amber' },
  APROBADA: { label: 'Aprobada', tone: 'green' },
  RECHAZADA: { label: 'Rechazada', tone: 'red' },
};

export const SellerProfilePage = () => {
  const { profile, plan, subscription, products, settings, storeOpen, changeRequests, addChangeRequest } = useSeller();

  const [modalOpen, setModalOpen] = useState(false);
  const [campo, setCampo] = useState<ChangeField>('direccionNegocio');
  const [nuevoValor, setNuevoValor] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [error, setError] = useState('');

  const current: Record<ChangeField, string> = {
    direccionNegocio: profile.direccionNegocio,
    telefono: profile.telefono,
    identificacionFiscal: profile.identificacionFiscal,
    email: profile.email,
    nombreComercial: profile.nombreComercial ?? 'No registrado',
  };

  const rows: { label: string; value: string; icon: LucideIcon; mono?: boolean }[] = [
    { label: 'Correo de contacto', value: profile.email, icon: Mail },
    { label: 'Teléfono', value: profile.telefono, icon: Phone },
    { label: 'RUC / Cédula (facturación)', value: profile.identificacionFiscal, icon: FileText, mono: true },
    { label: 'Establecimiento – punto de emisión (SRI)', value: `${profile.establecimiento} – ${profile.puntoEmision}`, icon: ShieldCheck, mono: true },
    { label: 'Dirección fiscal del negocio', value: profile.direccionNegocio, icon: MapPin },
  ];

  const used = products.length;
  const usedPct = Math.min(100, Math.round((used / plan.limiteProductos) * 100));
  const renewIn = daysUntil(subscription.fechaFin);
  const hasPending = changeRequests.some((r) => r.campoAModificar === campo && r.estado === 'PENDIENTE');

  const openModal = () => {
    setCampo('direccionNegocio');
    setNuevoValor('');
    setJustificacion('');
    setError('');
    setModalOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!nuevoValor.trim() || !justificacion.trim()) { setError('Completa el nuevo valor y la justificación.'); return; }
    if (nuevoValor.trim() === current[campo]) { setError('El nuevo valor es igual al actual.'); return; }
    addChangeRequest(campo, nuevoValor, justificacion);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Mi perfil" subtitle="Tus datos comerciales, la información fiscal para facturar y tu plan." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              {profile.fotoUrl ? (
                <img src={profile.fotoUrl} alt={profile.nombreCompleto} className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-[#DCE8D2]" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#4F6F52] text-2xl font-bold text-[#F7F3E8]">
                  {profile.nombreCompleto.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-[#2F3A2F]">{profile.nombreCompleto}</p>
                <p className="flex items-center gap-1.5 truncate text-sm text-[#6B7A6B]"><Store className="h-4 w-4 shrink-0" /> {profile.nombreComercial ?? 'Sin nombre comercial'}</p>
                <Pill tone="green" icon={BadgeCheck} className="mt-1.5">Datos verificados</Pill>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F8EBC2]/70 p-3.5 text-xs leading-relaxed text-[#6B5410]">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Por seguridad y validez de la facturación electrónica (SRI), estos datos no se editan directamente. Si necesitas corregirlos, envía una solicitud al administrador.</p>
            </div>

            <dl className="mt-3 divide-y divide-[#2F3A2F]/10">
              {rows.map(({ label, value, icon: Icon, mono }) => (
                <div key={label} className="flex items-center gap-3 py-3.5">
                  <Icon className="h-5 w-5 shrink-0 text-[#86A789]" />
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">{label}</dt>
                    <dd className={`text-sm text-[#2F3A2F] ${mono ? 'font-mono' : ''}`}>{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <Button className="mt-3 w-full" onClick={openModal}>Solicitar cambio de información</Button>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle>Mis solicitudes de cambio</SectionTitle>
            {changeRequests.length ? (
              <ul className="divide-y divide-[#2F3A2F]/10">
                {changeRequests.map((r) => {
                  const st = REQUEST_STATUS[r.estado];
                  return (
                    <li key={r.id} className="py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#2F3A2F]">{FIELD_LABEL[r.campoAModificar]}</p>
                          <p className="mt-0.5 text-xs text-[#2F3A2F]/60">
                            <span className="line-through">{r.valorActual}</span> → <b className="text-[#2F3A2F]">{r.nuevoValor}</b>
                          </p>
                          <p className="mt-0.5 text-xs text-[#2F3A2F]/45">{prettyStamp(r.fechaCreacion)} · {r.justificacion}</p>
                        </div>
                        <Pill tone={st.tone}>{st.label}</Pill>
                      </div>
                      {r.respuestaAdmin && <p className="mt-2 rounded-2xl bg-[#F7F3E8] p-3 text-xs text-[#2F3A2F]/70"><b>Administrador:</b> {r.respuestaAdmin}</p>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[#2F3A2F]/55">Aún no has enviado solicitudes.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionTitle>Mi tienda</SectionTitle>
            <div className="space-y-3 text-sm">
              <p className="flex items-center justify-between gap-3">
                <span className="text-[#2F3A2F]/60">Estado</span>
                <Pill tone={storeOpen ? 'green' : 'red'}>{storeOpen ? 'Abierta' : 'Cerrada'}</Pill>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="text-[#2F3A2F]/60">Aprobación</span>
                <Pill tone="green" icon={BadgeCheck}>Aprobada</Pill>
              </p>
              <p className="flex items-start gap-2 text-[#2F3A2F]/70"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#86A789]" /> {settings.horarioAtencion}</p>
            </div>
            <LinkButton to="/vendedor/ajustes" className="mt-4 w-full">Cambiar horario y estado</LinkButton>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-[#2F3A2F] sm:text-lg">{plan.nombre}</h2>
              <Pill tone={subscription.estado === 'activa' ? 'green' : 'red'}>{subscription.estado === 'activa' ? 'Activo' : 'Vencido'}</Pill>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-[#4F6F52]">{money(plan.precioMensual)}<span className="text-xs font-medium text-[#2F3A2F]/45"> / mes</span></p>
            <p className="mt-3 flex justify-between text-sm text-[#2F3A2F]/70">
              <span>Publicaciones</span><span className="font-bold text-[#2F3A2F]">{used} de {plan.limiteProductos}</span>
            </p>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#2F3A2F]/10">
              <div className={`h-full rounded-full ${usedPct >= 90 ? 'bg-[#B4533C]' : 'bg-[#4F6F52]'}`} style={{ width: `${usedPct}%` }} />
            </div>
            <ul className="mt-3 space-y-1 text-xs text-[#2F3A2F]/60">
              <li>Comisión del {plan.comisionPorcentaje}% por venta.</li>
              <li>Vigente hasta el {subscription.fechaFin} ({renewIn} día{renewIn === 1 ? '' : 's'}).</li>
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCE8D2] text-[#4F6F52]"><BookOpen className="h-5 w-5" /></span>
            <h2 className="mt-3 text-base font-extrabold text-[#2F3A2F]">Historias de productos</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#2F3A2F]/60">
              Destaca el origen y el proceso de tus productos. El administrador las revisa y las publica en la portada.
            </p>
            <LinkButton to="/vendedor/historias" variant="primary" className="mt-4 w-full"><UserRound className="h-4 w-4" /> Ir a mis historias</LinkButton>
          </Card>
        </div>
      </div>

      {modalOpen && (
        <Modal
          onClose={() => setModalOpen(false)}
          title="Solicitar cambio de datos"
          subtitle="El administrador revisará y autorizará el cambio."
          footer={(
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" form="change-form" disabled={hasPending}>Enviar solicitud</Button>
            </>
          )}
        >
          <form id="change-form" noValidate onSubmit={submit} className="space-y-4 pb-3">
            <Field label="Dato a modificar">
              <select value={campo} onChange={(e) => { setCampo(e.target.value as ChangeField); setError(''); }} className={inputCls}>
                {(Object.keys(FIELD_LABEL) as ChangeField[]).map((k) => <option key={k} value={k}>{FIELD_LABEL[k]}</option>)}
              </select>
            </Field>
            <Field label="Valor actual">
              <input value={current[campo]} readOnly className={`${inputCls} cursor-not-allowed text-[#2F3A2F]/55`} />
            </Field>
            <Field label="Nuevo valor">
              <input value={nuevoValor} onChange={(e) => { setNuevoValor(e.target.value); setError(''); }} placeholder="Escribe el dato correcto" className={inputCls} />
            </Field>
            <Field label="Justificación" error={error || undefined}>
              <textarea rows={3} value={justificacion} onChange={(e) => { setJustificacion(e.target.value); setError(''); }} placeholder="Ej: cambio de domicilio fiscal o renovación de número telefónico…" className={`${inputCls} resize-none`} />
            </Field>
            {hasPending && <p className="rounded-2xl bg-[#F8EBC2]/70 p-3 text-xs text-[#6B5410]">Ya tienes una solicitud pendiente para este dato. Espera la respuesta del administrador.</p>}
          </form>
        </Modal>
      )}
    </div>
  );
};

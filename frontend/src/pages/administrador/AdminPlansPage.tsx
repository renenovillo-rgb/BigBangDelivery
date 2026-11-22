import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarClock, CreditCard, Pencil } from 'lucide-react';
import type { PlanSuscripcion } from '../../types';
import { usePlatform } from '../../platform/platformContext';
import { Button, Card, Field, Modal, PageHeading, Pill, SectionTitle, Switch } from '../../components/ui';
import { daysUntil, inputCls, money } from '../../components/utils';
import { VENDOR_STATUS } from './labels';
import { VendorLink } from './parts';

export const AdminPlansPage = () => {
  const { plans, vendors, savePlan, setVendorPlan } = usePlatform();

  const [editing, setEditing] = useState<PlanSuscripcion | null>(null);
  const [form, setForm] = useState({ nombre: '', precio: '', limite: '', comision: '' });
  const [error, setError] = useState('');

  const open = (p: PlanSuscripcion) => {
    setEditing(p);
    setForm({ nombre: p.nombre, precio: String(p.precioMensual), limite: String(p.limiteProductos), comision: String(p.comisionPorcentaje) });
    setError('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(form.precio);
    const limite = parseInt(form.limite, 10);
    const comision = parseFloat(form.comision);
    if (!editing) return;
    if (form.nombre.trim().length < 3 || !(precio >= 0) || !(limite >= 1) || !(comision >= 0 && comision <= 100)) {
      setError('Revisa los valores: nombre, precio ≥ 0, límite ≥ 1 y comisión entre 0 y 100.');
      return;
    }
    savePlan({ ...editing, nombre: form.nombre.trim(), precioMensual: precio, limiteProductos: limite, comisionPorcentaje: comision });
    setEditing(null);
  };

  const subscribers = [...vendors].sort((a, b) => daysUntil(a.suscripcionFin) - daysUntil(b.suscripcionFin));

  return (
    <div className="space-y-6">
      <PageHeading title="Planes y suscripciones" subtitle="Define cuánto cuesta vender, cuántas publicaciones permite cada plan y qué comisión cobra la plataforma." />

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {plans.map((p) => {
          const n = vendors.filter((v) => v.planId === p.id).length;
          return (
            <Card key={p.id} className={`flex flex-col p-5 sm:p-6 ${p.activo ? '' : 'opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold text-[#2F3A2F]">{p.nombre}</p>
                  <p className="text-xs text-[#2F3A2F]/55">{n} vendedor{n === 1 ? '' : 'es'}</p>
                </div>
                <Switch checked={p.activo} onChange={(v) => savePlan({ ...p, activo: v })} label={`${p.activo ? 'Desactivar' : 'Activar'} ${p.nombre}`} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-[#4F6F52]">{money(p.precioMensual)}<span className="text-sm font-medium text-[#2F3A2F]/45"> / mes</span></p>
              <ul className="mt-3 space-y-1.5 text-sm text-[#2F3A2F]/70">
                <li>Hasta <b className="text-[#2F3A2F]">{p.limiteProductos}</b> publicaciones</li>
                <li>Comisión del <b className="text-[#2F3A2F]">{p.comisionPorcentaje}%</b> por venta</li>
                <li>Vigencia de {p.duracionDias} días</li>
              </ul>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => open(p)}><Pencil className="h-4 w-4" /> Editar plan</Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle>Suscripciones de vendedores</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[#6B7A6B]">
              <tr><th className="pb-3 pr-3">Vendedor</th><th className="pb-3 pr-3">Estado</th><th className="pb-3 pr-3">Plan</th><th className="pb-3 text-right">Vence</th></tr>
            </thead>
            <tbody className="divide-y divide-[#2F3A2F]/10">
              {subscribers.map((v) => {
                const d = daysUntil(v.suscripcionFin);
                const st = VENDOR_STATUS[v.estado];
                return (
                  <tr key={v.id}>
                    <td className="py-3 pr-3"><VendorLink id={v.id} name={v.nombreComercial} /></td>
                    <td className="py-3 pr-3"><Pill tone={st.tone}>{st.label}</Pill></td>
                    <td className="py-3 pr-3">
                      <select
                        value={v.planId}
                        onChange={(e) => setVendorPlan(v.id, e.target.value)}
                        aria-label={`Plan de ${v.nombreComercial}`}
                        className="rounded-xl bg-[#F7F3E8] px-3 py-1.5 text-[13px] font-semibold text-[#2F3A2F] outline-none focus:ring-2 focus:ring-[#4F6F52]"
                      >
                        {plans.map((p) => <option key={p.id} value={p.id} disabled={!p.activo && p.id !== v.planId}>{p.nombre}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <Pill tone={d < 0 ? 'red' : d <= 7 ? 'amber' : 'green'} icon={CalendarClock}>{d < 0 ? `Venció hace ${-d} d` : d === 0 ? 'Hoy' : `${d} días`}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal
          onClose={() => setEditing(null)}
          title={`Editar ${editing.nombre}`}
          subtitle="Los cambios aplican de inmediato a los vendedores de este plan."
          footer={(
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="submit" form="plan-form"><CreditCard className="h-4 w-4" /> Guardar plan</Button>
            </>
          )}
        >
          <form id="plan-form" noValidate onSubmit={submit} className="space-y-4 pb-3">
            <Field label="Nombre"><input value={form.nombre} onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setError(''); }} className={inputCls} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Precio mensual ($)"><input type="number" inputMode="decimal" step="0.01" min="0" value={form.precio} onChange={(e) => { setForm({ ...form, precio: e.target.value }); setError(''); }} className={inputCls} /></Field>
              <Field label="Límite de publicaciones"><input type="number" inputMode="numeric" min="1" value={form.limite} onChange={(e) => { setForm({ ...form, limite: e.target.value }); setError(''); }} className={inputCls} /></Field>
              <Field label="Comisión (%)"><input type="number" inputMode="decimal" step="0.5" min="0" max="100" value={form.comision} onChange={(e) => { setForm({ ...form, comision: e.target.value }); setError(''); }} className={inputCls} /></Field>
            </div>
            {error && <p className="px-1 text-xs font-medium text-[#B4533C]">{error}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
};

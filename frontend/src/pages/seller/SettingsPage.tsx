import { Clock } from 'lucide-react';
import { useSeller } from './sellerContext';
import type { SellerSettings } from './sellerData';
import { Card, Field, PageHeading, Switch } from './ui';
import { inputCls } from './utils';

type ToggleKey = 'nuevosPedidos' | 'stockBajo' | 'historias' | 'resumenSemanal';

const NOTIFICATIONS: { key: ToggleKey; label: string; sub: string }[] = [
  { key: 'nuevosPedidos', label: 'Nuevos pedidos', sub: 'Aviso apenas un comprador te envíe un pedido.' },
  { key: 'stockBajo', label: 'Stock bajo y productos por vencer', sub: 'Te avisamos antes de quedarte sin inventario.' },
  { key: 'historias', label: 'Respuestas del administrador', sub: 'Aprobación o rechazo de productos, historias y cambios de datos.' },
  { key: 'resumenSemanal', label: 'Resumen semanal por correo', sub: 'Tus ventas, comisión y productos más vendidos cada lunes.' },
];

export const SellerSettingsPage = () => {
  const { settings, updateSettings, storeOpen, setStoreOpen } = useSeller();

  const patch = (p: Partial<SellerSettings>) => updateSettings(p);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeading title="Ajustes" subtitle="Controla tu tienda y qué avisos quieres recibir." />

      <Card className="px-5 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#2F3A2F]">Tienda abierta</p>
            <p className="text-xs text-[#2F3A2F]/55">Si la cierras, los compradores no podrán enviarte pedidos nuevos.</p>
          </div>
          <Switch checked={storeOpen} onChange={setStoreOpen} label="Tienda abierta" />
        </div>
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-extrabold text-[#2F3A2F] sm:text-lg">Operación</h2>
        <Field label="Horario de atención" icon={Clock} hint="Es el horario que ven los compradores en tu tienda.">
          <input value={settings.horarioAtencion} onChange={(e) => patch({ horarioAtencion: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Avisar cuando queden (unidades o menos)" hint="Se usa para marcar “stock bajo” en tu catálogo y en el resumen.">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="999"
            value={settings.stockMinimo}
            onChange={(e) => patch({ stockMinimo: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            className={inputCls}
          />
        </Field>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-extrabold text-[#2F3A2F] sm:text-lg">Notificaciones</h2>
        <div className="divide-y divide-[#2F3A2F]/10 rounded-3xl bg-white px-5 ring-1 ring-black/5 sm:px-6">
          {NOTIFICATIONS.map((o) => (
            <div key={o.key} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#2F3A2F]">{o.label}</p>
                <p className="text-xs text-[#2F3A2F]/55">{o.sub}</p>
              </div>
              <Switch checked={settings[o.key]} onChange={(v) => patch({ [o.key]: v })} label={o.label} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

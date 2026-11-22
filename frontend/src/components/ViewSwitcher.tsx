import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Shield, ShoppingBasket, Store, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Botón flotante para recorrer las vistas sin pasar por el flujo      */
/*  normal. Se usa en comprador, vendedor y administrador.              */
/* ------------------------------------------------------------------ */

export interface SwitcherItem { id: string; label: string; icon: LucideIcon }

const ROLES: { id: string; label: string; to: string; icon: LucideIcon }[] = [
  { id: 'comprador', label: 'Comprador', to: '/comprador', icon: ShoppingBasket },
  { id: 'vendedor', label: 'Vendedor', to: '/vendedor', icon: Store },
  { id: 'administrador', label: 'Administrador', to: '/administrador', icon: Shield },
];

export const ViewSwitcher = ({ title, items, activeId, onSelect, role }: {
  title: string;
  items: SwitcherItem[];
  activeId: string;
  onSelect: (id: string) => void;
  role: 'comprador' | 'vendedor' | 'administrador';
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="max-h-[75vh] w-64 overflow-y-auto rounded-3xl bg-white/95 p-2 shadow-2xl ring-1 ring-black/10 backdrop-blur">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7A6B]">{title}</p>
          {items.map((s, i) => {
            const Icon = s.icon;
            const active = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { onSelect(s.id); setOpen(false); }}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'text-[#2F3A2F] hover:bg-[#DCE8D2]/60'}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${active ? 'bg-white/20' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{i + 1}. {s.label}</span>
              </button>
            );
          })}

          <p className="mt-2 border-t border-[#2F3A2F]/10 px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7A6B]">Ver como</p>
          <div className="grid grid-cols-3 gap-1.5 px-1 pb-1">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const current = r.id === role;
              return (
                <Link
                  key={r.id}
                  to={r.to}
                  onClick={() => setOpen(false)}
                  aria-current={current ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition ${current ? 'bg-[#2F3A2F] text-[#F7F3E8]' : 'bg-[#F7F3E8] text-[#2F3A2F] hover:bg-[#DCE8D2]/60'}`}
                >
                  <Icon className="h-4 w-4" />
                  {r.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Cambiar de pantalla"
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F3A2F] text-[#F7F3E8] shadow-xl shadow-black/30 transition active:scale-90 hover:bg-[#1F2820]"
      >
        {open ? <X className="h-6 w-6" /> : <LayoutGrid className="h-6 w-6" />}
      </button>
    </div>
  );
};

import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Package, Wrench, Leaf, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TipoItem } from '../types';
import logoHorizonte from '../pages/buyer/assets/logoHorizonte.jpg';
import { TONES } from './utils';
import type { Tone } from './utils';

/* ------------------------------------------------------------------ */
/*  Piezas base del panel del vendedor                                  */
/*  Paleta: crema #F7F3E8 · verde musgo #4F6F52 · salvia #86A789        */
/*  verde pálido #DCE8D2 · gris carbón #2F3A2F  (igual que el comprador) */
/* ------------------------------------------------------------------ */

export const Container = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

/* Logo horizontal compacto (cabeceras y menú) */
export const BrandInline = ({ onDark = false, subtitle = 'Panel del vendedor' }: { onDark?: boolean; subtitle?: string }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F3E8] p-0.5">
      <img src={logoHorizonte} alt="Horizonte Sostenible" className="h-full w-full object-contain mix-blend-multiply" />
    </span>
    <span className="leading-none">
      <span className={`block text-xl font-black lowercase tracking-tight ${onDark ? 'text-[#F7F3E8]' : 'text-[#2F3A2F]'}`}>
        big<span className={onDark ? 'text-[#DCE8D2]' : 'text-[#4F6F52]'}>ban</span>
      </span>
      <span className={`hidden text-[9px] font-medium uppercase tracking-[0.2em] sm:block ${onDark ? 'text-[#DCE8D2]' : 'text-[#6B7A6B]'}`}>
        {subtitle}
      </span>
    </span>
  </div>
);

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-3xl bg-white ring-1 ring-black/5 ${className}`}>{children}</div>
);

export const PageHeading = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[#2F3A2F]/55">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SectionTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h2 className="text-base font-extrabold text-[#2F3A2F] sm:text-lg">{children}</h2>
    {action}
  </div>
);

/* ------------------------------- Botones ------------------------------- */

const BUTTON_VARIANTS = {
  primary: 'bg-[#4F6F52] text-[#F7F3E8] shadow-md shadow-[#4F6F52]/20 hover:bg-[#435E46]',
  secondary: 'bg-white text-[#2F3A2F] ring-1 ring-[#2F3A2F]/15 hover:bg-[#DCE8D2]/50',
  danger: 'bg-[#F2D9D0] text-[#9A3F2A] hover:bg-[#EBC6B9]',
  ghost: 'text-[#4F6F52] hover:bg-[#DCE8D2]/60',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: 'sm' | 'md';
};

const buttonCls = (variant: keyof typeof BUTTON_VARIANTS, size: 'sm' | 'md', className: string) =>
  `inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
    size === 'sm' ? 'px-3.5 py-2 text-[13px]' : 'px-5 py-3 text-sm'
  } ${BUTTON_VARIANTS[variant]} ${className}`;

export const Button = ({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={buttonCls(variant, size, className)} {...props} />
);

export const LinkButton = ({ to, variant = 'secondary', size = 'sm', className = '', children }: {
  to: string; variant?: keyof typeof BUTTON_VARIANTS; size?: 'sm' | 'md'; className?: string; children: ReactNode;
}) => (
  <Link to={to} className={buttonCls(variant, size, className)}>{children}</Link>
);

/* ------------------------------ Formularios ------------------------------ */

export const Field = ({ label, icon: Icon, hint, error, children, className = '' }: {
  label: string; icon?: LucideIcon; hint?: string; error?: string; children: ReactNode; className?: string;
}) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">{label}</span>
    <div className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 transition focus-within:ring-2 ${error ? 'ring-[#B4533C] focus-within:ring-[#B4533C]' : 'ring-[#2F3A2F]/10 focus-within:ring-[#4F6F52]'}`}>
      {Icon && <Icon className="h-5 w-5 shrink-0 text-[#86A789]" />}
      {children}
    </div>
    {error ? <span className="mt-1.5 block px-1 text-xs font-medium text-[#B4533C]">{error}</span>
      : hint ? <span className="mt-1.5 block px-1 text-xs text-[#2F3A2F]/45">{hint}</span> : null}
  </label>
);

export const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-[#4F6F52]' : 'bg-[#2F3A2F]/20'}`}
  >
    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.375rem]' : 'left-0.5'}`} />
  </button>
);

/* --------------------------- Etiquetas y filtros --------------------------- */

export const Pill = ({ tone, children, icon: Icon, className = '' }: {
  tone: Tone; children: ReactNode; icon?: LucideIcon; className?: string;
}) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${TONES[tone]} ${className}`}>
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
);

export const Chip = ({ active, onClick, children, count }: {
  active: boolean; onClick: () => void; children: ReactNode; count?: number;
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-[#2F3A2F] text-[#F7F3E8]' : 'bg-white text-[#2F3A2F]/70 ring-1 ring-black/5 hover:bg-[#DCE8D2]/50'}`}
  >
    {children}
    {count !== undefined && (
      <span className={`rounded-full px-1.5 text-[11px] font-bold ${active ? 'bg-white/20' : 'bg-[#2F3A2F]/10'}`}>{count}</span>
    )}
  </button>
);

export const StatCard = ({ icon: Icon, label, value, hint, accent = false }: {
  icon: LucideIcon; label: string; value: string | number; hint?: string; accent?: boolean;
}) => (
  <div className={`rounded-3xl p-4 sm:p-5 ${accent ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-white ring-1 ring-black/5'}`}>
    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent ? 'bg-white/20' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}>
      <Icon className="h-5 w-5" />
    </span>
    <p className={`mt-3 text-xs font-semibold uppercase tracking-wide ${accent ? 'text-[#DCE8D2]' : 'text-[#6B7A6B]'}`}>{label}</p>
    <p className={`mt-0.5 text-2xl font-extrabold sm:text-3xl ${accent ? '' : 'text-[#2F3A2F]'}`}>{value}</p>
    {hint && <p className={`mt-1 text-xs ${accent ? 'text-[#DCE8D2]' : 'text-[#2F3A2F]/55'}`}>{hint}</p>}
  </div>
);

export const EmptyState = ({ icon: Icon = Leaf, title, text, action }: {
  icon?: LucideIcon; title: string; text?: string; action?: ReactNode;
}) => (
  <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-black/5 sm:p-12">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8D2] text-[#4F6F52]">
      <Icon className="h-7 w-7" />
    </span>
    <p className="mt-4 text-base font-extrabold text-[#2F3A2F]">{title}</p>
    {text && <p className="mt-1 max-w-sm text-sm text-[#2F3A2F]/55">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* --------------------------------- Modal --------------------------------- */

export const Modal = ({ title, subtitle, onClose, children, footer, wide = false }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2F3A2F]/55 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-[#F7F3E8] shadow-2xl sm:rounded-[2rem] ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
      >
        <div className="flex items-start gap-4 px-5 pb-2 pt-5 sm:px-8 sm:pt-7">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold leading-snug text-[#2F3A2F] sm:text-xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[#2F3A2F]/60">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2F3A2F] ring-1 ring-black/5 transition active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 sm:px-8">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-[#2F3A2F]/10 px-5 py-4 sm:px-8">{footer}</div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ title, text, confirmLabel, onConfirm, onClose }: {
  title: string; text: string; confirmLabel: string; onConfirm: () => void; onClose: () => void;
}) => (
  <Modal
    title={title}
    onClose={onClose}
    footer={(
      <>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>
    )}
  >
    <p className="pb-2 text-sm leading-relaxed text-[#2F3A2F]/70">{text}</p>
  </Modal>
);

/* ------------------------- Imagen de producto con respaldo ------------------------- */

const THUMB_TONE: Record<TipoItem, string> = {
  PERECIBLE: 'from-[#F8EBC2] to-[#F1D98F] text-[#B7792B]',
  NO_PERECIBLE: 'from-[#DCE8D2] to-[#C4D9B8] text-[#4F6F52]',
  SERVICIO: 'from-[#DCE8F2] to-[#BFD4E8] text-[#3A6490]',
};

export const ProductThumb = ({ src, name, tipo, className = '' }: {
  src?: string; name: string; tipo: TipoItem; className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  const Icon = tipo === 'SERVICIO' ? Wrench : Package;

  if (src && !failed) {
    return <img src={src} alt={name} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${THUMB_TONE[tipo]} ${className}`} role="img" aria-label={name}>
      <Icon className="h-1/3 w-1/3" strokeWidth={1.4} />
    </div>
  );
};

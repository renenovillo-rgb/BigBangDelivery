import React, { useEffect, useMemo, useState } from 'react';
import type { ButtonHTMLAttributes, ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react';
import {
  Leaf, MapPin, Search, ChevronDown, Plus, Minus, ShoppingBasket, CreditCard, Landmark,
  Banknote, CheckCircle2, BadgeCheck, ArrowLeft, ArrowRight, Sprout, Truck, Tag, X,
  LayoutGrid, Home, UserRound, Receipt, Droplets, Heart, Star,
  Salad, Lock, Phone, FileText, Recycle, Sparkles, ShieldCheck, Clock, Loader2,
  Package, Store, Menu, Wrench, Settings, LogOut, ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import logoHorizonte from './assets/logoHorizonte.jpg';
import {
  MOCK_ORDERS, PRODUCT_CATEGORIES, PRODUCTS, SERVICE_CATEGORIES, SERVICES,
} from './catalog';
import type { Category, Order, OrderStatus, Product, Service } from './catalog';

/* ------------------------------------------------------------------ */
/*  Paleta: crema #F7F3E8 · verde musgo #4F6F52 · salvia #86A789        */
/*  verde pálido #DCE8D2 · gris carbón #2F3A2F                          */
/*  Diseño responsivo: mobile-first, breakpoints sm / md / lg / xl      */
/* ------------------------------------------------------------------ */

type ScreenId = 'welcome' | 'login' | 'home' | 'detail' | 'cart' | 'payment';
type Go = (id: ScreenId) => void;
type Setter<T> = Dispatch<SetStateAction<T>>;

interface BillingForm { cedula: string; nombre: string; telefono: string; direccion: string }
interface Billing extends BillingForm { docType: string }
interface Selection { qty: number; optionIdx: number; notes: string }
interface Totals { subtotal: number; discount: number; delivery: number; iva: number; total: number }

const SCREENS: { id: ScreenId; label: string; icon: LucideIcon }[] = [
  { id: 'welcome', label: 'Recepción', icon: Sprout },
  { id: 'login', label: 'Login y facturación', icon: UserRound },
  { id: 'home', label: 'Catálogo', icon: Home },
  { id: 'detail', label: 'Detalle de producto', icon: Salad },
  { id: 'cart', label: 'Carrito', icon: ShoppingBasket },
  { id: 'payment', label: 'Pago y recibo', icon: CreditCard },
];

const money = (n: number) => `$${n.toFixed(2)}`;
const DELIVERY_FEE = 2.5;
const FREE_DELIVERY_FROM = 20;
const IVA = 0.15;

/* ------------------------------ Piezas base ------------------------------ */

const Container = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

/* Logo vertical (recepción). mix-blend-multiply funde el fondo blanco del JPG con el crema */
const Logo = ({ className = 'h-32 w-32 sm:h-44 sm:w-44 lg:h-72 lg:w-72', wordmark = 'text-4xl sm:text-5xl lg:text-6xl' }: { className?: string; wordmark?: string }) => (
  <div className="flex flex-col items-center">
    <img src={logoHorizonte} alt="Logo Horizonte Sostenible" className={`${className} object-contain mix-blend-multiply`} />
    <div className="-mt-1 text-center leading-none">
      <span className={`${wordmark} font-black lowercase tracking-tight text-[#2F3A2F]`}>
        big<span className="text-[#4F6F52]">ban</span>
      </span>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-[#6B7A6B] sm:text-sm">by Horizonte Sostenible</p>
    </div>
  </div>
);

/* Logo horizontal compacto (cabeceras) */
const BrandInline = ({ onDark = false }: { onDark?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F3E8] p-0.5">
      <img src={logoHorizonte} alt="Horizonte Sostenible" className="h-full w-full object-contain mix-blend-multiply" />
    </span>
    <span className="leading-none">
      <span className={`block text-xl font-black lowercase tracking-tight ${onDark ? 'text-[#F7F3E8]' : 'text-[#2F3A2F]'}`}>
        big<span className={onDark ? 'text-[#DCE8D2]' : 'text-[#4F6F52]'}>ban</span>
      </span>
      <span className={`hidden text-[9px] font-medium uppercase tracking-[0.2em] sm:block ${onDark ? 'text-[#DCE8D2]' : 'text-[#6B7A6B]'}`}>
        by Horizonte Sostenible
      </span>
    </span>
  </div>
);

const PrimaryButton = ({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F6F52] px-5 py-4 text-base font-semibold text-[#F7F3E8] shadow-lg shadow-[#4F6F52]/25 transition active:scale-[0.98] hover:bg-[#435E46] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

/* Cabecera sticky de las pantallas internas */
const PageHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <header className="sticky top-0 z-20 border-b border-[#2F3A2F]/5 bg-[#F7F3E8]/90 backdrop-blur">
    <Container className="flex h-16 items-center justify-between gap-3">
      <button
        onClick={onBack}
        aria-label="Volver"
        className="flex h-10 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-[#2F3A2F] shadow-sm ring-1 ring-black/5 transition active:scale-95 sm:pr-4"
      >
        <ArrowLeft className="h-5 w-5" /> <span className="hidden sm:inline">Volver</span>
      </button>
      <h2 className="truncate text-base font-bold text-[#2F3A2F] sm:text-lg">{title}</h2>
      <div className="hidden md:block"><BrandInline /></div>
      <div className="h-10 w-10 md:hidden" />
    </Container>
  </header>
);

const Field = ({ label, icon: Icon, children }: { label: string; icon?: LucideIcon; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">{label}</span>
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-[#2F3A2F]/10 transition focus-within:ring-2 focus-within:ring-[#4F6F52]">
      {Icon && <Icon className="h-5 w-5 shrink-0 text-[#86A789]" />}
      {children}
    </div>
  </label>
);

const inputCls = 'w-full min-w-0 bg-transparent text-[15px] text-[#2F3A2F] outline-none placeholder:text-[#2F3A2F]/35';

const Badge = ({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F6F52] px-3 py-1.5 text-[11px] font-semibold text-[#F7F3E8] shadow sm:text-xs">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
);

const SummaryRow = ({ label, value, strong, green }: { label: string; value: string; strong?: boolean; green?: boolean }) => (
  <div className={`flex items-center justify-between gap-3 ${strong ? 'text-base font-extrabold text-[#2F3A2F]' : 'text-sm text-[#2F3A2F]/70'}`}>
    <span>{label}</span>
    <span className={green ? 'font-semibold text-[#4F6F52]' : ''}>{value}</span>
  </div>
);

/* Ilustración vectorial de una lechuga (sin imágenes externas) */
const LettuceIllustration = () => (
  <svg viewBox="0 0 240 240" className="h-full w-full" role="img" aria-label="Lechuga fresca">
    <defs>
      <radialGradient id="lg1" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#CFE3B4" />
        <stop offset="100%" stopColor="#7FA56F" />
      </radialGradient>
      <radialGradient id="lg2" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#E3EFC9" />
        <stop offset="100%" stopColor="#9DBF86" />
      </radialGradient>
    </defs>
    <ellipse cx="120" cy="214" rx="68" ry="9" fill="#2F3A2F" opacity="0.12" />
    <g>
      <ellipse cx="68" cy="132" rx="40" ry="62" fill="#6F9561" transform="rotate(-28 68 132)" />
      <ellipse cx="172" cy="132" rx="40" ry="62" fill="#6F9561" transform="rotate(28 172 132)" />
      <ellipse cx="90" cy="118" rx="44" ry="76" fill="url(#lg1)" transform="rotate(-14 90 118)" />
      <ellipse cx="150" cy="118" rx="44" ry="76" fill="url(#lg1)" transform="rotate(14 150 118)" />
      <ellipse cx="120" cy="110" rx="46" ry="82" fill="url(#lg2)" />
      <ellipse cx="120" cy="96" rx="26" ry="50" fill="#EAF3D2" opacity="0.85" />
      <path d="M120 40 V180 M120 90 L96 66 M120 112 L148 82 M120 140 L94 116" stroke="#7FA56F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
    </g>
    <path d="M104 196 Q120 214 136 196 L132 208 Q120 218 108 208Z" fill="#B58B5C" />
  </svg>
);

/* ------------------------------ 1. Recepción ------------------------------ */

const WelcomeScreen = ({ go }: { go: Go }) => (
  <div className="relative flex min-h-screen items-center overflow-hidden bg-[#F7F3E8]">
    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#DCE8D2] lg:-right-40 lg:-top-40 lg:h-[34rem] lg:w-[34rem]" />
    <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#DCE8D2]/70 lg:h-[28rem] lg:w-[28rem]" />
    <Leaf className="pointer-events-none absolute right-8 top-40 hidden h-10 w-10 rotate-45 text-[#86A789]/50 sm:block" />
    <Leaf className="pointer-events-none absolute bottom-52 left-8 hidden h-8 w-8 -rotate-12 text-[#86A789]/50 sm:block" />

    <Container className="relative z-10 grid items-center gap-8 py-12 text-center lg:grid-cols-2 lg:gap-16 lg:text-left">
      <div className="lg:order-2">
        <Logo />
      </div>

      <div className="lg:order-1">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#4F6F52] shadow-sm ring-1 ring-[#4F6F52]/15 lg:mx-0">
          <Sparkles className="h-3.5 w-3.5" /> Del invernadero a tu mesa
        </div>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#2F3A2F] sm:text-5xl lg:text-6xl">
          Productos frescos,
          <br />
          <span className="text-[#4F6F52]">cultivados con propósito</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#2F3A2F]/65 sm:text-lg lg:mx-0">
          Hortalizas hidropónicas y orgánicas de producción propia, cosechadas hoy y entregadas en la puerta de tu casa.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-[#4F6F52] lg:justify-start">
          <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" /> Hidropónico</span>
          <span className="flex items-center gap-1.5"><Recycle className="h-4 w-4" /> Sostenible</span>
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Delivery</span>
        </div>
        <div className="mx-auto mt-8 w-full max-w-sm lg:mx-0">
          <PrimaryButton onClick={() => go('login')}>
            Comenzar pedido <ArrowRight className="h-5 w-5" />
          </PrimaryButton>
          <p className="mt-4 text-xs text-[#2F3A2F]/45">Agricultura sostenible · Ecuador</p>
        </div>
      </div>
    </Container>
  </div>
);

/* ------------------------- 2. Login y facturación ------------------------- */

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const LoginScreen = ({ go, form, setForm }: { go: Go; form: BillingForm; setForm: Setter<BillingForm> }) => {
  const [step, setStep] = useState(1);
  const digits = form.cedula.replace(/\D/g, '');
  const docType = digits.length === 13 ? 'RUC' : digits.length === 10 ? 'Cédula' : null;
  const verified = Boolean(docType);
  const canFinish = form.nombre.trim() && form.telefono.trim() && form.direccion.trim();

  const set = (k: keyof BillingForm) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#F7F3E8] lg:grid lg:grid-cols-2">
      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#4F6F52] p-12 text-[#F7F3E8] lg:flex">
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#F7F3E8]/10" />
        <Leaf className="pointer-events-none absolute right-10 top-24 h-24 w-24 rotate-12 text-[#F7F3E8]/10" />
        <BrandInline onDark />
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">Tu pedido,<br />directo de la huerta.</h2>
          <p className="mt-4 max-w-sm text-[#DCE8D2]">
            Con tus datos de facturación listos, recibes tu factura electrónica y tu entrega sin complicaciones.
          </p>
          <ul className="mt-8 space-y-3 text-sm font-medium">
            {([[Droplets, 'Cultivo hidropónico y orgánico'], [Truck, 'Delivery el mismo día'], [ShieldCheck, 'Datos protegidos']] as [LucideIcon, string][]).map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F3E8]/15"><Icon className="h-5 w-5" /></span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-[#DCE8D2]/70">© Horizonte Sostenible</p>
      </aside>

      <div className="flex flex-col">
        <PageHeader title="Tus datos" onBack={() => (step === 2 ? setStep(1) : go('welcome'))} />

        <main className="flex flex-1 items-start justify-center px-4 pb-24 pt-6 sm:px-6 lg:items-center lg:pt-0">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              {[1, 2].map((n) => (
                <React.Fragment key={n}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= n ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-white text-[#2F3A2F]/40 ring-1 ring-black/10'}`}>
                    {step > n ? <CheckCircle2 className="h-5 w-5" /> : n}
                  </div>
                  {n === 1 && <div className={`h-1 flex-1 rounded-full ${step > 1 ? 'bg-[#4F6F52]' : 'bg-[#2F3A2F]/10'}`} />}
                </React.Fragment>
              ))}
              <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">Paso {step} de 2</span>
            </div>

            {step === 1 && (
              <div>
                <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Identifícate para facturar</h1>
                <p className="mb-6 mt-1.5 text-sm text-[#2F3A2F]/60">
                  Ingresa tu cédula (10 dígitos) o RUC (13 dígitos) para generar tu factura electrónica.
                </p>

                <Field label="Cédula / RUC" icon={FileText}>
                  <input
                    inputMode="numeric"
                    maxLength={13}
                    value={form.cedula}
                    onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value.replace(/\D/g, '') }))}
                    placeholder="1712345678"
                    className={inputCls}
                  />
                  {verified && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#DCE8D2] px-2.5 py-1 text-[11px] font-bold text-[#3E5C41]">
                      <BadgeCheck className="h-4 w-4" /> {docType} válido
                    </span>
                  )}
                </Field>
                <p className={`mt-2 px-1 text-xs ${verified ? 'text-[#4F6F52]' : 'text-[#2F3A2F]/45'}`}>
                  {verified ? 'Identificación verificada correctamente.' : `${digits.length}/10 dígitos para cédula · 13 para RUC`}
                </p>

                <PrimaryButton className="mt-8" disabled={!verified} onClick={() => setStep(2)}>
                  Continuar <ArrowRight className="h-5 w-5" />
                </PrimaryButton>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Datos de facturación</h1>
                <p className="mb-6 mt-1.5 text-sm text-[#2F3A2F]/60">Los usaremos para tu factura y la entrega de tu pedido.</p>

                <div className="space-y-4">
                  <Field label="Nombre completo" icon={UserRound}>
                    <input value={form.nombre} onChange={set('nombre')} placeholder="María Fernanda Torres" className={inputCls} />
                  </Field>
                  <Field label="Teléfono" icon={Phone}>
                    <input inputMode="tel" value={form.telefono} onChange={set('telefono')} placeholder="099 123 4567" className={inputCls} />
                  </Field>
                  <Field label="Dirección de entrega" icon={MapPin}>
                    <input value={form.direccion} onChange={set('direccion')} placeholder="Av. Siempre Viva 742, Quito" className={inputCls} />
                  </Field>
                </div>

                <PrimaryButton className="mt-7" disabled={!canFinish} onClick={() => go('home')}>
                  Guardar y continuar <ArrowRight className="h-5 w-5" />
                </PrimaryButton>

                <div className="my-5 flex items-center gap-3 text-xs text-[#2F3A2F]/40">
                  <div className="h-px flex-1 bg-[#2F3A2F]/10" /> o <div className="h-px flex-1 bg-[#2F3A2F]/10" />
                </div>

                <button
                  onClick={() => go('home')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-[15px] font-semibold text-[#2F3A2F] ring-1 ring-[#2F3A2F]/15 transition active:scale-[0.98] hover:bg-white/70"
                >
                  <GoogleG /> Vincular y continuar con Google
                </button>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#2F3A2F]/45">
                  <Lock className="h-3.5 w-3.5" /> Tus datos están protegidos
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/* ------------------------------ 3. Home ------------------------------ */

const ProductCard = ({ p, onOpen }: { p: Product; onOpen: (id: string) => void }) => {
  const Icon = p.icon;
  return (
    <button
      onClick={() => onOpen(p.id)}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br sm:h-40 ${p.tone}`}>
        <Icon className={`h-14 w-14 sm:h-16 sm:w-16 ${p.iconColor} transition group-hover:scale-110`} strokeWidth={1.4} />
        {p.own && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#4F6F52] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#F7F3E8]">
            <Sprout className="h-3 w-3" /> Producción propia
          </span>
        )}
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80">
          <Heart className="h-3.5 w-3.5 text-[#4F6F52]" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-[#2F3A2F]">{p.name}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-[#2F3A2F]/55">
          <Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" /> {p.rating}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-extrabold text-[#4F6F52]">
            <span className="text-[10px] font-medium text-[#2F3A2F]/45">desde </span>
            {money(p.options[0].price)}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F6F52] text-[#F7F3E8]">
            <Plus className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  );
};

type Section = 'productos' | 'servicios' | 'pedidos' | 'cuenta' | 'ajustes';

const NAV_GROUPS: { title: string; items: { id: Section; label: string; icon: LucideIcon }[] }[] = [
  {
    title: 'Explorar',
    items: [
      { id: 'productos', label: 'Productos', icon: Package },
      { id: 'servicios', label: 'Servicios', icon: Wrench },
    ],
  },
  { title: 'Mi actividad', items: [{ id: 'pedidos', label: 'Pedidos realizados', icon: Receipt }] },
  {
    title: 'Cuenta',
    items: [
      { id: 'cuenta', label: 'Mi cuenta', icon: UserRound },
      { id: 'ajustes', label: 'Ajustes', icon: Settings },
    ],
  },
];

const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

/* Barra lateral desplegable: drawer en móvil/tablet, columna fija en escritorio */
const Sidebar = ({ open, section, name, onSelect, onClose, onLogout }: {
  open: boolean; section: Section; name: string;
  onSelect: (s: Section) => void; onClose: () => void; onLogout: () => void;
}) => (
  <>
    {open && <div onClick={onClose} aria-hidden="true" className="fixed inset-0 z-30 bg-[#2F3A2F]/45 backdrop-blur-[2px] lg:hidden" />}
    <aside
      inert={!open}
      aria-label="Menú principal"
      className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:max-w-none lg:shrink-0 lg:self-start lg:shadow-none lg:ring-1 lg:ring-black/5 ${open ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}
    >
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <BrandInline />
        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F3E8] text-[#2F3A2F] transition active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-[#F7F3E8] p-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4F6F52] text-base font-bold text-[#F7F3E8]">
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#2F3A2F]">{name}</p>
          <p className="text-xs text-[#6B7A6B]">Comprador</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-3">
        {NAV_GROUPS.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6B7A6B]">{g.title}</p>
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'text-[#2F3A2F] hover:bg-[#DCE8D2]/60'}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? 'bg-white/20' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#2F3A2F]/10 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-[#B4533C] transition hover:bg-[#F2D9D0]/50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F2D9D0]"><LogOut className="h-4 w-4" /></span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  </>
);

/* Barra categorizadora: categorías arriba, subcategorías de la categoría elegida debajo */
const CategoryBar = ({ categories, catId, subId, allLabel, onCat, onSub }: {
  categories: Category[]; catId: string; subId: string; allLabel: string;
  onCat: (id: string) => void; onSub: (id: string) => void;
}) => {
  const current = categories.find((c) => c.id === catId);
  const chip = (active: boolean) =>
    `flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-[#2F3A2F] text-[#F7F3E8]' : 'bg-white text-[#2F3A2F]/70 ring-1 ring-black/5 hover:bg-[#DCE8D2]/50'}`;
  const subChip = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${active ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-[#DCE8D2]/60 text-[#3E5C41] hover:bg-[#DCE8D2]'}`;

  return (
    <nav aria-label="Categorías" className="mt-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        <button onClick={() => onCat('')} aria-pressed={!catId} className={chip(!catId)}>
          <LayoutGrid className="h-4 w-4" /> {allLabel}
        </button>
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => onCat(c.id)} aria-pressed={catId === c.id} className={chip(catId === c.id)}>
              <Icon className="h-4 w-4" /> {c.label}
            </button>
          );
        })}
      </div>

      {current && (
        <div className="-mx-4 mt-2.5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:rounded-2xl sm:bg-white/60 sm:p-2.5">
          <ChevronRight className="h-4 w-4 shrink-0 text-[#86A789]" />
          <button onClick={() => onSub('')} aria-pressed={!subId} className={subChip(!subId)}>Todas</button>
          {current.subs.map((s) => (
            <button key={s.id} onClick={() => onSub(s.id)} aria-pressed={subId === s.id} className={subChip(subId === s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

const ServiceCard = ({ s, onRequest }: { s: Service; onRequest: (s: Service) => void }) => {
  const Icon = s.icon;
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br sm:h-32 ${s.tone}`}>
        <Icon className={`h-12 w-12 sm:h-14 sm:w-14 ${s.iconColor}`} strokeWidth={1.4} />
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#4F6F52] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F7F3E8]">
          <BadgeCheck className="h-3.5 w-3.5" /> Aprobado
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-[#2F3A2F] sm:text-[15px]">{s.title}</h3>
        <p className="mt-0.5 text-xs font-medium text-[#4F6F52]">{s.provider}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#2F3A2F]/60">{s.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#2F3A2F]/60">
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" /> {s.rating.toFixed(1)} · {s.jobs} trabajos</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#86A789]" /> {s.zone}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-base font-extrabold text-[#4F6F52]">
            {money(s.price)}<span className="text-[11px] font-medium text-[#2F3A2F]/45"> / {s.unit}</span>
          </span>
          <button
            onClick={() => onRequest(s)}
            className="rounded-xl bg-[#4F6F52] px-4 py-2 text-sm font-semibold text-[#F7F3E8] transition active:scale-95 hover:bg-[#435E46]"
          >
            Solicitar
          </button>
        </div>
      </div>
    </article>
  );
};

const ServiceRequestModal = ({ service, onClose }: { service: Service; onClose: () => void }) => {
  const [when, setWhen] = useState('Hoy');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);
  const Icon = service.icon;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Solicitar ${service.title}`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2F3A2F]/55 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-[#F7F3E8] p-5 shadow-2xl sm:rounded-[2rem] sm:p-8">
        {sent ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4F6F52]">
              <CheckCircle2 className="h-9 w-9 text-[#F7F3E8]" />
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-[#2F3A2F]">Solicitud enviada</h2>
            <p className="mt-2 text-sm text-[#2F3A2F]/65">
              {service.provider} se pondrá en contacto contigo para confirmar el horario y el precio final.
            </p>
            <PrimaryButton className="mt-6" onClick={onClose}>Listo</PrimaryButton>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${service.tone}`}>
                <Icon className={`h-8 w-8 ${service.iconColor}`} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold leading-snug text-[#2F3A2F]">{service.title}</h2>
                <p className="text-sm font-medium text-[#4F6F52]">{service.provider}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#2F3A2F]/60"><BadgeCheck className="h-4 w-4 text-[#4F6F52]" /> Aprobado por la administración</p>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2F3A2F] ring-1 ring-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#2F3A2F]/70">{service.description}</p>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-black/5">
              <span className="text-[#2F3A2F]/60">Tarifa referencial</span>
              <span className="font-extrabold text-[#4F6F52]">{money(service.price)} / {service.unit}</span>
            </div>

            <h3 className="mb-2.5 mt-5 text-sm font-bold text-[#2F3A2F]">¿Cuándo lo necesitas?</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {['Hoy', 'Mañana', 'Esta semana'].map((w) => (
                <button
                  key={w}
                  onClick={() => setWhen(w)}
                  aria-pressed={when === w}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${when === w ? 'bg-[#4F6F52] text-[#F7F3E8] shadow-md' : 'bg-white text-[#2F3A2F] ring-1 ring-black/10 hover:ring-[#4F6F52]/50'}`}
                >
                  {w}
                </button>
              ))}
            </div>

            <h3 className="mb-2.5 mt-5 text-sm font-bold text-[#2F3A2F]">Detalles de la solicitud</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cuéntanos qué necesitas y dónde (referencia de la dirección)…"
              className="w-full resize-none rounded-2xl bg-white p-4 text-sm text-[#2F3A2F] outline-none ring-1 ring-black/10 placeholder:text-[#2F3A2F]/35 focus:ring-2 focus:ring-[#4F6F52]"
            />

            <PrimaryButton className="mt-5" onClick={() => setSent(true)}>
              Enviar solicitud <ArrowRight className="h-5 w-5" />
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  Preparando: 'bg-[#F8EBC2] text-[#8A6D12]',
  'En camino': 'bg-[#DCE8F2] text-[#3A6490]',
  Entregado: 'bg-[#DCE8D2] text-[#3E5C41]',
  Cancelado: 'bg-[#F2D9D0] text-[#9A3F2A]',
};

const OrdersView = () => {
  const [filter, setFilter] = useState<'Todos' | Order['kind']>('Todos');
  const list = MOCK_ORDERS.filter((o) => filter === 'Todos' || o.kind === filter);

  return (
    <section>
      <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Pedidos realizados</h1>
      <p className="mt-1 text-sm text-[#2F3A2F]/55">Tus compras de productos y solicitudes de servicios.</p>

      <div className="mt-4 flex gap-2">
        {(['Todos', 'Producto', 'Servicio'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === f ? 'bg-[#2F3A2F] text-[#F7F3E8]' : 'bg-white text-[#2F3A2F]/70 ring-1 ring-black/5 hover:bg-[#DCE8D2]/50'}`}
          >
            {f === 'Todos' ? f : `${f}s`}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {list.length ? list.map((o) => (
          <article key={o.id} className="flex flex-col gap-3 rounded-3xl bg-white p-4 ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCE8D2] text-[#4F6F52]">
              {o.kind === 'Producto' ? <Package className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-sm font-bold text-[#4F6F52]">#{o.id}</span>
                <span className="text-xs text-[#2F3A2F]/50">{o.date} · {o.kind}</span>
              </div>
              <p className="mt-1 text-sm text-[#2F3A2F]/80">{o.summary}</p>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1.5">
              <span className="text-lg font-extrabold text-[#2F3A2F]">{money(o.total)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[o.status]}`}>{o.status}</span>
            </div>
          </article>
        )) : (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-[#2F3A2F]/55">Aún no tienes pedidos en esta categoría.</div>
        )}
      </div>
    </section>
  );
};

const AccountView = ({ form, onEdit }: { form: BillingForm; onEdit: () => void }) => {
  const rows: { label: string; value: string; icon: LucideIcon }[] = [
    { label: 'Cédula / RUC', value: form.cedula, icon: FileText },
    { label: 'Teléfono', value: form.telefono, icon: Phone },
    { label: 'Dirección de entrega', value: form.direccion, icon: MapPin },
  ];

  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Mi cuenta</h1>
      <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#4F6F52] text-2xl font-bold text-[#F7F3E8]">
            {(form.nombre || 'I').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-[#2F3A2F]">{form.nombre || 'Invitado'}</p>
            <p className="text-sm text-[#6B7A6B]">Comprador</p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[#2F3A2F]/10">
          {rows.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 py-3.5">
              <Icon className="h-5 w-5 shrink-0 text-[#86A789]" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">{label}</dt>
                <dd className={`truncate text-sm ${value ? 'text-[#2F3A2F]' : 'text-[#2F3A2F]/40'}`}>{value || 'Sin completar'}</dd>
              </div>
            </div>
          ))}
        </dl>

        <PrimaryButton className="mt-3" onClick={onEdit}>Editar mis datos</PrimaryButton>
      </div>
    </section>
  );
};

interface SettingsState { pedidos: boolean; ofertas: boolean; servicios: boolean; factura: boolean }

const SETTINGS_OPTIONS: { key: keyof SettingsState; label: string; sub: string }[] = [
  { key: 'pedidos', label: 'Estado de mis pedidos', sub: 'Avisos cuando tu pedido se prepare, salga y llegue.' },
  { key: 'servicios', label: 'Respuestas de servicios', sub: 'Avisos cuando un profesional responda tu solicitud.' },
  { key: 'ofertas', label: 'Ofertas y cupones', sub: 'Promociones de productos y servicios de tu zona.' },
  { key: 'factura', label: 'Factura electrónica por correo', sub: 'Recibe tu factura apenas se confirme el pago.' },
];

const SettingsView = ({ settings, setSettings }: { settings: SettingsState; setSettings: Setter<SettingsState> }) => (
  <section className="max-w-2xl">
    <h1 className="text-2xl font-extrabold text-[#2F3A2F] sm:text-3xl">Ajustes</h1>
    <p className="mt-1 text-sm text-[#2F3A2F]/55">Elige qué quieres recibir.</p>
    <div className="mt-5 divide-y divide-[#2F3A2F]/10 rounded-3xl bg-white px-5 ring-1 ring-black/5 sm:px-6">
      {SETTINGS_OPTIONS.map((o) => (
        <div key={o.key} className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#2F3A2F]">{o.label}</p>
            <p className="text-xs text-[#2F3A2F]/55">{o.sub}</p>
          </div>
          <button
            role="switch"
            aria-checked={settings[o.key]}
            aria-label={o.label}
            onClick={() => setSettings((s) => ({ ...s, [o.key]: !s[o.key] }))}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings[o.key] ? 'bg-[#4F6F52]' : 'bg-[#2F3A2F]/20'}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${settings[o.key] ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </button>
        </div>
      ))}
    </div>
  </section>
);

const HomeScreen = ({ go, openProduct, form, itemCount }: { go: Go; openProduct: (id: string) => void; form: BillingForm; itemCount: number }) => {
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [section, setSection] = useState<Section>('productos');
  const [query, setQuery] = useState('');
  const [catId, setCatId] = useState('');
  const [subId, setSubId] = useState('');
  const [ownOnly, setOwnOnly] = useState(false);
  const [requested, setRequested] = useState<Service | null>(null);
  const [settings, setSettings] = useState<SettingsState>({ pedidos: true, servicios: true, ofertas: false, factura: true });

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isDesktop()) setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const selectSection = (s: Section) => {
    setSection(s);
    setQuery('');
    setCatId('');
    setSubId('');
    setOwnOnly(false);
    if (!isDesktop()) setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  };

  const selectCat = (id: string) => {
    setCatId(id);
    setSubId('');
  };

  const isServices = section === 'servicios';
  const isCatalog = section === 'productos' || isServices;
  const categories = isServices ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES;
  const q = query.trim().toLowerCase();
  const inCategory = (categoryId: string, sub: string) => (!catId || categoryId === catId) && (!subId || sub === subId);

  const products = PRODUCTS.filter((p) => inCategory(p.categoryId, p.subId) && (!ownOnly || p.own) && p.name.toLowerCase().includes(q));
  const services = SERVICES.filter((s) => inCategory(s.categoryId, s.subId) && `${s.title} ${s.provider}`.toLowerCase().includes(q));
  const resultCount = isServices ? services.length : products.length;

  const currentCat = categories.find((c) => c.id === catId);
  const currentSub = currentCat?.subs.find((s) => s.id === subId);

  const banner = isServices
    ? {
        gradient: 'from-[#F3E3C7] to-[#E8C896]', accent: 'text-[#B7792B]', Icon: Wrench, tag: 'Servicios de tu zona',
        title: 'Profesionales de confianza, aprobados por la administración',
        text: <>Mecánicos, niñeras, electricistas y mucho más <b className="text-[#B7792B]">cerca de ti</b></>,
      }
    : {
        gradient: 'from-[#DCE8D2] to-[#C4D9B8]', accent: 'text-[#4F6F52]', Icon: Salad, tag: 'Cosecha de hoy',
        title: '10% en tu primer pedido sostenible',
        text: <>Usa el cupón <b className="text-[#4F6F52]">HORIZONTE10</b></>,
      };

  return (
    <div className="flex min-h-screen bg-[#F7F3E8]">
      <Sidebar
        open={sidebarOpen}
        section={section}
        name={form.nombre || 'Invitado'}
        onSelect={selectSection}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => go('welcome')}
      />

      <div className="min-w-0 flex-1 pb-28">
        <header className="sticky top-0 z-20 bg-[#4F6F52] shadow-md shadow-[#4F6F52]/20">
          <Container className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:flex-nowrap md:py-4">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3E8]/15 transition active:scale-90"
            >
              <Menu className="h-5 w-5 text-[#F7F3E8]" />
            </button>

            <div className={`hidden md:block ${sidebarOpen ? 'lg:hidden' : ''}`}><BrandInline onDark /></div>

            <button className="flex items-center gap-2 text-left md:order-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F3E8]/15">
                <MapPin className="h-5 w-5 text-[#F7F3E8]" />
              </span>
              <span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-[#DCE8D2]">Entregar en</span>
                <span className="flex items-center gap-1 text-sm font-bold text-[#F7F3E8]">
                  {form.direccion ? form.direccion.slice(0, 22) : 'Quito, Ecuador'}
                  <ChevronDown className="h-4 w-4" />
                </span>
              </span>
            </button>

            {isCatalog ? (
              <div className="order-last flex w-full items-center gap-3 rounded-2xl bg-[#F7F3E8] px-4 py-3 md:order-1 md:w-auto md:flex-1">
                <Search className="h-5 w-5 shrink-0 text-[#86A789]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isServices ? 'Busca electricista, niñera, mecánico…' : 'Busca lechugas, huevos, frutas…'}
                  className="w-full min-w-0 bg-transparent text-[15px] text-[#2F3A2F] outline-none placeholder:text-[#2F3A2F]/40"
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
                    <X className="h-4 w-4 text-[#2F3A2F]/50" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden md:order-1 md:block md:flex-1" />
            )}

            <button
              onClick={() => go('cart')}
              aria-label="Ir al carrito"
              className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F3E8]/15 md:order-3 md:ml-0"
            >
              <ShoppingBasket className="h-5 w-5 text-[#F7F3E8]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#F7F3E8] px-1 text-[11px] font-bold text-[#4F6F52]">
                  {itemCount}
                </span>
              )}
            </button>
          </Container>
        </header>

        <Container className="pt-5 sm:pt-8">
          {isCatalog && (
            <>
              {/* Banner: cambia según la sección */}
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 sm:p-8 lg:p-12 ${banner.gradient}`}>
                <div className="relative z-10 max-w-[62%] sm:max-w-md lg:max-w-lg">
                  <span className={`rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${banner.accent}`}>
                    {banner.tag}
                  </span>
                  <h2 className="mt-3 text-xl font-extrabold leading-tight text-[#2F3A2F] sm:text-3xl lg:text-4xl">{banner.title}</h2>
                  <p className="mt-1.5 text-xs text-[#2F3A2F]/65 sm:text-base">{banner.text}</p>
                </div>
                <banner.Icon className={`absolute -bottom-3 -right-2 h-32 w-32 rotate-6 opacity-25 sm:-right-4 sm:h-52 sm:w-52 lg:right-10 lg:h-72 lg:w-72 ${banner.accent}`} strokeWidth={1.2} />
                <Leaf className={`absolute right-6 top-4 h-7 w-7 -rotate-12 opacity-40 sm:right-20 sm:h-10 sm:w-10 ${banner.accent}`} />
              </div>

              <CategoryBar
                categories={categories}
                catId={catId}
                subId={subId}
                allLabel={isServices ? 'Todos los servicios' : 'Todo'}
                onCat={selectCat}
                onSub={setSubId}
              />

              <div className="mb-4 mt-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-[#2F3A2F] sm:text-2xl">
                    {currentCat ? (
                      <>
                        {currentCat.label}
                        {currentSub && <span className="text-[#4F6F52]"> › {currentSub.label}</span>}
                      </>
                    ) : isServices ? 'Servicios disponibles' : 'Destacados sostenibles'}
                  </h2>
                  <p className="text-xs text-[#2F3A2F]/55 sm:text-sm">
                    {resultCount} {isServices ? (resultCount === 1 ? 'servicio' : 'servicios') : (resultCount === 1 ? 'producto' : 'productos')}
                    {' · '}
                    {isServices ? 'Profesionales aprobados por la administración' : 'Producción propia y agricultores aliados'}
                  </p>
                </div>
                {!isServices && (
                  <button
                    onClick={() => setOwnOnly((v) => !v)}
                    aria-pressed={ownOnly}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${ownOnly ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-white text-[#2F3A2F]/70 ring-1 ring-black/5 hover:bg-[#DCE8D2]/50'}`}
                  >
                    <Sprout className="h-4 w-4" /> Solo producción propia
                  </button>
                )}
              </div>

              {resultCount ? (
                isServices ? (
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                    {services.map((s) => <ServiceCard key={s.id} s={s} onRequest={setRequested} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((p) => <ProductCard key={p.id} p={p} onOpen={openProduct} />)}
                  </div>
                )
              ) : (
                <div className="rounded-3xl bg-white p-8 text-center text-sm text-[#2F3A2F]/55">
                  No encontramos resultados{query ? <> para “{query}”</> : ' en esta categoría'}.
                </div>
              )}
            </>
          )}

          {section === 'pedidos' && <OrdersView />}
          {section === 'cuenta' && <AccountView form={form} onEdit={() => go('login')} />}
          {section === 'ajustes' && <SettingsView settings={settings} setSettings={setSettings} />}
        </Container>

        <footer className="mt-12 border-t border-[#2F3A2F]/10 py-6 text-center text-xs text-[#2F3A2F]/50">
          © Horizonte Sostenible · Agricultura sostenible · Ecuador
        </footer>
      </div>

      {requested && <ServiceRequestModal service={requested} onClose={() => setRequested(null)} />}
    </div>
  );
};

/* ------------------------------ 4. Detalle ------------------------------ */

const DetailScreen = ({ go, product, selection, setSelection, onAdd }: {
  go: Go; product: Product; selection: Selection; setSelection: Setter<Selection>; onAdd: () => void;
}) => {
  const { qty, optionIdx, notes } = selection;
  const option = product.options[optionIdx] ?? product.options[0];
  const subtotal = option.price * qty;
  const Icon = product.icon;
  const isLettuce = product.id === 'lechuga';

  return (
    <div className="min-h-screen bg-[#F7F3E8] pb-28">
      <PageHeader title="Detalle del producto" onBack={() => go('home')} />

      <Container className="grid gap-6 pt-5 lg:grid-cols-2 lg:gap-12 lg:pt-8">
        {/* Imagen */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className={`relative flex h-72 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br sm:h-96 lg:h-[34rem] ${product.tone}`}>
            <div className="h-56 w-56 sm:h-72 sm:w-72 lg:h-96 lg:w-96">
              {isLettuce ? <LettuceIllustration /> : <Icon className={`h-full w-full ${product.iconColor}`} strokeWidth={1} />}
            </div>
            <button aria-label="Favorito" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm">
              <Heart className="h-5 w-5 text-[#4F6F52]" />
            </button>
            {product.own && (
              <div className="absolute bottom-4 left-4 right-4">
                <Badge icon={Sprout}>Producción Única Horizonte Sostenible</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Información */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight text-[#2F3A2F] sm:text-4xl">{product.name}</h1>
              <div className="mt-2 flex items-center gap-4 text-xs text-[#2F3A2F]/60 sm:text-sm">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[#D9A441] text-[#D9A441]" /> {product.rating}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Entrega hoy</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-extrabold text-[#4F6F52] sm:text-3xl">{money(option.price)}</div>
              <div className="text-[11px] text-[#2F3A2F]/50 sm:text-xs">por {option.label.toLowerCase()}</div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#2F3A2F]">
              <Droplets className="h-4 w-4 text-[#4F6F52]" /> Origen {isLettuce ? 'hidropónico' : 'orgánico'}
            </div>
            <p className="text-[13px] leading-relaxed text-[#2F3A2F]/70 sm:text-sm">{product.origin}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Sin pesticidas', 'Cosecha del día', 'Empaque reciclable'].map((t) => (
                <span key={t} className="rounded-full bg-[#DCE8D2] px-2.5 py-1 text-[11px] font-semibold text-[#3E5C41]">{t}</span>
              ))}
            </div>
          </div>

          {/* Presentación */}
          <h3 className="mb-2.5 mt-6 text-sm font-bold text-[#2F3A2F]">Presentación / peso</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {product.options.map((o, i) => (
              <button
                key={o.label}
                onClick={() => setSelection((s) => ({ ...s, optionIdx: i }))}
                className={`rounded-2xl px-4 py-3 text-left transition ${optionIdx === i ? 'bg-[#4F6F52] text-[#F7F3E8] shadow-md' : 'bg-white text-[#2F3A2F] ring-1 ring-black/10 hover:ring-[#4F6F52]/50'}`}
              >
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Package className="h-4 w-4 shrink-0" /> {o.label}
                </div>
                <div className={`mt-0.5 text-xs ${optionIdx === i ? 'text-[#DCE8D2]' : 'text-[#2F3A2F]/55'}`}>{money(o.price)}</div>
              </button>
            ))}
          </div>

          {/* Cantidad */}
          <div className="mt-6 flex items-center justify-between rounded-3xl bg-white p-4 ring-1 ring-black/5">
            <span className="text-sm font-bold text-[#2F3A2F]">Cantidad</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelection((s) => ({ ...s, qty: Math.max(1, s.qty - 1) }))}
                aria-label="Restar"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8D2] text-[#3E5C41] transition active:scale-90"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-6 text-center text-lg font-extrabold text-[#2F3A2F]">{qty}</span>
              <button
                onClick={() => setSelection((s) => ({ ...s, qty: s.qty + 1 }))}
                aria-label="Sumar"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F6F52] text-[#F7F3E8] transition active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notas */}
          <h3 className="mb-2.5 mt-6 text-sm font-bold text-[#2F3A2F]">Notas del pedido</h3>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setSelection((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Ej: Hojas bien verdes, sin raíz, entregar en portería…"
            className="w-full resize-none rounded-2xl bg-white p-4 text-sm text-[#2F3A2F] outline-none ring-1 ring-black/10 placeholder:text-[#2F3A2F]/35 focus:ring-2 focus:ring-[#4F6F52]"
          />

          <PrimaryButton className="mt-6 justify-between" onClick={onAdd}>
            <span className="flex items-center gap-2"><ShoppingBasket className="h-5 w-5" /> Agregar al carrito</span>
            <span className="rounded-xl bg-[#F7F3E8]/20 px-3 py-1 text-sm">{money(subtotal)}</span>
          </PrimaryButton>
        </div>
      </Container>
    </div>
  );
};

/* ------------------------------ 5. Carrito ------------------------------ */

const CartScreen = ({ go, product, selection, setSelection, totals, coupon, setCoupon, couponApplied, setCouponApplied }: {
  go: Go; product: Product; selection: Selection; setSelection: Setter<Selection>; totals: Totals;
  coupon: string; setCoupon: Setter<string>; couponApplied: boolean; setCouponApplied: Setter<boolean>;
}) => {
  const [error, setError] = useState(false);
  const option = product.options[selection.optionIdx] ?? product.options[0];
  const Icon = product.icon;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'HORIZONTE10') {
      setCouponApplied(true);
      setError(false);
    } else {
      setCouponApplied(false);
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E8] pb-28">
      <PageHeader title="Mi carrito" onBack={() => go('detail')} />
      <Container className="grid gap-6 pt-5 lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-10 lg:pt-8">
        <section>
          <h1 className="mb-4 hidden text-3xl font-extrabold text-[#2F3A2F] lg:block">Resumen del pedido</h1>
          <div className="flex gap-4 rounded-3xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br sm:h-28 sm:w-28 ${product.tone}`}>
              <Icon className={`h-10 w-10 sm:h-14 sm:w-14 ${product.iconColor}`} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold text-[#2F3A2F] sm:text-lg">{product.name}</h3>
              <p className="text-xs text-[#2F3A2F]/55 sm:text-sm">{option.label} · {money(option.price)} c/u</p>
              {selection.notes && <p className="mt-1 truncate text-[11px] italic text-[#4F6F52] sm:text-xs">“{selection.notes}”</p>}
              <div className="mt-2 flex items-center justify-between sm:mt-4">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelection((s) => ({ ...s, qty: Math.max(1, s.qty - 1) }))}
                    aria-label="Restar"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCE8D2] text-[#3E5C41]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{selection.qty}</span>
                  <button
                    onClick={() => setSelection((s) => ({ ...s, qty: s.qty + 1 }))}
                    aria-label="Sumar"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F6F52] text-[#F7F3E8]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-base font-extrabold text-[#4F6F52] sm:text-xl">{money(totals.subtotal)}</span>
              </div>
            </div>
          </div>

          <button onClick={() => go('home')} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#4F6F52] hover:underline">
            <Plus className="h-4 w-4" /> Seguir comprando
          </button>
        </section>

        <aside className="lg:sticky lg:top-24">
          {/* Cupón */}
          <div>
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-[#4F6F52]">
              <Tag className="ml-3 h-5 w-5 shrink-0 text-[#86A789]" />
              <input
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setError(false); }}
                placeholder="Cupón de descuento"
                className="min-w-0 flex-1 bg-transparent px-1 text-[15px] uppercase text-[#2F3A2F] outline-none placeholder:normal-case placeholder:text-[#2F3A2F]/35"
              />
              <button onClick={applyCoupon} className="rounded-xl bg-[#2F3A2F] px-4 py-2.5 text-sm font-semibold text-[#F7F3E8] active:scale-95">
                Aplicar
              </button>
            </div>
            {couponApplied && (
              <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-[#4F6F52]">
                <CheckCircle2 className="h-4 w-4" /> Cupón HORIZONTE10 aplicado: 10% de descuento
              </p>
            )}
            {error && <p className="mt-2 px-1 text-xs font-semibold text-[#B4533C]">Cupón no válido. Prueba con HORIZONTE10.</p>}
          </div>

          {/* Desglose */}
          <div className="mt-5 space-y-3 rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <SummaryRow label="Subtotal" value={money(totals.subtotal)} />
            {couponApplied && <SummaryRow label="Descuento (10%)" value={`-${money(totals.discount)}`} green />}
            <SummaryRow label="Envío / Delivery" value={totals.delivery === 0 ? 'Gratis' : money(totals.delivery)} green={totals.delivery === 0} />
            <SummaryRow label="IVA (15%)" value={money(totals.iva)} />
            <div className="my-1 border-t border-dashed border-[#2F3A2F]/15" />
            <SummaryRow label="Total" value={money(totals.total)} strong />
          </div>

          <p className="mt-3 flex items-center gap-2 px-1 text-xs text-[#2F3A2F]/55">
            <Truck className="h-4 w-4 text-[#86A789]" />
            {totals.subtotal >= FREE_DELIVERY_FROM
              ? 'Tu pedido tiene envío gratis.'
              : `Envío gratis en compras desde ${money(FREE_DELIVERY_FROM)}.`}
          </p>

          <PrimaryButton className="mt-5" onClick={() => go('payment')}>
            Proceder al Pago <ArrowRight className="h-5 w-5" />
          </PrimaryButton>
        </aside>
      </Container>
    </div>
  );
};

/* ------------------------- 6. Pago y recibo ------------------------- */

const PAY_METHODS = [
  { id: 'card', label: 'Tarjeta de crédito / débito', sub: 'Visa, Mastercard, Diners', icon: CreditCard },
  { id: 'transfer', label: 'Transferencia directa', sub: 'Banco Pichincha · Produbanco', icon: Landmark },
  { id: 'cash', label: 'Efectivo contra entrega', sub: 'Paga al recibir tu pedido', icon: Banknote },
];

const PaymentScreen = ({ go, product, selection, totals, billing, couponApplied, confirmed, setConfirmed }: {
  go: Go; product: Product; selection: Selection; totals: Totals; billing: Billing;
  couponApplied: boolean; confirmed: boolean; setConfirmed: Setter<boolean>;
}) => {
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [orderNo] = useState(() => `BB-${Math.floor(100000 + Math.random() * 900000)}`);
  const option = product.options[selection.optionIdx] ?? product.options[0];

  const fmtNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setConfirmed(true);
    }, 1200);
  };

  const methodLabel = PAY_METHODS.find((m) => m.id === method)?.label ?? '';

  return (
    <div className="min-h-screen bg-[#F7F3E8] pb-28">
      <PageHeader title="Pago" onBack={() => go('cart')} />
      <Container className="grid gap-6 pt-5 lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-10 lg:pt-8">
        <section>
          <h3 className="mb-3 text-sm font-bold text-[#2F3A2F] sm:text-base">Método de pago</h3>
          <div className="grid gap-2.5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {PAY_METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3.5 rounded-2xl bg-white p-4 text-left transition md:flex-col md:items-start lg:flex-row lg:items-center xl:flex-col xl:items-start ${active ? 'ring-2 ring-[#4F6F52]' : 'ring-1 ring-black/10 hover:ring-[#4F6F52]/40'}`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#2F3A2F]">{m.label}</span>
                    <span className="block text-xs text-[#2F3A2F]/55">{m.sub}</span>
                  </span>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-[#4F6F52]' : 'border-[#2F3A2F]/20'}`}>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-[#4F6F52]" />}
                  </span>
                </button>
              );
            })}
          </div>

          {method === 'card' && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 md:items-start">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4F6F52] to-[#2F4A33] p-5 text-[#F7F3E8] shadow-xl shadow-[#4F6F52]/30 sm:p-6">
                <Leaf className="absolute -right-4 -top-4 h-28 w-28 rotate-12 text-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#DCE8D2]">bigban pay</span>
                  <CreditCard className="h-6 w-6 text-[#DCE8D2]" />
                </div>
                <div className="mt-7 break-all font-mono text-lg tracking-[0.15em] sm:text-xl sm:tracking-[0.18em]">{card.number || '•••• •••• •••• ••••'}</div>
                <div className="mt-5 flex items-end justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-[#DCE8D2]">Titular</div>
                    <div className="mt-0.5 truncate text-sm font-semibold uppercase">{card.name || 'Nombre Apellido'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-[#DCE8D2]">Vence</div>
                    <div className="mt-0.5 text-sm font-semibold">{card.exp || 'MM/AA'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <Field label="Número de tarjeta" icon={CreditCard}>
                  <input inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: fmtNumber(e.target.value) })} placeholder="4111 1111 1111 1111" className={inputCls} />
                </Field>
                <Field label="Nombre en la tarjeta" icon={UserRound}>
                  <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="MARIA TORRES" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vencimiento">
                    <input inputMode="numeric" value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} placeholder="MM/AA" className={inputCls} />
                  </Field>
                  <Field label="CVV" icon={Lock}>
                    <input inputMode="numeric" type="password" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} placeholder="•••" className={inputCls} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {method === 'transfer' && (
            <div className="mt-6 space-y-2 rounded-3xl bg-white p-5 text-sm text-[#2F3A2F]/80 ring-1 ring-black/5">
              <p className="font-bold text-[#2F3A2F]">Datos para transferir</p>
              <p>Banco: <b>Banco Pichincha</b></p>
              <p>Cuenta corriente: <b>2100 123 456</b></p>
              <p>Titular: <b>Horizonte Sostenible S.A.</b></p>
              <p>RUC: <b>1790000000001</b></p>
              <p className="pt-1 text-xs text-[#2F3A2F]/55">Envía el comprobante por WhatsApp para confirmar tu pedido.</p>
            </div>
          )}

          {method === 'cash' && (
            <div className="mt-6 flex gap-3 rounded-3xl bg-white p-5 text-sm text-[#2F3A2F]/80 ring-1 ring-black/5">
              <Banknote className="h-6 w-6 shrink-0 text-[#4F6F52]" />
              <p>Pagarás <b>{money(totals.total)}</b> en efectivo al recibir tu pedido. Te recomendamos tener el valor exacto.</p>
            </div>
          )}
        </section>

        {/* Resumen lateral */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <p className="text-sm font-bold text-[#2F3A2F]">Tu pedido</p>
            <div className="flex justify-between gap-3 text-sm text-[#2F3A2F]">
              <span>{selection.qty} × {product.short} <span className="text-[#2F3A2F]/55">({option.label})</span></span>
              <span className="font-semibold">{money(totals.subtotal)}</span>
            </div>
            {couponApplied && <SummaryRow label="Descuento (10%)" value={`-${money(totals.discount)}`} green />}
            <SummaryRow label="Envío" value={totals.delivery === 0 ? 'Gratis' : money(totals.delivery)} />
            <SummaryRow label="IVA (15%)" value={money(totals.iva)} />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#DCE8D2] px-5 py-4">
            <span className="text-sm font-semibold text-[#3E5C41]">Total a pagar</span>
            <span className="text-xl font-extrabold text-[#2F3A2F]">{money(totals.total)}</span>
          </div>

          <PrimaryButton onClick={pay} disabled={processing}>
            {processing ? (<><Loader2 className="h-5 w-5 animate-spin" /> Procesando…</>) : (<><ShieldCheck className="h-5 w-5" /> Pagar {money(totals.total)}</>)}
          </PrimaryButton>
        </aside>
      </Container>

      {/* Modal de confirmación / recibo */}
      {confirmed && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#2F3A2F]/55 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-[#F7F3E8] p-5 shadow-2xl sm:rounded-[2rem] sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4F6F52]">
                <CheckCircle2 className="h-9 w-9 text-[#F7F3E8]" />
              </div>
              <span className="mt-3 rounded-full bg-[#DCE8D2] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#3E5C41]">
                Pedido Confirmado
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-[#2F3A2F]">¡Gracias por tu compra!</h2>
              <p className="mt-1 text-sm text-[#2F3A2F]/60">Estamos cosechando y preparando tu pedido.</p>
            </div>

            <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-dashed border-[#2F3A2F]/15 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2F3A2F]"><Receipt className="h-4 w-4 text-[#4F6F52]" /> Recibo digital</div>
                <span className="font-mono text-sm font-bold text-[#4F6F52]">#{orderNo}</span>
              </div>

              <div className="space-y-1.5 py-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#2F3A2F]">{selection.qty} × {product.short} <span className="text-[#2F3A2F]/55">({option.label})</span></span>
                  <span className="font-semibold">{money(totals.subtotal)}</span>
                </div>
                {couponApplied && <div className="flex justify-between text-[#4F6F52]"><span>Descuento</span><span>-{money(totals.discount)}</span></div>}
                <div className="flex justify-between text-[#2F3A2F]/65"><span>Envío</span><span>{totals.delivery === 0 ? 'Gratis' : money(totals.delivery)}</span></div>
                <div className="flex justify-between text-[#2F3A2F]/65"><span>IVA (15%)</span><span>{money(totals.iva)}</span></div>
                <div className="flex justify-between border-t border-[#2F3A2F]/10 pt-2 text-base font-extrabold"><span>Total</span><span>{money(totals.total)}</span></div>
              </div>

              <div className="space-y-1.5 border-t border-dashed border-[#2F3A2F]/15 pt-3 text-[13px] text-[#2F3A2F]/75">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6B7A6B]">Datos de facturación</p>
                <p><b>{billing.nombre}</b></p>
                <p>{billing.docType}: {billing.cedula}</p>
                <p>Tel: {billing.telefono}</p>
                <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#86A789]" /> {billing.direccion}</p>
                <p className="pt-1 text-xs text-[#2F3A2F]/55">Pago: {methodLabel}</p>
              </div>
            </div>

            <PrimaryButton className="mt-5" onClick={() => { setConfirmed(false); go('home'); }}>
              <Store className="h-5 w-5" /> Volver al inicio
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------- Floating Switcher ------------------------- */

const FloatingSwitcher = ({ screen, go }: { screen: ScreenId; go: Go }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="w-64 rounded-3xl bg-white/95 p-2 shadow-2xl ring-1 ring-black/10 backdrop-blur">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7A6B]">Navegar pantallas</p>
          {SCREENS.map((s, i) => {
            const Icon = s.icon;
            const active = screen === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { go(s.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'text-[#2F3A2F] hover:bg-[#DCE8D2]/60'}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${active ? 'bg-white/20' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{i + 1}. {s.label}</span>
              </button>
            );
          })}
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

/* ------------------------------ App ------------------------------ */

export default function BuyerApp() {
  const [screen, setScreen] = useState<ScreenId>('welcome');
  const [form, setForm] = useState<BillingForm>({ cedula: '', nombre: '', telefono: '', direccion: '' });
  const [productId, setProductId] = useState('lechuga');
  const [selection, setSelection] = useState<Selection>({ qty: 2, optionIdx: 1, notes: '' });
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  const option = product.options[selection.optionIdx] ?? product.options[0];

  const totals = useMemo(() => {
    const subtotal = option.price * selection.qty;
    const discount = couponApplied ? subtotal * 0.1 : 0;
    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const iva = (subtotal - discount) * IVA;
    return { subtotal, discount, delivery, iva, total: subtotal - discount + delivery + iva };
  }, [option, selection.qty, couponApplied]);

  const billing: Billing = {
    nombre: form.nombre || 'María Fernanda Torres',
    cedula: form.cedula || '1712345678',
    docType: form.cedula.length === 13 ? 'RUC' : 'Cédula',
    telefono: form.telefono || '099 123 4567',
    direccion: form.direccion || 'Av. Siempre Viva 742, Quito',
  };

  const go: Go = (id) => {
    if (id !== 'payment') setConfirmed(false);
    setScreen(id);
    window.scrollTo({ top: 0 });
  };

  const openProduct = (id: string) => {
    if (id !== productId) {
      setProductId(id);
      setSelection({ qty: 1, optionIdx: 0, notes: '' });
    }
    go('detail');
  };

  return (
    <div className="min-h-screen bg-[#F7F3E8] font-sans text-[#2F3A2F] antialiased">
      <div key={screen}>
        {screen === 'welcome' && <WelcomeScreen go={go} />}
        {screen === 'login' && <LoginScreen go={go} form={form} setForm={setForm} />}
        {screen === 'home' && <HomeScreen go={go} openProduct={openProduct} form={form} itemCount={selection.qty} />}
        {screen === 'detail' && <DetailScreen go={go} product={product} selection={selection} setSelection={setSelection} onAdd={() => go('cart')} />}
        {screen === 'cart' && (
          <CartScreen
            go={go} product={product} selection={selection} setSelection={setSelection} totals={totals}
            coupon={coupon} setCoupon={setCoupon} couponApplied={couponApplied} setCouponApplied={setCouponApplied}
          />
        )}
        {screen === 'payment' && (
          <PaymentScreen
            go={go} product={product} selection={selection} totals={totals} billing={billing}
            couponApplied={couponApplied} confirmed={confirmed} setConfirmed={setConfirmed}
          />
        )}
      </div>

      <FloatingSwitcher screen={screen} go={go} />
    </div>
  );
}

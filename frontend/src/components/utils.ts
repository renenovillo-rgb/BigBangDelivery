import type { EstadoHistoria, EstadoPedido, EstadoProducto, TipoItem } from '../types';

/* ------------------------------------------------------------------ */
/*  Utilidades compartidas del panel del vendedor                       */
/* ------------------------------------------------------------------ */

export const IVA = 0.15;

export const money = (n: number) => `$${n.toFixed(2)}`;
export const round2 = (n: number) => Math.round(n * 100) / 100;

export const inputCls =
  'w-full min-w-0 bg-transparent text-[15px] text-[#2F3A2F] outline-none placeholder:text-[#2F3A2F]/35';

/* ------------------------------- Fechas ------------------------------- */

const pad = (n: number) => String(n).padStart(2, '0');

export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const stamp = (d: Date) => `${dateKey(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const daysFromNow = (days: number, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

/* Días que faltan hasta una fecha 'YYYY-MM-DD' (negativo si ya pasó) */
export const daysUntil = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const weekdayShort = (key: string) => WEEKDAYS[new Date(`${key}T00:00:00`).getDay()];

/* '2026-11-21 09:40' → '21 nov · 09:40' */
export const prettyStamp = (s: string) => {
  const [date, time = ''] = s.split(' ');
  const [, m, d] = date.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]}${time ? ` · ${time}` : ''}`;
};

/* ---------------------------- Estados (pills) ---------------------------- */

export const TONES = {
  green: 'bg-[#DCE8D2] text-[#3E5C41]',
  amber: 'bg-[#F8EBC2] text-[#8A6D12]',
  blue: 'bg-[#DCE8F2] text-[#3A6490]',
  teal: 'bg-[#D3EAE4] text-[#2F6B5E]',
  red: 'bg-[#F2D9D0] text-[#9A3F2A]',
  gray: 'bg-[#2F3A2F]/10 text-[#2F3A2F]/70',
} as const;

export type Tone = keyof typeof TONES;

export const ORDER_STATUS: Record<EstadoPedido, { label: string; tone: Tone }> = {
  PENDIENTE: { label: 'Nuevo', tone: 'amber' },
  CONFIRMADO: { label: 'Confirmado', tone: 'blue' },
  EN_PREPARACION: { label: 'En preparación', tone: 'blue' },
  LISTO: { label: 'Listo para entrega', tone: 'teal' },
  COMPLETADO: { label: 'Entregado', tone: 'green' },
  CANCELADO: { label: 'Cancelado', tone: 'red' },
};

/* Flujo de trabajo del pedido una vez aceptado */
export const NEXT_ORDER_STEP: Partial<Record<EstadoPedido, { next: EstadoPedido; label: string }>> = {
  CONFIRMADO: { next: 'EN_PREPARACION', label: 'Empezar a preparar' },
  EN_PREPARACION: { next: 'LISTO', label: 'Marcar como listo' },
  LISTO: { next: 'COMPLETADO', label: 'Confirmar entrega' },
};

export const ORDER_STEPS: { id: EstadoPedido; label: string }[] = [
  { id: 'PENDIENTE', label: 'Recibido' },
  { id: 'CONFIRMADO', label: 'Confirmado' },
  { id: 'EN_PREPARACION', label: 'Preparación' },
  { id: 'LISTO', label: 'Listo' },
  { id: 'COMPLETADO', label: 'Entregado' },
];

export const PAYMENT_LABEL: Record<string, string> = {
  '01': 'Efectivo',
  '16': 'Tarjeta de débito',
  '19': 'Tarjeta de crédito',
  '20': 'Transferencia',
};

export const PRODUCT_STATUS: Record<EstadoProducto, { label: string; tone: Tone }> = {
  BORRADOR: { label: 'Borrador', tone: 'gray' },
  PENDIENTE_REVISION: { label: 'En revisión', tone: 'amber' },
  PUBLICADO: { label: 'Publicado', tone: 'green' },
  RECHAZADO: { label: 'Rechazado', tone: 'red' },
  AGOTADO: { label: 'Agotado', tone: 'red' },
  DESACTIVADO: { label: 'Pausado', tone: 'gray' },
};

export const ITEM_TYPE: Record<TipoItem, { label: string; tone: Tone }> = {
  PERECIBLE: { label: 'Perecible', tone: 'amber' },
  NO_PERECIBLE: { label: 'No perecible', tone: 'green' },
  SERVICIO: { label: 'Servicio', tone: 'blue' },
};

export const STORY_STATUS: Record<EstadoHistoria, { label: string; tone: Tone }> = {
  EN_REVISION: { label: 'En revisión', tone: 'amber' },
  PUBLICADA: { label: 'Publicada', tone: 'green' },
  RECHAZADA: { label: 'Rechazada', tone: 'red' },
};

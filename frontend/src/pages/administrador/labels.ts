import type { EstadoTienda, SolicitudActualizacionPerfil } from '../../types';
import type { Tone } from '../../components/utils';

export const VENDOR_STATUS: Record<EstadoTienda, { label: string; tone: Tone }> = {
  aprobado: { label: 'Activa', tone: 'green' },
  pendiente: { label: 'Por aprobar', tone: 'amber' },
  suspendido: { label: 'Suspendida', tone: 'red' },
};

export const FISCAL_FIELD_LABEL: Record<SolicitudActualizacionPerfil['campoAModificar'], string> = {
  direccionNegocio: 'Dirección fiscal',
  telefono: 'Teléfono',
  identificacionFiscal: 'RUC / Cédula',
  email: 'Correo electrónico',
  nombreComercial: 'Nombre comercial',
};

export const PUBLIC_FIELD_LABEL = {
  tagline: 'Lema',
  location: 'Ubicación',
  about: 'Quiénes somos',
  activities: 'A qué se dedican',
} as const;

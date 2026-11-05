export const RequestStatus = {
  PENDING: 'PENDIENTE',
  APPROVED: 'APROBADA',
  REJECTED: 'RECHAZADA',
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export interface SellerProfile {
  id: string;
  userId: string; // Relación con el usuario principal
  fullName: string;
  photoUrl?: string;
  email: string;
  phone: string;
  taxId: string; // RUC de 13 dígitos o Cédula de 10 dígitos
  tradeName?: string; // Nombre comercial del negocio
  businessAddress: string;
  
  // Parámetros fiscales requeridos por el SRI
  establishment: string; // Ejemplo: '001'
  emissionPoint: string; // Ejemplo: '001'
  
  isEditable: boolean; // Bloqueado por defecto para proteger facturación (false)
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateRequest {
  id: string;
  sellerId: string;
  fieldToUpdate: 'phone' | 'email' | 'taxId' | 'businessAddress' | 'tradeName'; // Campo objetivo
  currentValue: string; // Valor actual guardado
  newValue: string; // Nuevo valor solicitado
  reason: string; // Justificación emitida por el vendedor
  status: RequestStatus;
  adminResponse?: string; // Motivo de rechazo u observación del Admin
  createdAt: string;
  updatedAt?: string;
}
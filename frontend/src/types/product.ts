export const ItemType = {
  PERECIBLE: 'PERECIBLE',
  NO_PERECIBLE: 'NO_PERECIBLE',
  SERVICIO: 'SERVICIO',
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const ProductStatus = {
  DRAFT: 'BORRADOR',
  PENDING_APPROVAL: 'PENDIENTE_REVISION',
  PUBLISHED: 'PUBLICADO',
  REJECTED: 'RECHAZADO',
  OUT_OF_STOCK: 'AGOTADO',
  DISABLED: 'DESACTIVADO',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export type ServiceModalidad = 'A_DOMICILIO' | 'PRESENCIAL' | 'VIRTUAL';

export interface Product {
  id: string;
  storeId: string; // Relación indispensable con la Tienda en DB
  sellerId?: string;
  categoryId: string; // ID de categoría en DB
  categoryName?: string; // Nombre visible en UI
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: ItemType;
  status: ProductStatus; // Control de moderación por Admin
  rejectionReason?: string; // Retroalimentación del Admin si es rechazado

  // Campos para Productos (PERECIBLE y NO_PERECIBLE)
  stock?: number;
  unitMeasure?: string; // 'kg', 'libra', 'atado', 'unidad'

  // Específicos para PERECIBLE
  expirationDate?: string; // YYYY-MM-DD
  storageRequirements?: string; // ejemplo:"Refrigerado a 4°C"

  // Específicos para SERVICIO
  serviceDuration?: string; // 3 horas
  serviceModalidad?: ServiceModalidad; // 'A_DOMICILIO' | 'PRESENCIAL' | 'VIRTUAL'
  dailyCapacity?: number; // Cupos disponibles por día

  createdAt?: string;
  updatedAt?: string;
}
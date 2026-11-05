export const OrderStatus = {
  PENDING: 'PENDIENTE',
  CONFIRMED: 'CONFIRMADO',
  IN_PREPARATION: 'EN_PREPARACION',
  COMPLETED: 'COMPLETADO',
  REJECTED: 'RECHAZADO',
  CANCELLED: 'CANCELADO',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
  id: string;
  productId: string; // Para DB y stock
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unitMeasure?: string; // 'kg', 'unidad' (mantiene la modalidad histórica)
}

export interface Order {
  id: string;
  orderNumber: string; 
  storeId: string; // Identificador del comercio 
  compradorId: string;

  // Datos del Comprador (Requeridos para Facturación SRI)
  customerName: string;
  customerTaxId: string; // RUC o Cédula para la factura
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;

  // Desglose Financiero y Fiscal (SRI 15% IVA)
  subtotal: number;
  taxAmount: number; // IVA 15%
  shippingFee: number;
  total: number;

  // Pago y Estado
  paymentMethod: string; 
  status: OrderStatus;
  cancelReason?: string;
  
  // Trazabilidad de Fechas
  createdAt: string;
  updatedAt?: string;

  // Ítems comprados
  items: OrderItem[];
}
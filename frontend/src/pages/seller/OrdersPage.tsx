import { useState } from 'react';
import { OrderStatus, type Order } from '../../types/order';

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD-001',
    storeId: 'store-1',
    compradorId: 'user-1',
    customerName: 'Juan Pérez',
    customerTaxId: '0991234567001',
    customerEmail: 'juan.perez@ejemplo.com',
    customerAddress: 'Calle Larga y Benigno Malo',
    customerPhone: '0991234567',
    createdAt: '2026-10-26 10:30',
    status: OrderStatus.PENDING,
    subtotal: 30.87,
    taxAmount: 4.63,
    shippingFee: 0,
    total: 35.50,
    paymentMethod: '01',
    items: [
      { id: '1', productId: 'p1', productName: 'Miel Artesanal 500g', quantity: 2, unitPrice: 10.00, subtotal: 20.00 },
      { id: '2', productId: 'p2', productName: 'Queso Andino', quantity: 1, unitPrice: 15.50, subtotal: 15.50 },
    ],
  },
];

export const SellerOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Estados para modales
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Abrir modal de Factura al dar clic en Aceptar
  const handleOpenInvoiceModal = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  // Confirmar y generar factura
  const handleConfirmInvoice = () => {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === selectedOrder.id
          ? { ...ord, status: OrderStatus.CONFIRMED }
          : ord
      )
    );

    alert(`Factura emitida exitosamente para la orden ${selectedOrder.id}.`);
    setIsInvoiceModalOpen(false);
    setSelectedOrder(null);
  };

  // Abrir modal de Rechazo
  const handleOpenCancelModal = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  // Confirmar Rechazo
  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      alert('Por favor ingresa un motivo para cancelar la solicitud.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === selectedOrder?.id
          ? { ...ord, status: OrderStatus.REJECTED, cancelReason }
          : ord
      )
    );

    setIsCancelModalOpen(false);
    setCancelReason('');
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-teal-900">Solicitudes y Pedidos Entrantes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona las órdenes entrantes de tus compradores antes de proceder al despacho o facturación.
        </p>
      </div>

      {/* Tabla de Pedidos */}
      <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100/80 border-b border-gray-200 text-teal-950 font-semibold text-sm">
              <th className="p-4">N° Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                <td className="p-4 font-mono font-medium text-teal-900">{order.id}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="p-4 text-gray-600">{order.createdAt}</td>
                <td className="p-4 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                      order.status === OrderStatus.PENDING
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : order.status === OrderStatus.CONFIRMED
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {order.status === OrderStatus.PENDING ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenInvoiceModal(order)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                      >
                        Declinar
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Procesado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Vista Previa de Facturación */}
      {isInvoiceModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-5 border border-gray-100">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-teal-900">Vista Previa de Facturación</h2>
                <p className="text-xs text-gray-500">Verifica los datos del cliente antes de emitir la factura fiscal.</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                N° FACT-00{selectedOrder.id}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 text-xs space-y-1 text-gray-700">
                <h4 className="font-bold text-teal-900 uppercase tracking-wider mb-1">Datos del Cliente</h4>
                <p><strong className="text-gray-900">Nombre:</strong> {selectedOrder.customerName}</p>
                <p><strong className="text-gray-900">Teléfono:</strong> {selectedOrder.customerPhone}</p>
                <p><strong className="text-gray-900">Dirección:</strong> {selectedOrder.customerAddress}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">Detalle de Productos</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 border-b border-gray-200 text-gray-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">P. Unit</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="text-gray-800">
                          <td className="p-2.5">{item.productName}</td>
                          <td className="p-2.5 text-center">{item.quantity}</td>
                          <td className="p-2.5 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${(selectedOrder.total / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (15%):</span>
                  <span className="font-mono">${(selectedOrder.total - selectedOrder.total / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-teal-950 pt-1.5 border-t border-gray-200">
                  <span>Total a Facturar:</span>
                  <span className="font-mono text-base text-emerald-700">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmInvoice}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Confirmar y Generar Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Declinar Solicitud */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">
              Declinar Solicitud <span className="font-mono text-amber-800">{selectedOrder.id}</span>
            </h3>
            <p className="text-xs text-gray-600">
              Indica la razón por la que no puedes procesar este pedido:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ej: Sin stock suficiente o fuera de horario de atención..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-800 focus:border-transparent outline-none transition-all resize-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
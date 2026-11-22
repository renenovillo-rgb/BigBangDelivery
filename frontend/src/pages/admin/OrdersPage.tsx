import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { Pedido } from '../../types';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const data = await adminService.getPedidos();
        setPedidos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, []);

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO': return <CheckCircle2 size={16} className="text-[#2E6F40]" />;
      case 'PENDIENTE': return <Clock size={16} className="text-[#9A6B00]" />;
      case 'EN_PREPARACION': return <Package size={16} className="text-[#4A6B4E]" />;
      case 'LISTO': return <Truck size={16} className="text-[#4A6B4E]" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">Registro de Pedidos</h1>
        <p className="text-[#4A6B4E]/60 mt-1">Historial global de transacciones en la plataforma.</p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#D9E7D6] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F5EC] border-b border-[#D9E7D6]">
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">Número / Fecha</th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F5EC]">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-[#4A6B4E]/50 italic">Cargando pedidos...</td></tr>
            ) : pedidos.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-[#4A6B4E]/50 italic">No hay pedidos registrados.</td></tr>
            ) : pedidos.map((p) => (
              <tr key={p.id} className="hover:bg-[#F7F5EC]/30 transition-colors">
                <td className="px-6 py-5">
                  <p className="font-mono font-bold text-[#4A6B4E] text-sm">{p.numeroPedido}</p>
                  <p className="text-[10px] text-[#4A6B4E]/50">{new Date(p.fechaCreacion).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-[#4A6B4E] text-sm">{p.nombreCliente}</p>
                  <p className="text-xs text-[#4A6B4E]/60">{p.emailCliente}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-[#4A6B4E] text-base">${Number(p.total).toFixed(2)}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#F7F5EC] border border-[#D9E7D6] rounded-full w-fit">
                    {getStatusIcon(p.estadoPedido)}
                    <span className="text-[10px] font-bold text-[#4A6B4E] uppercase">{p.estadoPedido}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.estadoPago === 'pagado' ? 'bg-[#E6F4EA] text-[#2E6F40]' : 'bg-[#FEF7E0] text-[#9A6B00]'
                  }`}>
                    {p.estadoPago}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { SuscripcionVendedor } from '../../types';
import { CreditCard, Calendar } from 'lucide-react';

const SubscriptionsPage: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<SuscripcionVendedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const data = await adminService.getSuscripciones();
        if (!cancelled) {
          setSuscripciones(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">
          Suscripciones de Vendedores
        </h1>
        <p className="text-[#4A6B4E]/60 mt-1">
          Monitorea los planes activos y el estado de cobro de los comercios.
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#D9E7D6] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F5EC] border-b border-[#D9E7D6]">
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Plan / ID
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Periodo
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F5EC]">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-[#4A6B4E]/50 italic">
                  Cargando suscripciones...
                </td>
              </tr>
            ) : suscripciones.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-[#4A6B4E]/50 italic">
                  No hay suscripciones activas registradas.
                </td>
              </tr>
            ) : (
              suscripciones.map((s) => (
                <tr key={s.id} className="hover:bg-[#F7F5EC]/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D9E7D6] flex items-center justify-center text-[#4A6B4E]">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-[#4A6B4E]">Plan {s.planId}</p>
                        <p className="text-xs text-[#4A6B4E]/50">Tienda ID: {s.tiendaId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-[#4A6B4E]">
                      <Calendar size={14} className="text-[#4A6B4E]/40" />
                      <span>
                        {new Date(s.fechaInicio).toLocaleDateString()} -{' '}
                        {new Date(s.fechaFin).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.estado === 'activa'
                          ? 'bg-[#E6F4EA] text-[#2E6F40]'
                          : s.estado === 'vencida'
                            ? 'bg-[#FCE8E6] text-[#A53B2B]'
                            : 'bg-[#FEF7E0] text-[#9A6B00]'
                      }`}
                    >
                      {s.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
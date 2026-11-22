import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { Tienda, EstadoTienda } from '../../types';
import { CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';

const BADGE_STYLES: Record<EstadoTienda, string> = {
  aprobado: 'bg-[#E6F4EA] text-[#2E6F40]',
  pendiente: 'bg-[#FEF7E0] text-[#9A6B00]',
  suspendido: 'bg-[#FCE8E6] text-[#A53B2B]',
};

const StoresManagementPage: React.FC = () => {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadTiendas = async () => {
    try {
      const data = await adminService.getTiendas();
      setTiendas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const data = await adminService.getTiendas();
        if (!cancelled) {
          setTiendas(data);
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

  const handleUpdateStatus = async (id: string, nuevoEstado: EstadoTienda) => {
    if (window.confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`)) {
      await adminService.updateEstadoTienda(id, nuevoEstado);
      await reloadTiendas();
    }
  };

  const getStatusBadge = (estado: EstadoTienda) => (
    <span
      className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${BADGE_STYLES[estado]}`}
    >
      {estado}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">Tiendas &amp; Vendedores</h1>
        <p className="text-[#4A6B4E]/60 mt-1">
          Supervisa y aprueba el acceso de comercios a la comunidad.
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#D9E7D6] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F5EC] border-b border-[#D9E7D6]">
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Tienda
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                RUC
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F5EC]">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#4A6B4E]/50 italic">
                  Cargando comercios...
                </td>
              </tr>
            ) : tiendas.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#4A6B4E]/50 italic">
                  No hay tiendas registradas aún.
                </td>
              </tr>
            ) : (
              tiendas.map((tienda) => (
                <tr key={tienda.id} className="hover:bg-[#F7F5EC]/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#D9E7D6] flex items-center justify-center text-[#4A6B4E] font-bold overflow-hidden border border-[#4A6B4E]/10">
                        <img
                          src={tienda.logotipoUrl || '/placeholder.jpg'}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#4A6B4E]">{tienda.nombreComercial}</p>
                        <p className="text-xs text-[#4A6B4E]/60">{tienda.categoriaPrincipal}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#4A6B4E]">
                        <Phone size={12} className="text-[#4A6B4E]/40" /> {tienda.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#4A6B4E]">
                        <Mail size={12} className="text-[#4A6B4E]/40" /> {tienda.emailComercial}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#4A6B4E]/70 font-mono">{tienda.ruc}</td>
                  <td className="px-6 py-5">{getStatusBadge(tienda.estado)}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {tienda.estado !== 'aprobado' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(tienda.id, 'aprobado')}
                          className="p-2 text-[#2E6F40] hover:bg-[#E6F4EA] rounded-xl transition-colors"
                          title="Aprobar"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      {tienda.estado !== 'suspendido' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(tienda.id, 'suspendido')}
                          className="p-2 text-[#A53B2B] hover:bg-[#FCE8E6] rounded-xl transition-colors"
                          title="Suspender"
                        >
                          <AlertCircle size={20} />
                        </button>
                      )}
                    </div>
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

export default StoresManagementPage;
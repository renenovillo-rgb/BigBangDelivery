import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { Usuario, EstadoUsuario, RolUsuario } from '../../types';
import { UserCheck, UserX } from 'lucide-react';

const ROLE_STYLES: Record<RolUsuario, string> = {
  administrador: 'bg-[#4A6B4E] text-white',
  vendedor: 'bg-[#D9E7D6] text-[#4A6B4E]',
  comprador: 'bg-[#F7F5EC] text-[#4A6B4E] border border-[#D9E7D6]',
};

const UsersPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadUsuarios = async () => {
    try {
      const data = await adminService.getUsuarios();
      setUsuarios(data);
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
        const data = await adminService.getUsuarios();
        if (!cancelled) {
          setUsuarios(data);
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

  const handleUpdateStatus = async (id: string, estado: EstadoUsuario) => {
    await adminService.updateEstadoUsuario(id, estado);
    await reloadUsuarios();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">Gestión de Usuarios</h1>
        <p className="text-[#4A6B4E]/60 mt-1">
          Administra accesos y estados de todos los miembros de la plataforma.
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#D9E7D6] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F5EC] border-b border-[#D9E7D6]">
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Nombre / Email
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Identificación
              </th>
              <th className="px-6 py-4 text-[#4A6B4E] font-bold text-sm uppercase tracking-wider">
                Rol
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
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-[#F7F5EC]/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D9E7D6] flex items-center justify-center text-[#4A6B4E] font-bold border border-[#4A6B4E]/10 uppercase">
                        {user.nombres[0]}
                        {user.apellidos[0]}
                      </div>
                      <div>
                        <p className="font-bold text-[#4A6B4E]">
                          {user.nombres} {user.apellidos}
                        </p>
                        <p className="text-xs text-[#4A6B4E]/60">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#4A6B4E]/70">{user.numeroCedula}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ROLE_STYLES[user.rol] ?? 'bg-[#F7F5EC] text-[#4A6B4E]'
                      }`}
                    >
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.estado === 'activo'
                          ? 'bg-[#E6F4EA] text-[#2E6F40]'
                          : user.estado === 'suspendido'
                            ? 'bg-[#FCE8E6] text-[#A53B2B]'
                            : 'bg-[#FEF7E0] text-[#9A6B00]'
                      }`}
                    >
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {user.estado !== 'activo' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(user.id, 'activo')}
                          className="p-2 text-[#2E6F40] hover:bg-[#E6F4EA] rounded-xl transition-colors"
                          title="Activar"
                        >
                          <UserCheck size={20} />
                        </button>
                      )}
                      {user.estado === 'activo' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(user.id, 'suspendido')}
                          className="p-2 text-[#A53B2B] hover:bg-[#FCE8E6] rounded-xl transition-colors"
                          title="Suspender"
                        >
                          <UserX size={20} />
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

export default UsersPage;
import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Users, Store, BookOpen, ShoppingBag } from 'lucide-react';

interface DashboardStats {
  totalUsuarios: number;
  tiendasPendientes: number;
  historiasPendientes: number;
  totalPedidos: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        if (!cancelled) {
          setStats(data);
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

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        title: 'Usuarios Totales',
        value: stats?.totalUsuarios ?? 0,
        icon: <Users className="text-[#4A6B4E]" />,
        color: 'bg-[#E6F4EA]',
      },
      {
        title: 'Tiendas Pendientes',
        value: stats?.tiendasPendientes ?? 0,
        icon: <Store className="text-[#9A6B00]" />,
        color: 'bg-[#FEF7E0]',
      },
      {
        title: 'Historias en Revisión',
        value: stats?.historiasPendientes ?? 0,
        icon: <BookOpen className="text-[#2E6F40]" />,
        color: 'bg-[#D9E7D6]',
      },
      {
        title: 'Pedidos Realizados',
        value: stats?.totalPedidos ?? 0,
        icon: <ShoppingBag className="text-[#4A6B4E]" />,
        color: 'bg-[#FFFFFF]',
      },
    ],
    [stats],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">Bienvenido, Admin</h1>
        <p className="text-[#4A6B4E]/60 mt-1">
          {loading
            ? 'Cargando resumen de la comunidad BigBan...'
            : 'Aquí tienes el resumen actual de la comunidad BigBan.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`p-6 rounded-[20px] border border-[#D9E7D6] shadow-sm hover:shadow-md transition-shadow ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/50 rounded-lg">{card.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-[#4A6B4E]/70 text-sm font-medium uppercase tracking-wider">
                {card.title}
              </h3>
              <p className="text-4xl font-bold text-[#4A6B4E] mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[24px] border border-[#D9E7D6] shadow-sm">
          <h3 className="text-xl font-bold text-[#4A6B4E] mb-4 italic">Actividad Reciente</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-3 border-b border-[#F7F5EC] last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-[#F7F5EC] flex items-center justify-center text-xs font-bold text-[#4A6B4E]">
                  #
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#4A6B4E]">
                    Nueva tienda registrada: &quot;Finca El Salvia&quot;
                  </p>
                  <p className="text-xs text-[#4A6B4E]/50">Hace 2 horas</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-[#FEF7E0] text-[#9A6B00] text-[10px] font-bold rounded-full uppercase">
                  Pendiente
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#4A6B4E] p-8 rounded-[24px] text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Estado del Servidor</h3>
            <p className="text-white/80 text-sm mb-6">
              Todos los sistemas operativos y operando bajo parámetros ecológicos.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#D9E7D6] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Conectado a PostgreSQL 16</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
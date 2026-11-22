import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Store, BookOpen, Layers, Users, ShoppingCart, CreditCard, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Tiendas', path: '/admin/stores', icon: <Store size={20} /> },
    { name: 'Historias', path: '/admin/stories', icon: <BookOpen size={20} /> },
    { name: 'Categorías', path: '/admin/categories', icon: <Layers size={20} /> },
    { name: 'Usuarios', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Pedidos', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Suscripciones', path: '/admin/subscriptions', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F5EC] font-sans text-[#2D3436]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FFFFFF] border-r border-[#D9E7D6] flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#4A6B4E] tracking-tight">BigBan Admin</h1>
          <p className="text-xs text-[#4A6B4E]/60 uppercase tracking-widest mt-1">Panel de Control</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-[#4A6B4E] text-[#FFFFFF] shadow-md' 
                  : 'text-[#4A6B4E] hover:bg-[#D9E7D6]/50'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#D9E7D6]">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-[#A53B2B] hover:bg-[#FCE8E6] rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-[#FFFFFF] border-b border-[#D9E7D6] flex items-center justify-between px-8">
          <h2 className="text-[#4A6B4E] font-semibold text-lg italic">"Naturaleza, Comunidad y Comercio"</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#4A6B4E]">Admin Leo</p>
              <p className="text-xs text-[#4A6B4E]/60">Líder Técnico</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D9E7D6] border-2 border-[#4A6B4E]/20 flex items-center justify-center text-[#4A6B4E] font-bold">
              L
            </div>
          </div>
        </header>
        
        <div className="p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

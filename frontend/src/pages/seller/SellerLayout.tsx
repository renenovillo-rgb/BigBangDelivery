import { Link, Outlet, useLocation } from 'react-router-dom';

export const SellerLayout = () => {
  const location = useLocation();

  // Datos simulados del perfil del vendedor
  const seller = {
    name: 'Alexis Sebastian Gómez',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Encabezado Principal / Navegación */}
      <header className="bg-teal-950 text-white shadow-md sticky top-0 z-40 border-b border-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Marca / Logotipo */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-white">Big Ban</span>
            <span className="text-[11px] font-semibold bg-emerald-800/80 text-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-600/40 uppercase tracking-wider">
              Panel Vendedor
            </span>
          </div>

          {/* Enlaces de Navegación Escritorio */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/vendedor/pedidos"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('/vendedor/pedidos')
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-teal-200 hover:bg-teal-900 hover:text-white'
              }`}
            >
              Solicitudes y Pedidos
            </Link>
            <Link
              to="/vendedor/productos"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('/vendedor/productos')
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-teal-200 hover:bg-teal-900 hover:text-white'
              }`}
            >
              Mis Productos
            </Link>
            <Link
              to="/vendedor/historias"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('/vendedor/historias')
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-teal-200 hover:bg-teal-900 hover:text-white'
              }`}
            >
              Solicitud Historias
            </Link>
          </nav>

          {/* Píldora del Perfil del Vendedor */}
          <Link
            to="/vendedor/perfil"
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
              isActive('/vendedor/perfil')
                ? 'bg-teal-900 border-emerald-500/60 ring-2 ring-emerald-500/30'
                : 'bg-teal-900/60 border-teal-800 hover:bg-teal-900 hover:border-teal-700'
            }`}
          >
            <img
              src={seller.avatarUrl}
              alt={seller.name}
              className="w-8 h-8 rounded-lg object-cover border border-emerald-400/40 shadow-xs"
            />
            <span className="text-xs font-medium text-teal-100 hidden sm:inline-block">
              {seller.name}
            </span>
          </Link>
        </div>

        {/* Menú de Navegación Secundario para Móviles */}
        <div className="md:hidden flex items-center justify-around bg-teal-900/90 border-t border-teal-800/80 px-2 py-2">
          <Link
            to="/vendedor/pedidos"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive('/vendedor/pedidos') ? 'bg-emerald-700 text-white' : 'text-teal-200'
            }`}
          >
            Pedidos
          </Link>
          <Link
            to="/vendedor/productos"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive('/vendedor/productos') ? 'bg-emerald-700 text-white' : 'text-teal-200'
            }`}
          >
            Productos
          </Link>
          <Link
            to="/vendedor/historias"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive('/vendedor/historias') ? 'bg-emerald-700 text-white' : 'text-teal-200'
            }`}
          >
            Historias
          </Link>
        </div>
      </header>

      {/* Área del Contenido Principal */}
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
    </div>
  );
};
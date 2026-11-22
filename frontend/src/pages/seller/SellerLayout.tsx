import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, BookOpen, Bell, LayoutDashboard, Menu, Package, Receipt, Settings, Store, UserRound, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSeller } from './sellerContext';
import { BrandInline, Container } from '../../components/ui';
import { ViewSwitcher } from '../../components/ViewSwitcher';

interface NavItem { to: string; label: string; icon: LucideIcon; badge?: number }

const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

const SECTION_TITLES: Record<string, string> = {
  resumen: 'Resumen',
  pedidos: 'Pedidos',
  productos: 'Productos y servicios',
  historias: 'Historias',
  ventas: 'Ventas y facturas',
  perfil: 'Mi perfil',
  ajustes: 'Ajustes',
};

export const SellerLayout = () => {
  const { profile, orders, storeOpen, setStoreOpen } = useSeller();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const pending = orders.filter((o) => o.estadoPedido === 'PENDIENTE').length;
  const current = SECTION_TITLES[pathname.split('/')[2] ?? 'resumen'] ?? 'Panel del vendedor';

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Principal',
      items: [
        { to: '/vendedor/resumen', label: 'Resumen', icon: LayoutDashboard },
        { to: '/vendedor/pedidos', label: 'Pedidos', icon: Receipt, badge: pending },
      ],
    },
    {
      title: 'Catálogo',
      items: [
        { to: '/vendedor/productos', label: 'Productos y servicios', icon: Package },
        { to: '/vendedor/historias', label: 'Historias', icon: BookOpen },
      ],
    },
    {
      title: 'Negocio',
      items: [
        { to: '/vendedor/ventas', label: 'Ventas y facturas', icon: BarChart3 },
        { to: '/vendedor/perfil', label: 'Mi perfil', icon: UserRound },
        { to: '/vendedor/ajustes', label: 'Ajustes', icon: Settings },
      ],
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // En móvil el menú se cierra al elegir una sección
  const closeOnMobile = () => { if (!isDesktop()) setSidebarOpen(false); };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isDesktop()) setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#F7F3E8]">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} aria-hidden="true" className="fixed inset-0 z-30 bg-[#2F3A2F]/45 backdrop-blur-[2px] lg:hidden" />
      )}

      <aside
        inert={!sidebarOpen}
        aria-label="Menú del vendedor"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:max-w-none lg:shrink-0 lg:self-start lg:shadow-none lg:ring-1 lg:ring-black/5 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <BrandInline />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F3E8] text-[#2F3A2F] transition active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Link to="/vendedor/perfil" onClick={closeOnMobile} className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-[#F7F3E8] p-3 transition hover:bg-[#DCE8D2]/60">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4F6F52] text-base font-bold text-[#F7F3E8]">
            {profile.nombreCompleto.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#2F3A2F]">{profile.nombreComercial ?? profile.nombreCompleto}</p>
            <p className="flex items-center gap-1.5 text-xs text-[#6B7A6B]">
              <span className={`h-2 w-2 rounded-full ${storeOpen ? 'bg-[#4F6F52]' : 'bg-[#B4533C]'}`} />
              {storeOpen ? 'Tienda abierta' : 'Tienda cerrada'}
            </p>
          </div>
        </Link>

        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-3">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6B7A6B]">{g.title}</p>
              {g.items.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeOnMobile}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${isActive ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'text-[#2F3A2F] hover:bg-[#DCE8D2]/60'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? 'bg-white/20' : 'bg-[#DCE8D2] text-[#4F6F52]'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {!!badge && (
                        <span className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${isActive ? 'bg-[#F7F3E8] text-[#4F6F52]' : 'bg-[#B4533C] text-white'}`}>
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#2F3A2F]/10 p-4">
          <Link
            to="/comprador"
            onClick={closeOnMobile}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-[#2F3A2F] transition hover:bg-[#DCE8D2]/60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DCE8D2] text-[#4F6F52]"><Store className="h-4 w-4" /></span>
            Ver como comprador
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-16">
        <header className="sticky top-0 z-20 bg-[#4F6F52] shadow-md shadow-[#4F6F52]/20">
          <Container className="flex items-center gap-3 py-3 md:py-4">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3E8]/15 transition active:scale-90"
            >
              <Menu className="h-5 w-5 text-[#F7F3E8]" />
            </button>

            <div className={`hidden md:block ${sidebarOpen ? 'lg:hidden' : ''}`}><BrandInline onDark /></div>
            <h1 className="min-w-0 truncate text-base font-bold text-[#F7F3E8] md:hidden lg:block lg:text-lg">{current}</h1>

            <button
              role="switch"
              aria-checked={storeOpen}
              onClick={() => setStoreOpen(!storeOpen)}
              className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-[#F7F3E8]/15 py-1.5 pl-3 pr-2 text-xs font-semibold text-[#F7F3E8] transition active:scale-95"
            >
              <span className="hidden sm:inline">{storeOpen ? 'Tienda abierta' : 'Tienda cerrada'}</span>
              <span className={`relative h-6 w-10 rounded-full transition ${storeOpen ? 'bg-[#DCE8D2]' : 'bg-[#2F3A2F]/40'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full shadow transition-all ${storeOpen ? 'left-[1.125rem] bg-[#4F6F52]' : 'left-0.5 bg-white'}`} />
              </span>
            </button>

            <Link
              to="/vendedor/pedidos"
              aria-label={pending ? `${pending} pedidos nuevos` : 'Pedidos'}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3E8]/15"
            >
              <Bell className="h-5 w-5 text-[#F7F3E8]" />
              {pending > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#F7F3E8] px-1 text-[11px] font-bold text-[#4F6F52]">
                  {pending}
                </span>
              )}
            </Link>
          </Container>
        </header>

        <Container className="pt-5 sm:pt-8">
          <Outlet />
        </Container>

        <footer className="mt-12 border-t border-[#2F3A2F]/10 py-6 text-center text-xs text-[#2F3A2F]/50">
          © Horizonte Sostenible · Panel del vendedor · Ecuador
        </footer>
      </div>

      <ViewSwitcher
        role="vendedor"
        title="Navegar pantallas"
        items={groups.flatMap((g) => g.items).map((i) => ({ id: i.to, label: i.label, icon: i.icon }))}
        activeId={`/vendedor/${pathname.split('/')[2] ?? 'resumen'}`}
        onSelect={(to) => navigate(to)}
      />
    </div>
  );
};


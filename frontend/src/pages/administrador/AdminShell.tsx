import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ClipboardCheck, CreditCard, LayoutDashboard, Layers, Menu, Receipt, ShieldCheck, Store, Users, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandInline, Container } from '../../components/ui';
import { ViewSwitcher } from '../../components/ViewSwitcher';
import { reviewQueue, usePlatform } from '../../platform/platformContext';
import { Avatar } from './parts';

interface NavItem { to: string; label: string; icon: LucideIcon; badge?: number }

const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

const SECTION_TITLES: Record<string, string> = {
  resumen: 'Resumen',
  aprobaciones: 'Aprobaciones',
  vendedores: 'Vendedores',
  pedidos: 'Pedidos',
  usuarios: 'Usuarios',
  categorias: 'Categorías',
  planes: 'Planes y suscripciones',
};

export const AdminShell = () => {
  const platform = usePlatform();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const q = reviewQueue(platform);
  const pending = q.products.length + q.stories.length + q.fiscal.length + q.profile.length + q.vendors.length;
  const section = pathname.split('/')[2] ?? 'resumen';

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Principal',
      items: [
        { to: '/administrador/resumen', label: 'Resumen', icon: LayoutDashboard },
        { to: '/administrador/aprobaciones', label: 'Aprobaciones', icon: ClipboardCheck, badge: pending },
      ],
    },
    {
      title: 'Gestión',
      items: [
        { to: '/administrador/vendedores', label: 'Vendedores', icon: Store },
        { to: '/administrador/pedidos', label: 'Pedidos', icon: Receipt },
        { to: '/administrador/usuarios', label: 'Usuarios', icon: Users },
      ],
    },
    {
      title: 'Plataforma',
      items: [
        { to: '/administrador/categorias', label: 'Categorías', icon: Layers },
        { to: '/administrador/planes', label: 'Planes y suscripciones', icon: CreditCard },
      ],
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

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
        aria-label="Menú del administrador"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:max-w-none lg:shrink-0 lg:self-start lg:shadow-none lg:ring-1 lg:ring-black/5 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <BrandInline subtitle="Administración" />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F3E8] text-[#2F3A2F] transition active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-[#F7F3E8] p-3">
          <Avatar name="Administrador" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#2F3A2F]">Administrador General</p>
            <p className="flex items-center gap-1.5 text-xs text-[#6B7A6B]"><ShieldCheck className="h-3.5 w-3.5" /> Acceso total</p>
          </div>
        </div>

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
        <header className="sticky top-0 z-20 bg-[#2F3A2F] shadow-md shadow-[#2F3A2F]/20">
          <Container className="flex items-center gap-3 py-3 md:py-4">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3E8]/15 transition active:scale-90"
            >
              <Menu className="h-5 w-5 text-[#F7F3E8]" />
            </button>

            <div className={`hidden md:block ${sidebarOpen ? 'lg:hidden' : ''}`}><BrandInline onDark subtitle="Administración" /></div>
            <h1 className="min-w-0 truncate text-base font-bold text-[#F7F3E8] md:hidden lg:block lg:text-lg">
              {pathname.split('/')[3] ? 'Detalle del vendedor' : SECTION_TITLES[section] ?? 'Administración'}
            </h1>

            <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-[#F7F3E8]/15 px-3 py-1.5 text-xs font-semibold text-[#F7F3E8] sm:flex">
              <ShieldCheck className="h-4 w-4" /> Administrador
            </span>

            <Link
              to="/administrador/aprobaciones"
              aria-label={pending ? `${pending} aprobaciones pendientes` : 'Aprobaciones'}
              className="relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3E8]/15 sm:ml-0"
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
          © Horizonte Sostenible · Panel de administración · Ecuador
        </footer>
      </div>

      <ViewSwitcher
        role="administrador"
        title="Navegar pantallas"
        items={groups.flatMap((g) => g.items).map((i) => ({ id: i.to, label: i.label, icon: i.icon }))}
        activeId={`/administrador/${section}`}
        onSelect={(to) => navigate(to)}
      />
    </div>
  );
};

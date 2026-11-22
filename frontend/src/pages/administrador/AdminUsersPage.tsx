import { useState } from 'react';
import { Mail, Phone, Search, Users, X } from 'lucide-react';
import type { EstadoUsuario, RolUsuario } from '../../types';
import { usePlatform } from '../../platform/platformContext';
import { Button, Card, Chip, EmptyState, PageHeading, Pill } from '../../components/ui';
import type { Tone } from '../../components/utils';
import { inputCls, prettyStamp } from '../../components/utils';
import { Avatar } from './parts';

type Filter = 'todos' | RolUsuario;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'comprador', label: 'Compradores' },
  { id: 'vendedor', label: 'Vendedores' },
  { id: 'administrador', label: 'Administradores' },
];

const ROLE: Record<RolUsuario, { label: string; tone: Tone }> = {
  comprador: { label: 'Comprador', tone: 'blue' },
  vendedor: { label: 'Vendedor', tone: 'green' },
  administrador: { label: 'Administrador', tone: 'gray' },
};

const STATUS: Record<EstadoUsuario, { label: string; tone: Tone }> = {
  activo: { label: 'Activo', tone: 'green' },
  inactivo: { label: 'Inactivo', tone: 'gray' },
  pendiente: { label: 'Pendiente', tone: 'amber' },
  suspendido: { label: 'Suspendido', tone: 'red' },
};

export const AdminUsersPage = () => {
  const { users, setUserStatus } = usePlatform();
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const list = users
    .filter((u) => filter === 'todos' || u.rol === filter)
    .filter((u) => !q || `${u.nombres} ${u.apellidos} ${u.email} ${u.numeroCedula}`.toLowerCase().includes(q));

  return (
    <div className="space-y-5">
      <PageHeading title="Usuarios" subtitle="Cuentas registradas en la plataforma. Suspende o reactiva el acceso cuando sea necesario." />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={f.id === 'todos' ? users.length : users.filter((u) => u.rol === f.id).length}>{f.label}</Chip>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#2F3A2F]/10 focus-within:ring-2 focus-within:ring-[#4F6F52] sm:max-w-md">
        <Search className="h-5 w-5 shrink-0 text-[#86A789]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca por nombre, correo o cédula…" aria-label="Buscar usuarios" className={inputCls} />
        {query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X className="h-4 w-4 text-[#2F3A2F]/50" /></button>}
      </div>

      {list.length ? (
        <div className="space-y-3">
          {list.map((u) => {
            const role = ROLE[u.rol];
            const st = STATUS[u.estado];
            const isAdmin = u.rol === 'administrador';
            return (
              <Card key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <Avatar name={u.nombres} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#2F3A2F]">{u.nombres} {u.apellidos}</p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-[#2F3A2F]/55">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {u.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {u.telefono}</span>
                    <span>Desde {prettyStamp(u.fechaCreacion)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={role.tone}>{role.label}</Pill>
                  <Pill tone={st.tone}>{st.label}</Pill>
                </div>
                {!isAdmin && (
                  u.estado === 'suspendido' || u.estado === 'inactivo' || u.estado === 'pendiente'
                    ? <Button size="sm" onClick={() => setUserStatus(u.id, 'activo')}>{u.estado === 'pendiente' ? 'Activar' : 'Reactivar'}</Button>
                    : <Button variant="danger" size="sm" onClick={() => setUserStatus(u.id, 'suspendido')}>Suspender</Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="No hay usuarios con estos filtros" text="Prueba con otro rol o cambia la búsqueda." />
      )}
    </div>
  );
};

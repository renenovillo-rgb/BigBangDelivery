import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SELLERS } from '../pages/buyer/catalog';
import { stamp } from '../components/utils';
import {
  INITIAL_CATEGORIES, INITIAL_FISCAL_REQUESTS, INITIAL_LOG, INITIAL_PLANS, INITIAL_PLATFORM_ORDERS,
  INITIAL_PLATFORM_PRODUCTS, INITIAL_PLATFORM_STORIES, INITIAL_PROFILE_REQUESTS, INITIAL_USERS, INITIAL_VENDORS,
} from './platformData';
import type { PublicProfileChanges, Vendor } from './platformData';
import { PlatformContext } from './platformContext';
import type { PlatformContextValue } from './platformContext';

const FISCAL_FIELD_LABEL = {
  telefono: 'teléfono',
  email: 'correo',
  identificacionFiscal: 'RUC / cédula',
  direccionNegocio: 'dirección fiscal',
  nombreComercial: 'nombre comercial',
} as const;

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [products, setProducts] = useState(INITIAL_PLATFORM_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_PLATFORM_ORDERS);
  const [stories, setStories] = useState(INITIAL_PLATFORM_STORIES);
  const [fiscalRequests, setFiscalRequests] = useState(INITIAL_FISCAL_REQUESTS);
  const [profileRequests, setProfileRequests] = useState(INITIAL_PROFILE_REQUESTS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [log, setLog] = useState(INITIAL_LOG);
  const [publicProfiles, setPublicProfiles] = useState<Record<string, PublicProfileChanges>>({});
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'error' } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify: PlatformContextValue['notify'] = (message, tone = 'ok') => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const addLog: PlatformContextValue['addLog'] = (texto, tono = 'ok') =>
    setLog((prev) => [{ id: `LOG-${Date.now()}-${prev.length}`, texto, fecha: stamp(new Date()), tono }, ...prev].slice(0, 30));

  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.nombreComercial ?? id;
  const patchVendor = (id: string, patch: Partial<Vendor>) =>
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const value: PlatformContextValue = {
    vendors, plans, products, orders, stories, fiscalRequests, profileRequests, users, categories, log, publicProfiles,
    notify, addLog,
    setProducts, setOrders, setStories, setFiscalRequests, setProfileRequests,

    setVendorStatus: (id, estado, motivo) => {
      const v = vendors.find((x) => x.id === id);
      if (!v) return;
      patchVendor(id, { estado, motivoSuspension: estado === 'suspendido' ? motivo : undefined });
      const verb = estado === 'aprobado' ? (v.estado === 'suspendido' ? 'reactivó' : 'aprobó') : 'suspendió';
      addLog(`Se ${verb} la tienda “${v.nombreComercial}”.`, estado === 'aprobado' ? 'ok' : 'error');
      notify(`Tienda ${estado === 'aprobado' ? 'aprobada' : 'suspendida'}: ${v.nombreComercial}.`);
    },

    setVendorPlan: (id, planId) => {
      const plan = plans.find((p) => p.id === planId);
      patchVendor(id, { planId });
      addLog(`Se asignó el ${plan?.nombre ?? 'plan'} a “${vendorName(id)}”.`);
      notify(`Plan actualizado: ${plan?.nombre}.`);
    },

    resolveFiscalRequest: (id, approve, respuesta) => {
      const req = fiscalRequests.find((r) => r.id === id);
      if (!req) return;
      setFiscalRequests((prev) => prev.map((r) => (r.id === id
        ? { ...r, estado: approve ? 'APROBADA' : 'RECHAZADA', respuestaAdmin: respuesta || undefined, fechaActualizacion: stamp(new Date()) }
        : r)));
      if (approve) patchVendor(req.vendedorId, { [req.campoAModificar]: req.nuevoValor });
      addLog(`Se ${approve ? 'aprobó' : 'rechazó'} el cambio de ${FISCAL_FIELD_LABEL[req.campoAModificar]} de “${vendorName(req.vendedorId)}”.`, approve ? 'ok' : 'warn');
      notify(approve ? 'Cambio aprobado y aplicado al vendedor.' : 'Solicitud rechazada.');
    },

    resolveProfileRequest: (id, approve, respuesta) => {
      const req = profileRequests.find((r) => r.id === id);
      const v = req && vendors.find((x) => x.id === req.vendedorId);
      if (!req || !v) return;
      setProfileRequests((prev) => prev.map((r) => (r.id === id ? { ...r, estado: approve ? 'APROBADA' : 'RECHAZADA', respuestaAdmin: respuesta || undefined } : r)));
      if (approve && v.catalogId) {
        setPublicProfiles((prev) => ({ ...prev, [v.catalogId!]: { ...prev[v.catalogId!], ...req.cambios } }));
      }
      addLog(`Se ${approve ? 'aprobó' : 'rechazó'} el cambio del perfil público de “${v.nombreComercial}”.`, approve ? 'ok' : 'warn');
      notify(approve ? 'Perfil actualizado: ya lo ven los compradores.' : 'Solicitud rechazada.');
    },

    reviewProduct: (id, approve, motivo) => {
      const p = products.find((x) => x.id === id);
      if (!p) return;
      setProducts((prev) => prev.map((x) => {
        if (x.id !== id) return x;
        if (!approve) return { ...x, estado: 'RECHAZADO', motivoRechazo: motivo };
        return { ...x, estado: x.tipo !== 'SERVICIO' && x.stock === 0 ? 'AGOTADO' : 'PUBLICADO', motivoRechazo: undefined };
      }));
      addLog(`Se ${approve ? 'aprobó' : 'rechazó'} “${p.nombre}”.`, approve ? 'ok' : 'warn');
      notify(approve ? `“${p.nombre}” ya está publicado.` : `“${p.nombre}” rechazado.`);
    },

    reviewStory: (id, approve, observacion) => {
      const s = stories.find((x) => x.id === id);
      if (!s) return;
      setStories((prev) => prev.map((x) => (x.id === id
        ? { ...x, estado: approve ? 'PUBLICADA' : 'RECHAZADA', observacionesAdmin: observacion || (approve ? 'Historia aprobada y publicada.' : undefined) }
        : x)));
      addLog(`Se ${approve ? 'publicó' : 'rechazó'} la historia ${s.codigoHistoria}.`, approve ? 'ok' : 'warn');
      notify(approve ? 'Historia publicada.' : 'Historia rechazada.');
    },

    cancelOrderByAdmin: (id, motivo) => {
      const o = orders.find((x) => x.id === id);
      if (!o) return;
      setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, estadoPedido: 'CANCELADO', motivoCancelacion: `Cancelado por administración: ${motivo}` } : x)));
      addLog(`Se canceló el pedido ${o.numeroPedido} por intervención de la administración.`, 'warn');
      notify(`Pedido ${o.numeroPedido} cancelado.`);
    },

    saveCategory: ({ id, nombre, descripcion }) => {
      const name = nombre.trim();
      if (!name) return false;
      if (categories.some((c) => c.id !== id && c.nombre.toLowerCase() === name.toLowerCase())) {
        notify('Ya existe una categoría con ese nombre.', 'error');
        return false;
      }
      if (id) {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, nombre: name, descripcion: descripcion.trim() } : c)));
      } else {
        const next = Math.max(0, ...categories.map((c) => Number(c.id.split('-')[1]) || 0)) + 1;
        setCategories((prev) => [...prev, { id: `CAT-${next}`, nombre: name, descripcion: descripcion.trim(), activa: true }]);
      }
      addLog(`Se ${id ? 'editó' : 'creó'} la categoría “${name}”.`);
      notify(id ? 'Categoría actualizada.' : 'Categoría creada.');
      return true;
    },

    toggleCategory: (id) => {
      const c = categories.find((x) => x.id === id);
      if (!c) return;
      setCategories((prev) => prev.map((x) => (x.id === id ? { ...x, activa: !x.activa } : x)));
      addLog(`Se ${c.activa ? 'desactivó' : 'activó'} la categoría “${c.nombre}”.`, c.activa ? 'warn' : 'ok');
    },

    deleteCategory: (id) => {
      const c = categories.find((x) => x.id === id);
      if (!c) return;
      setCategories((prev) => prev.filter((x) => x.id !== id));
      addLog(`Se eliminó la categoría “${c.nombre}”.`, 'warn');
      notify(`Categoría “${c.nombre}” eliminada.`);
    },

    savePlan: (plan) => {
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
      addLog(`Se actualizó el ${plan.nombre}.`);
      notify(`${plan.nombre} actualizado.`);
    },

    setUserStatus: (id, estado) => {
      const u = users.find((x) => x.id === id);
      if (!u) return;
      setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, estado } : x)));
      addLog(`Usuario ${u.nombres} ${u.apellidos}: ${estado}.`, estado === 'activo' ? 'ok' : 'warn');
      notify(`${u.nombres} ${u.apellidos} ahora está ${estado}.`);
    },

    publicSeller: (catalogId) => ({ ...SELLERS[catalogId], ...publicProfiles[catalogId] }),
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-[80] flex justify-center">
          <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#2F3A2F] px-4 py-3 text-sm font-semibold text-[#F7F3E8] shadow-2xl">
            {toast.tone === 'ok'
              ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#86A789]" />
              : <AlertCircle className="h-5 w-5 shrink-0 text-[#F2B5A3]" />}
            {toast.message}
          </div>
        </div>
      )}
    </PlatformContext.Provider>
  );
};

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Pedido, Producto, SolicitudActualizacionPerfil, SolicitudHistoriaProducto } from '../../types';
import {
  INITIAL_CHANGE_REQUESTS, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_PROFILE, INITIAL_SETTINGS,
  INITIAL_STORIES, PLAN, SUBSCRIPTION,
} from './sellerData';
import type { ProductForm, SellerSettings } from './sellerData';
import { SellerContext } from './sellerContext';
import type { ChangeField, SellerContextValue } from './sellerContext';
import { NEXT_ORDER_STEP, stamp } from './utils';

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const nextCode = (prefix: string, codes: string[]) => {
  const max = Math.max(0, ...codes.map((c) => Number(c.split('-')[1]) || 0));
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

/* Ajusta el stock y mantiene sincronizado el estado Publicado ↔ Agotado */
const withStock = (p: Producto, stock: number): Producto => {
  const safe = Math.max(0, stock);
  let { estado } = p;
  if (safe === 0 && estado === 'PUBLICADO') estado = 'AGOTADO';
  else if (safe > 0 && estado === 'AGOTADO') estado = 'PUBLICADO';
  return { ...p, stock: safe, estado };
};

/* Campos del formulario → producto. Los que no aplican al tipo se limpian. */
const fromForm = (f: ProductForm): Partial<Producto> => {
  const physical = f.tipo !== 'SERVICIO';
  const perishable = f.tipo === 'PERECIBLE';
  const categoriaNombre = f.categoriaNombre.trim() || 'General';
  return {
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim(),
    precio: f.precio,
    tipo: f.tipo,
    categoriaNombre,
    categoriaId: `cat-${slug(categoriaNombre)}`,
    imagenUrl: f.imagenUrl,
    unidadMedida: physical ? f.unidadMedida.trim() || 'unidad' : undefined,
    stock: physical ? f.stock : undefined,
    fechaCaducidad: perishable ? f.fechaCaducidad || undefined : undefined,
    condicionesAlmacenamiento: perishable ? f.condicionesAlmacenamiento.trim() || undefined : undefined,
    duracionServicio: physical ? undefined : f.duracionServicio.trim() || undefined,
    modalidadServicio: physical ? undefined : f.modalidadServicio,
    cuposDiarios: physical ? undefined : f.cuposDiarios,
  };
};

export const SellerProvider = ({ children }: { children: ReactNode }) => {
  const [profile] = useState(INITIAL_PROFILE);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [storeOpen, setStoreOpenState] = useState(true);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [changeRequests, setChangeRequests] = useState(INITIAL_CHANGE_REQUESTS);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'error' } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify: SellerContextValue['notify'] = (message, tone = 'ok') => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const patchOrder = (id: string, patch: Partial<Pedido>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, fechaActualizacion: stamp(new Date()) } : o)));

  /* Suma (o resta) las unidades de un pedido al inventario */
  const moveStock = (order: Pedido, sign: 1 | -1) =>
    setProducts((prev) =>
      prev.map((p) => {
        const qty = order.items.filter((i) => i.productoId === p.id).reduce((s, i) => s + i.cantidad, 0);
        return qty && p.stock !== undefined ? withStock(p, p.stock + sign * qty) : p;
      }),
    );

  const value: SellerContextValue = {
    profile,
    plan: PLAN,
    subscription: SUBSCRIPTION,
    settings,
    storeOpen,
    products,
    orders,
    stories,
    changeRequests,

    notify,

    setStoreOpen: (open) => {
      setStoreOpenState(open);
      notify(open ? 'Tu tienda está abierta: ya recibes pedidos.' : 'Tienda cerrada: no recibirás pedidos nuevos.');
    },

    updateSettings: (patch: Partial<SellerSettings>) => setSettings((s) => ({ ...s, ...patch })),

    confirmOrder: (id) => {
      const order = orders.find((o) => o.id === id);
      if (!order || order.estadoPedido !== 'PENDIENTE') return undefined;
      const last = Math.max(0, ...orders.map((o) => Number(o.numeroFactura?.split('-')[2]) || 0));
      const numeroFactura = `${profile.establecimiento}-${profile.puntoEmision}-${String(last + 1).padStart(9, '0')}`;
      patchOrder(id, { estadoPedido: 'CONFIRMADO', numeroFactura });
      moveStock(order, -1);
      notify(`Pedido ${order.numeroPedido} aceptado. Factura ${numeroFactura} emitida.`);
      return numeroFactura;
    },

    advanceOrder: (id) => {
      const order = orders.find((o) => o.id === id);
      const step = order && NEXT_ORDER_STEP[order.estadoPedido];
      if (!order || !step) return;
      patchOrder(id, {
        estadoPedido: step.next,
        ...(step.next === 'COMPLETADO' ? { estadoPago: 'pagado' as const } : {}),
      });
      notify(step.next === 'COMPLETADO' ? `Pedido ${order.numeroPedido} entregado.` : `Pedido ${order.numeroPedido}: ${step.label.toLowerCase()}.`);
    },

    cancelOrder: (id, motivo) => {
      const order = orders.find((o) => o.id === id);
      if (!order || order.estadoPedido === 'COMPLETADO' || order.estadoPedido === 'CANCELADO') return;
      // Si ya se había aceptado, el stock descontado vuelve al inventario
      if (order.numeroFactura) moveStock(order, 1);
      patchOrder(id, { estadoPedido: 'CANCELADO', motivoCancelacion: motivo });
      notify(`Pedido ${order.numeroPedido} cancelado.`);
    },

    saveProduct: (form, editingId, asDraft) => {
      const fields = fromForm(form);
      const estado = asDraft ? 'BORRADOR' : 'PENDIENTE_REVISION';

      if (editingId) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...fields, estado, motivoRechazo: undefined, fechaActualizacion: stamp(new Date()) }
              : p,
          ),
        );
      } else {
        if (products.length >= PLAN.limiteProductos) {
          notify(`Llegaste al límite de tu plan (${PLAN.limiteProductos} publicaciones).`, 'error');
          return false;
        }
        const created: Producto = {
          ...(fields as Producto),
          id: nextCode('PROD', products.map((p) => p.id)),
          tiendaId: 'store-1',
          vendedorId: profile.id,
          estado,
          fechaCreacion: stamp(new Date()),
        };
        setProducts((prev) => [created, ...prev]);
      }

      notify(asDraft ? 'Borrador guardado.' : 'Enviado a revisión. Te avisaremos cuando se publique.');
      return true;
    },

    deleteProduct: (id) => {
      const target = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (target) notify(`“${target.nombre}” eliminado.`);
    },

    togglePublished: (id) => {
      const target = products.find((p) => p.id === id);
      if (!target) return;
      const pausing = target.estado === 'PUBLICADO' || target.estado === 'AGOTADO';
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          if (pausing) return { ...p, estado: 'DESACTIVADO' };
          return p.stock === 0 ? { ...p, estado: 'AGOTADO' } : { ...p, estado: 'PUBLICADO' };
        }),
      );
      notify(pausing ? `“${target.nombre}” pausado: ya no se muestra a los compradores.` : `“${target.nombre}” visible de nuevo.`);
    },

    adjustStock: (id, delta) =>
      setProducts((prev) => prev.map((p) => (p.id === id && p.stock !== undefined ? withStock(p, p.stock + delta) : p))),

    addStory: (productId, historia, mediaUrl) => {
      const product = products.find((p) => p.id === productId);
      const created: SolicitudHistoriaProducto = {
        id: `HIS-${Date.now()}`,
        codigoHistoria: nextCode('HIS', stories.map((s) => s.codigoHistoria)),
        productoId: productId,
        nombreProducto: product?.nombre ?? 'Producto',
        vendedorId: profile.id,
        historiaPropuesta: historia.trim(),
        mediaUrl: mediaUrl.trim(),
        estado: 'EN_REVISION',
        fechaCreacion: stamp(new Date()),
      };
      setStories((prev) => [created, ...prev]);
      notify('Historia enviada a revisión del administrador.');
    },

    addChangeRequest: (campo: ChangeField, nuevoValor, justificacion) => {
      const current: Record<ChangeField, string> = {
        telefono: profile.telefono,
        email: profile.email,
        identificacionFiscal: profile.identificacionFiscal,
        direccionNegocio: profile.direccionNegocio,
        nombreComercial: profile.nombreComercial ?? 'No registrado',
      };
      const created: SolicitudActualizacionPerfil = {
        id: nextCode('REQ', changeRequests.map((r) => r.id)),
        vendedorId: profile.id,
        campoAModificar: campo,
        valorActual: current[campo],
        nuevoValor: nuevoValor.trim(),
        justificacion: justificacion.trim(),
        estado: 'PENDIENTE',
        fechaCreacion: stamp(new Date()),
      };
      setChangeRequests((prev) => [created, ...prev]);
      notify('Solicitud enviada. El administrador revisará el cambio.');
    },
  };

  return (
    <SellerContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-4 bottom-6 z-[80] flex justify-center"
        >
          <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#2F3A2F] px-4 py-3 text-sm font-semibold text-[#F7F3E8] shadow-2xl">
            {toast.tone === 'ok'
              ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#86A789]" />
              : <AlertCircle className="h-5 w-5 shrink-0 text-[#F2B5A3]" />}
            {toast.message}
          </div>
        </div>
      )}
    </SellerContext.Provider>
  );
};

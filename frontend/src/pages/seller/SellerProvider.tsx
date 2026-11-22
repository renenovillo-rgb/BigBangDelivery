import { useState } from 'react';
import type { ReactNode } from 'react';
import type { PerfilVendedor, Pedido, Producto, SolicitudActualizacionPerfil, SolicitudHistoriaProducto } from '../../types';
import { INITIAL_PROFILE, INITIAL_SETTINGS } from './sellerData';
import type { ProductForm, SellerSettings } from './sellerData';
import { SellerContext } from './sellerContext';
import type { ChangeField, SellerContextValue } from './sellerContext';
import { usePlatform } from '../../platform/platformContext';
import type { ProfileRequest, PublicProfileChanges } from '../../platform/platformData';
import { NEXT_ORDER_STEP, stamp } from '../../components/utils';

/* El panel del vendedor muestra la tienda SEL-001 de la plataforma compartida */
const SELLER_ID = 'SEL-001';
const STORE_ID = 'store-1';

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
  const platform = usePlatform();
  const { notify, setProducts, setOrders, setStories, setFiscalRequests, setProfileRequests } = platform;

  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [storeOpen, setStoreOpenState] = useState(true);

  // Vista del vendedor sobre los datos de la plataforma
  const vendor = platform.vendors.find((v) => v.id === SELLER_ID)!;
  const plan = platform.plans.find((p) => p.id === vendor.planId) ?? platform.plans[0];
  const profile: PerfilVendedor = {
    ...INITIAL_PROFILE,
    nombreCompleto: vendor.nombreCompleto,
    nombreComercial: vendor.nombreComercial,
    email: vendor.email,
    telefono: vendor.telefono,
    identificacionFiscal: vendor.identificacionFiscal,
    direccionNegocio: vendor.direccionNegocio,
    establecimiento: vendor.establecimiento,
    puntoEmision: vendor.puntoEmision,
  };
  const products = platform.products.filter((p) => p.tiendaId === STORE_ID);
  const orders = platform.orders.filter((o) => o.tiendaId === STORE_ID);
  const stories = platform.stories.filter((s) => s.vendedorId === SELLER_ID);
  const changeRequests = platform.fiscalRequests.filter((r) => r.vendedorId === SELLER_ID);
  const profileRequests = platform.profileRequests.filter((r) => r.vendedorId === SELLER_ID);

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
    plan,
    subscription: { id: 'SUB-001', tiendaId: STORE_ID, planId: plan.id, fechaInicio: vendor.fechaRegistro, fechaFin: vendor.suscripcionFin, estado: 'activa' },
    settings,
    storeOpen,
    products,
    orders,
    stories,
    changeRequests,
    profileRequests,
    publicProfile: vendor.catalogId ? platform.publicSeller(vendor.catalogId) : undefined,
    categories: platform.categories.filter((c) => c.activa).map((c) => c.nombre),

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
        if (products.length >= plan.limiteProductos) {
          notify(`Llegaste al límite de tu plan (${plan.limiteProductos} publicaciones).`, 'error');
          return false;
        }
        const created: Producto = {
          ...(fields as Producto),
          id: nextCode('PROD', platform.products.map((p) => p.id)),
          tiendaId: STORE_ID,
          vendedorId: SELLER_ID,
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
        codigoHistoria: nextCode('HIS', platform.stories.map((s) => s.codigoHistoria)),
        productoId: productId,
        nombreProducto: product?.nombre ?? 'Producto',
        vendedorId: SELLER_ID,
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
        id: nextCode('REQ', platform.fiscalRequests.map((r) => r.id)),
        vendedorId: SELLER_ID,
        campoAModificar: campo,
        valorActual: current[campo],
        nuevoValor: nuevoValor.trim(),
        justificacion: justificacion.trim(),
        estado: 'PENDIENTE',
        fechaCreacion: stamp(new Date()),
      };
      setFiscalRequests((prev) => [created, ...prev]);
      platform.addLog(`${vendor.nombreComercial} solicitó cambiar su ${campo === 'identificacionFiscal' ? 'RUC' : campo}.`, 'warn');
      notify('Solicitud enviada. El administrador revisará el cambio.');
    },

    addProfileRequest: (cambios: PublicProfileChanges, justificacion: string) => {
      const created: ProfileRequest = {
        id: nextCode('PUB', platform.profileRequests.map((r) => r.id)),
        vendedorId: SELLER_ID,
        cambios,
        justificacion: justificacion.trim(),
        estado: 'PENDIENTE',
        fechaCreacion: stamp(new Date()),
      };
      setProfileRequests((prev) => [created, ...prev]);
      platform.addLog(`${vendor.nombreComercial} solicitó cambios en su perfil público.`, 'warn');
      notify('Solicitud enviada. Cuando el administrador la apruebe, los compradores verán tu nuevo perfil.');
    },
  };

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
};

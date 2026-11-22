import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  AlertTriangle, CalendarClock, EyeOff, Eye, ImagePlus, LayoutGrid, Minus, Package, Pencil, Plus,
  Search, Trash2, Wrench, X,
} from 'lucide-react';
import type { EstadoProducto, ModalidadServicio, Producto, TipoItem } from '../../types';
import { EMPTY_PRODUCT_FORM } from './sellerData';
import type { ProductForm } from './sellerData';
import { isLowStock, useSeller } from './sellerContext';
import { Button, Card, Chip, ConfirmModal, EmptyState, Field, Modal, PageHeading, Pill, ProductThumb } from './ui';
import { ITEM_TYPE, PRODUCT_STATUS, dateKey, daysUntil, inputCls, money } from './utils';

type TypeFilter = 'TODOS' | TipoItem;
type StatusFilter = 'TODOS' | 'PUBLICADOS' | 'EN_REVISION' | 'BORRADORES' | 'RECHAZADOS' | 'PAUSADOS';

const TYPE_FILTERS: { id: TypeFilter; label: string; icon: typeof Package }[] = [
  { id: 'TODOS', label: 'Todo', icon: LayoutGrid },
  { id: 'PERECIBLE', label: 'Perecibles', icon: Package },
  { id: 'NO_PERECIBLE', label: 'No perecibles', icon: Package },
  { id: 'SERVICIO', label: 'Servicios', icon: Wrench },
];

const STATUS_FILTERS: { id: StatusFilter; label: string; match: EstadoProducto[] }[] = [
  { id: 'TODOS', label: 'Todos', match: [] },
  { id: 'PUBLICADOS', label: 'Publicados', match: ['PUBLICADO'] },
  { id: 'EN_REVISION', label: 'En revisión', match: ['PENDIENTE_REVISION'] },
  { id: 'BORRADORES', label: 'Borradores', match: ['BORRADOR'] },
  { id: 'RECHAZADOS', label: 'Rechazados', match: ['RECHAZADO'] },
  { id: 'PAUSADOS', label: 'Pausados / agotados', match: ['DESACTIVADO', 'AGOTADO'] },
];

const UNITS = ['unidad', 'kg', 'libra', 'litro', 'frasco', 'atado', 'canasta', 'docena'];
const CATEGORY_HINTS = ['Alimentos', 'Lácteos', 'Hortalizas', 'Frutas', 'Bebidas', 'Artesanías', 'Servicios'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const typeBtn = (active: boolean) =>
  `rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-[#4F6F52] text-[#F7F3E8] shadow-md' : 'bg-white text-[#2F3A2F] ring-1 ring-black/10 hover:ring-[#4F6F52]/50'}`;

const toForm = (p: Producto): ProductForm => ({
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio,
  categoriaNombre: p.categoriaNombre ?? '',
  tipo: p.tipo,
  unidadMedida: p.unidadMedida ?? 'unidad',
  stock: p.stock ?? 0,
  fechaCaducidad: p.fechaCaducidad ?? '',
  condicionesAlmacenamiento: p.condicionesAlmacenamiento ?? '',
  duracionServicio: p.duracionServicio ?? '',
  modalidadServicio: p.modalidadServicio ?? 'PRESENCIAL',
  cuposDiarios: p.cuposDiarios ?? 1,
  imagenUrl: p.imagenUrl,
});

type Errors = Partial<Record<keyof ProductForm, string>>;

const validate = (f: ProductForm, asDraft: boolean): Errors => {
  const e: Errors = {};
  if (f.nombre.trim().length < 3) e.nombre = 'Escribe un nombre de al menos 3 caracteres.';
  if (asDraft) return e;
  if (f.descripcion.trim().length < 10) e.descripcion = 'Describe el producto en al menos 10 caracteres.';
  if (!(f.precio > 0)) e.precio = 'El precio debe ser mayor a $0.';
  if (f.tipo === 'PERECIBLE') {
    if (!f.fechaCaducidad) e.fechaCaducidad = 'Indica la fecha de caducidad.';
    else if (daysUntil(f.fechaCaducidad) < 0) e.fechaCaducidad = 'La fecha ya pasó.';
  }
  if (f.tipo === 'SERVICIO' && !f.duracionServicio.trim()) e.duracionServicio = 'Indica la duración estimada.';
  return e;
};

export const SellerProductsPage = () => {
  const { products, plan, settings, saveProduct, deleteProduct, togglePublished, adjustStock, notify } = useSeller();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('TODOS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [query, setQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [toDelete, setToDelete] = useState<Producto | null>(null);

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const atLimit = products.length >= plan.limiteProductos;
  const editing = editingId ? products.find((p) => p.id === editingId) : undefined;

  const openCreate = () => {
    if (atLimit) {
      notify(`Llegaste al límite de tu plan (${plan.limiteProductos} publicaciones).`, 'error');
      return;
    }
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditingId(p.id);
    setForm(toForm(p));
    setErrors({});
    setFormOpen(true);
  };

  const submit = (asDraft: boolean) => {
    const found = validate(form, asDraft);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (saveProduct(form, editingId, asDraft)) setFormOpen(false);
  };

  const onImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Selecciona un archivo de imagen.', 'error'); return; }
    if (file.size > MAX_IMAGE_BYTES) { notify('La imagen supera los 2 MB. Elige una más liviana.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => set('imagenUrl', String(reader.result));
    reader.readAsDataURL(file);
  };

  const q = query.trim().toLowerCase();
  const statusMatch = STATUS_FILTERS.find((s) => s.id === statusFilter)!.match;
  const byType = products.filter((p) => typeFilter === 'TODOS' || p.tipo === typeFilter);
  const list = byType
    .filter((p) => statusFilter === 'TODOS' || statusMatch.includes(p.estado))
    .filter((p) => !q || `${p.nombre} ${p.categoriaNombre ?? ''}`.toLowerCase().includes(q));
  const statusCount = (s: (typeof STATUS_FILTERS)[number]) => (s.id === 'TODOS' ? byType.length : byType.filter((p) => s.match.includes(p.estado)).length);

  const physical = form.tipo !== 'SERVICIO';

  return (
    <div className="space-y-5">
      <PageHeading
        title="Productos y servicios"
        subtitle={`${products.length} de ${plan.limiteProductos} publicaciones de tu ${plan.nombre}. Los cambios pasan por revisión antes de mostrarse.`}
        action={<Button onClick={openCreate}><Plus className="h-5 w-5" /> Nuevo producto o servicio</Button>}
      />

      <div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
          {TYPE_FILTERS.map((t) => (
            <Chip key={t.id} active={typeFilter === t.id} onClick={() => setTypeFilter(t.id)}>
              <t.icon className="h-4 w-4" /> {t.label}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 mt-2.5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:rounded-2xl sm:bg-white/60 sm:p-2.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              aria-pressed={statusFilter === s.id}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${statusFilter === s.id ? 'bg-[#4F6F52] text-[#F7F3E8]' : 'bg-[#DCE8D2]/60 text-[#3E5C41] hover:bg-[#DCE8D2]'}`}
            >
              {s.label} <span className="opacity-70">· {statusCount(s)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#2F3A2F]/10 focus-within:ring-2 focus-within:ring-[#4F6F52] sm:max-w-md">
        <Search className="h-5 w-5 shrink-0 text-[#86A789]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca por nombre o categoría…" aria-label="Buscar productos" className={inputCls} />
        {query && <button onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X className="h-4 w-4 text-[#2F3A2F]/50" /></button>}
      </div>

      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {list.map((p) => {
            const st = PRODUCT_STATUS[p.estado];
            const type = ITEM_TYPE[p.tipo];
            const days = p.fechaCaducidad ? daysUntil(p.fechaCaducidad) : null;
            const live = p.estado === 'PUBLICADO' || p.estado === 'AGOTADO';
            const low = isLowStock(p, settings.stockMinimo);
            return (
              <Card key={p.id} className="flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative h-40">
                  <ProductThumb key={p.imagenUrl} src={p.imagenUrl} name={p.nombre} tipo={p.tipo} className="h-full w-full" />
                  <span className="absolute left-2.5 top-2.5"><Pill tone={type.tone} className="shadow-sm">{type.label}</Pill></span>
                  <span className="absolute right-2.5 top-2.5"><Pill tone={st.tone} className="shadow-sm">{st.label}</Pill></span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug text-[#2F3A2F]">{p.nombre}</h3>
                  <p className="mt-0.5 text-xs font-medium text-[#4F6F52]">{p.categoriaNombre || 'General'}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#2F3A2F]/60">{p.descripcion}</p>

                  {p.estado === 'RECHAZADO' && p.motivoRechazo && (
                    <p className="mt-3 flex gap-2 rounded-2xl bg-[#F2D9D0]/70 p-3 text-xs leading-snug text-[#7A3322]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {p.motivoRechazo}
                    </p>
                  )}
                  {days !== null && days <= 7 && p.estado !== 'RECHAZADO' && (
                    <p className={`mt-3 flex items-center gap-2 rounded-2xl p-2.5 text-xs font-semibold ${days <= 2 ? 'bg-[#F2D9D0]/70 text-[#7A3322]' : 'bg-[#F8EBC2]/70 text-[#6B5410]'}`}>
                      <CalendarClock className="h-4 w-4 shrink-0" />
                      {days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : `Vence en ${days} día${days === 1 ? '' : 's'}`}
                    </p>
                  )}

                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <span className="text-lg font-extrabold text-[#4F6F52]">
                      {money(p.precio)}
                      {p.unidadMedida && <span className="text-[11px] font-medium text-[#2F3A2F]/45"> / {p.unidadMedida}</span>}
                    </span>

                    {p.tipo === 'SERVICIO' ? (
                      <Pill tone="blue">{p.cuposDiarios ?? 1} cupos/día</Pill>
                    ) : (
                      <div className="flex items-center gap-1.5" role="group" aria-label={`Stock de ${p.nombre}`}>
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          disabled={(p.stock ?? 0) === 0}
                          aria-label="Restar una unidad"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F3E8] text-[#2F3A2F] ring-1 ring-black/10 transition active:scale-90 disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className={`min-w-[2.5rem] text-center text-sm font-extrabold ${low ? 'text-[#B4533C]' : 'text-[#2F3A2F]'}`}>
                          {p.stock ?? 0}
                        </span>
                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          aria-label="Sumar una unidad"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F6F52] text-[#F7F3E8] transition active:scale-90"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {p.tipo !== 'SERVICIO' && low && <p className="mt-1.5 text-right text-[11px] font-semibold text-[#B4533C]">Stock bajo</p>}

                  <div className="mt-4 flex items-center gap-2 border-t border-[#2F3A2F]/10 pt-3">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /> Editar</Button>
                    {(live || p.estado === 'DESACTIVADO') && (
                      <Button variant="secondary" size="sm" onClick={() => togglePublished(p.id)} aria-label={live ? 'Pausar publicación' : 'Reactivar publicación'} title={live ? 'Pausar' : 'Reactivar'}>
                        {live ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => setToDelete(p)} aria-label={`Eliminar ${p.nombre}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={q || typeFilter !== 'TODOS' || statusFilter !== 'TODOS' ? 'No hay resultados con estos filtros' : 'Aún no tienes publicaciones'}
          text="Publica tu primer producto o servicio para empezar a vender."
          action={<Button onClick={openCreate}><Plus className="h-5 w-5" /> Nuevo producto o servicio</Button>}
        />
      )}

      {formOpen && (
        <Modal
          wide
          onClose={() => setFormOpen(false)}
          title={editing ? 'Editar publicación' : 'Nueva publicación'}
          subtitle={editing?.estado === 'PUBLICADO'
            ? 'Al guardar, volverá a revisión y se pausará hasta que el administrador la apruebe.'
            : 'El administrador la revisará antes de mostrarla a los compradores.'}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button variant="secondary" onClick={() => submit(true)}>Guardar borrador</Button>
              <Button type="submit" form="product-form">{editing ? 'Guardar y enviar a revisión' : 'Enviar a revisión'}</Button>
            </>
          )}
        >
          <form
            id="product-form"
            noValidate
            onSubmit={(e: FormEvent) => { e.preventDefault(); submit(false); }}
            className="space-y-4 pb-3"
          >
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">Tipo de publicación</p>
              <div className="grid grid-cols-3 gap-2.5">
                {(['PERECIBLE', 'NO_PERECIBLE', 'SERVICIO'] as TipoItem[]).map((t) => (
                  <button key={t} type="button" aria-pressed={form.tipo === t} onClick={() => set('tipo', t)} className={typeBtn(form.tipo === t)}>
                    {ITEM_TYPE[t].label}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Nombre" error={errors.nombre}>
              <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Miel de abeja 500g" className={inputCls} />
            </Field>

            <Field label="Descripción" error={errors.descripcion}>
              <textarea rows={3} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Cuéntales a tus compradores qué ofreces…" className={`${inputCls} resize-none`} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Precio ($)" error={errors.precio}>
                <input type="number" inputMode="decimal" step="0.01" min="0" value={form.precio || ''} onChange={(e) => set('precio', parseFloat(e.target.value) || 0)} className={inputCls} />
              </Field>
              <Field label="Categoría">
                <input list="seller-categories" value={form.categoriaNombre} onChange={(e) => set('categoriaNombre', e.target.value)} placeholder="Ej: Lácteos" className={inputCls} />
                <datalist id="seller-categories">{CATEGORY_HINTS.map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              {physical && (
                <Field label="Unidad de medida">
                  <input list="seller-units" value={form.unidadMedida} onChange={(e) => set('unidadMedida', e.target.value)} className={inputCls} />
                  <datalist id="seller-units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
                </Field>
              )}
            </div>

            {physical && (
              <div className={`grid gap-4 ${form.tipo === 'PERECIBLE' ? 'sm:grid-cols-2' : 'sm:max-w-[calc(50%-0.5rem)]'}`}>
                <Field label="Stock disponible">
                  <input type="number" inputMode="numeric" min="0" value={form.stock || ''} onChange={(e) => set('stock', parseInt(e.target.value, 10) || 0)} placeholder="0" className={inputCls} />
                </Field>
                {form.tipo === 'PERECIBLE' && (
                  <Field label="Fecha de caducidad" error={errors.fechaCaducidad}>
                    <input type="date" min={dateKey(new Date())} value={form.fechaCaducidad} onChange={(e) => set('fechaCaducidad', e.target.value)} className={inputCls} />
                  </Field>
                )}
              </div>
            )}

            {form.tipo === 'PERECIBLE' && (
              <Field label="Condiciones de conservación" hint="Ej: refrigerado a 4 °C, lejos de la luz del sol.">
                <input value={form.condicionesAlmacenamiento} onChange={(e) => set('condicionesAlmacenamiento', e.target.value)} className={inputCls} />
              </Field>
            )}

            {form.tipo === 'SERVICIO' && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Duración estimada" error={errors.duracionServicio}>
                  <input value={form.duracionServicio} onChange={(e) => set('duracionServicio', e.target.value)} placeholder="Ej: 2 horas" className={inputCls} />
                </Field>
                <Field label="Modalidad">
                  <select value={form.modalidadServicio} onChange={(e) => set('modalidadServicio', e.target.value as ModalidadServicio)} className={inputCls}>
                    <option value="PRESENCIAL">Presencial (en local)</option>
                    <option value="A_DOMICILIO">A domicilio</option>
                    <option value="VIRTUAL">Virtual</option>
                  </select>
                </Field>
                <Field label="Cupos por día">
                  <input type="number" inputMode="numeric" min="1" value={form.cuposDiarios || ''} onChange={(e) => set('cuposDiarios', parseInt(e.target.value, 10) || 1)} className={inputCls} />
                </Field>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6B7A6B]">Imagen</p>
              <div className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-[#2F3A2F]/10">
                <ProductThumb key={form.imagenUrl} src={form.imagenUrl} name="Vista previa" tipo={form.tipo} className="h-20 w-20 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="url"
                    value={form.imagenUrl.startsWith('data:') ? '' : form.imagenUrl}
                    onChange={(e) => set('imagenUrl', e.target.value)}
                    placeholder={form.imagenUrl.startsWith('data:') ? 'Imagen cargada desde tu dispositivo' : 'Pega un enlace https://…'}
                    aria-label="Enlace de la imagen"
                    className={`${inputCls} rounded-xl bg-[#F7F3E8] px-3 py-2 text-sm`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#DCE8D2]/70 px-3 py-1.5 text-[13px] font-semibold text-[#3E5C41] transition hover:bg-[#DCE8D2]">
                      <ImagePlus className="h-4 w-4" /> Subir foto
                      <input type="file" accept="image/*" onChange={onImageFile} className="sr-only" />
                    </label>
                    {form.imagenUrl && (
                      <button type="button" onClick={() => set('imagenUrl', '')} className="text-[13px] font-semibold text-[#B4533C]">Quitar</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmModal
          title="Eliminar publicación"
          text={`¿Seguro que quieres eliminar “${toDelete.nombre}”? Esta acción no se puede deshacer. Si solo quieres dejar de venderlo por un tiempo, pausa la publicación.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => deleteProduct(toDelete.id)}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
};

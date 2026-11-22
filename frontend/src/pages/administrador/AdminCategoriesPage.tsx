import { useState } from 'react';
import type { FormEvent } from 'react';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Categoria } from '../../types';
import { usePlatform } from '../../platform/platformContext';
import { Button, Card, ConfirmModal, EmptyState, Field, Modal, PageHeading, Pill, Switch } from '../../components/ui';
import { inputCls } from '../../components/utils';

export const AdminCategoriesPage = () => {
  const { categories, products, saveCategory, toggleCategory, deleteCategory, notify } = usePlatform();

  const [editing, setEditing] = useState<Categoria | 'new' | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<Categoria | null>(null);

  const usage = (c: Categoria) => products.filter((p) => p.categoriaNombre?.toLowerCase() === c.nombre.toLowerCase()).length;

  const open = (c: Categoria | 'new') => {
    setEditing(c);
    setNombre(c === 'new' ? '' : c.nombre);
    setDescripcion(c === 'new' ? '' : c.descripcion ?? '');
    setError('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres.'); return; }
    const id = editing && editing !== 'new' ? editing.id : undefined;
    if (saveCategory({ id, nombre, descripcion })) setEditing(null);
  };

  const askDelete = (c: Categoria) => {
    const n = usage(c);
    if (n > 0) { notify(`“${c.nombre}” tiene ${n} publicación${n === 1 ? '' : 'es'}. Desactívala en lugar de eliminarla.`, 'error'); return; }
    setToDelete(c);
  };

  return (
    <div className="space-y-5">
      <PageHeading
        title="Categorías"
        subtitle="Define las categorías que los vendedores pueden usar al publicar. Las desactivadas no aparecen como sugerencia."
        action={<Button onClick={() => open('new')}><Plus className="h-5 w-5" /> Nueva categoría</Button>}
      />

      {categories.length ? (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => {
            const n = usage(c);
            return (
              <Card key={c.id} className={`flex flex-col p-5 ${c.activa ? '' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DCE8D2] text-[#4F6F52]"><Layers className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold text-[#2F3A2F]">{c.nombre}</p>
                    <p className="text-xs text-[#2F3A2F]/55">{n} publicación{n === 1 ? '' : 'es'}</p>
                  </div>
                  <Switch checked={c.activa} onChange={() => toggleCategory(c.id)} label={`${c.activa ? 'Desactivar' : 'Activar'} ${c.nombre}`} />
                </div>
                <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[#2F3A2F]/65">{c.descripcion || 'Sin descripción.'}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-[#2F3A2F]/10 pt-3">
                  {!c.activa && <Pill tone="gray">Inactiva</Pill>}
                  <span className="flex-1" />
                  <Button variant="secondary" size="sm" onClick={() => open(c)}><Pencil className="h-4 w-4" /> Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => askDelete(c)} aria-label={`Eliminar ${c.nombre}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Layers} title="Aún no hay categorías" action={<Button onClick={() => open('new')}><Plus className="h-5 w-5" /> Nueva categoría</Button>} />
      )}

      {editing && (
        <Modal
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Nueva categoría' : 'Editar categoría'}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="submit" form="category-form">{editing === 'new' ? 'Crear' : 'Guardar'}</Button>
            </>
          )}
        >
          <form id="category-form" noValidate onSubmit={submit} className="space-y-4 pb-3">
            <Field label="Nombre" error={error || undefined}>
              <input value={nombre} onChange={(e) => { setNombre(e.target.value); setError(''); }} placeholder="Ej: Bebidas" className={inputCls} />
            </Field>
            <Field label="Descripción (opcional)">
              <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="¿Qué se publica en esta categoría?" className={`${inputCls} resize-none`} />
            </Field>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmModal
          title="Eliminar categoría"
          text={`¿Eliminar “${toDelete.nombre}”? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => deleteCategory(toDelete.id)}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
};

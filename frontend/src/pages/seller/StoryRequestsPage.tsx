import { useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Paperclip, Plus } from 'lucide-react';
import type { SolicitudHistoriaProducto } from '../../types';
import { useSeller } from './sellerContext';
import { Button, Card, EmptyState, Field, Modal, PageHeading, Pill } from '../../components/ui';
import { STORY_STATUS, inputCls, prettyStamp } from '../../components/utils';

const MIN_STORY = 40;

const FeedbackBox = ({ story }: { story: SolicitudHistoriaProducto }) => {
  if (!story.observacionesAdmin) return null;
  const rejected = story.estado === 'RECHAZADA';
  return (
    <div className={`rounded-2xl p-3.5 text-xs leading-relaxed ${rejected ? 'bg-[#F2D9D0]/70 text-[#7A3322]' : 'bg-[#DCE8D2]/70 text-[#3E5C41]'}`}>
      <b className="mb-0.5 block text-[11px] uppercase tracking-wide">{rejected ? 'Motivo del rechazo' : 'Mensaje del administrador'}</b>
      {story.observacionesAdmin}
    </div>
  );
};

export const SellerStoriesPage = () => {
  const { stories, products, addStory } = useSeller();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<SolicitudHistoriaProducto | null>(null);
  const [productId, setProductId] = useState('');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState('');

  // Solo se pueden contar historias de publicaciones que ya están visibles
  const eligible = products.filter((p) => p.estado === 'PUBLICADO' || p.estado === 'AGOTADO');

  const openForm = () => {
    setProductId(eligible[0]?.id ?? '');
    setText('');
    setMediaUrl('');
    setError('');
    setFormOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!productId) { setError('Elige el producto o servicio de tu historia.'); return; }
    if (text.trim().length < MIN_STORY) { setError(`Cuenta un poco más: escribe al menos ${MIN_STORY} caracteres.`); return; }
    addStory(productId, text, mediaUrl);
    setFormOpen(false);
  };

  const sorted = [...stories].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  return (
    <div className="space-y-5">
      <PageHeading
        title="Historias de productos"
        subtitle="Cuenta el origen y el proceso de lo que vendes. El administrador las revisa antes de destacarlas en la portada."
        action={<Button onClick={openForm}><Plus className="h-5 w-5" /> Nueva historia</Button>}
      />

      {sorted.length ? (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s) => {
            const st = STORY_STATUS[s.estado];
            return (
              <Card key={s.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-[#4F6F52]">{s.codigoHistoria}</span>
                    <h3 className="mt-0.5 truncate text-[15px] font-bold text-[#2F3A2F]">{s.nombreProducto}</h3>
                    <p className="text-xs text-[#2F3A2F]/50">Enviada el {prettyStamp(s.fechaCreacion)}</p>
                  </div>
                  <Pill tone={st.tone}>{st.label}</Pill>
                </div>

                <p className="mt-3 line-clamp-4 rounded-2xl bg-[#F7F3E8] p-3.5 text-[13px] italic leading-relaxed text-[#2F3A2F]/80">“{s.historiaPropuesta}”</p>

                <div className="mt-3 space-y-3">
                  <FeedbackBox story={s} />
                  {s.mediaUrl && (
                    <a href={s.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F6F52] hover:underline">
                      <Paperclip className="h-3.5 w-3.5" /> Ver material adjunto
                    </a>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelected(s)}>Ver detalle completo</Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Aún no has enviado historias"
          text="Una buena historia ayuda a que los compradores conecten con tu producto."
          action={<Button onClick={openForm}><Plus className="h-5 w-5" /> Nueva historia</Button>}
        />
      )}

      {formOpen && (
        <Modal
          onClose={() => setFormOpen(false)}
          title="Nueva historia"
          subtitle="Se enviará al administrador para su revisión."
          footer={(
            <>
              <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" form="story-form" disabled={!eligible.length}>Enviar a revisión</Button>
            </>
          )}
        >
          {eligible.length ? (
            <form id="story-form" noValidate onSubmit={submit} className="space-y-4 pb-3">
              <Field label="Producto o servicio">
                <select value={productId} onChange={(e) => { setProductId(e.target.value); setError(''); }} className={inputCls}>
                  {eligible.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </Field>
              <Field label="Tu historia" hint={`${text.trim().length}/${MIN_STORY} caracteres mínimos`} error={error || undefined}>
                <textarea
                  rows={5}
                  value={text}
                  onChange={(e) => { setText(e.target.value); setError(''); }}
                  placeholder="Describe el origen, quiénes lo elaboran, la tradición familiar o el valor orgánico de este producto…"
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <Field label="Foto o video (opcional)">
                <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://ejemplo.com/foto-del-proceso.jpg" className={inputCls} />
              </Field>
            </form>
          ) : (
            <p className="pb-3 text-sm text-[#2F3A2F]/70">
              Necesitas al menos un producto o servicio publicado para postular una historia. Cuando el administrador apruebe uno, podrás contarlo aquí.
            </p>
          )}
        </Modal>
      )}

      {selected && (
        <Modal
          onClose={() => setSelected(null)}
          title={`Historia ${selected.codigoHistoria}`}
          subtitle={`${selected.nombreProducto} · enviada el ${prettyStamp(selected.fechaCreacion)}`}
          footer={<Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button>}
        >
          <div className="space-y-4 pb-3">
            <Pill tone={STORY_STATUS[selected.estado].tone}>{STORY_STATUS[selected.estado].label}</Pill>
            <p className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-[#2F3A2F]/85 ring-1 ring-black/5">{selected.historiaPropuesta}</p>
            <FeedbackBox story={selected} />
            {selected.mediaUrl && (
              <a href={selected.mediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F6F52] hover:underline">
                <Paperclip className="h-4 w-4" /> Ver material adjunto
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

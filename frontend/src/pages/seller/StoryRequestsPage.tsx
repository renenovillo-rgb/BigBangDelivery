import { useState } from 'react';
import { type ProductStoryRequest, StoryStatus } from '../../types/story';

// Datos de prueba alineados con los 3 estados oficiales de StoryStatus
const INITIAL_STORY_REQUESTS: ProductStoryRequest[] = [
  {
    id: '1',
    storyCode: 'HIS-001',
    productId: 'PROD-001',
    productName: 'Miel Artesanal 500g',
    sellerId: 'SEL-001',
    proposedStory:
      'Esta miel se extrae de colmenas ubicadas en los valles altoandinos. Las familias apicultoras locales mantienen un proceso 100% orgánico sin refinados artificiales, preservando el ecosistema de abejas nativas.',
    mediaUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38',
    status: StoryStatus.PUBLISHED,
    adminFeedback: '¡Excelente narrativa! Ya está publicada en la sección destacada de la tienda.',
    createdAt: '2026-10-20 14:30',
  },
  {
    id: '2',
    storyCode: 'HIS-002',
    productId: 'PROD-002',
    productName: 'Queso Andino Madurado',
    sellerId: 'SEL-001',
    proposedStory:
      'Producido con leche de vacas alimentadas solo con pasto natural en zonas altas de Cuenca. Su maduración artesanal de 60 días le otorga un sabor único.',
    mediaUrl: '',
    status: StoryStatus.IN_REVIEW,
    createdAt: '2026-10-25 09:15',
  },
  {
    id: '3',
    storyCode: 'HIS-003',
    productId: 'PROD-003',
    productName: 'Asesoría en Huertos Urbanos',
    sellerId: 'SEL-001',
    proposedStory: 'Enseñamos a cultivar alimentos en espacios reducidos de la ciudad.',
    mediaUrl: '',
    status: StoryStatus.REJECTED,
    adminFeedback:
      'La historia es muy corta. Por favor amplía la descripción indicando la experiencia de los instructores y fotos del proceso.',
    createdAt: '2026-10-18 11:00',
  },
];

const MY_PRODUCTS = [
  { id: 'PROD-001', name: 'Miel Artesanal 500g' },
  { id: 'PROD-002', name: 'Queso Andino Madurado' },
  { id: 'PROD-003', name: 'Asesoría en Huertos Urbanos' },
];

export const SellerStoriesPage = () => {
  const [requests, setRequests] = useState<ProductStoryRequest[]>(INITIAL_STORY_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProductStoryRequest | null>(null);

  // Formulario nueva postulación
  const [newStory, setNewStory] = useState({
    productId: MY_PRODUCTS[0].id,
    proposedStory: '',
    mediaUrl: '',
  });

  // Enviar nuevo borrador
  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.proposedStory.trim()) {
      alert('Por favor redacta la historia.');
      return;
    }

    const selectedProd = MY_PRODUCTS.find((p) => p.id === newStory.productId);
    const nextNumber = requests.length + 1;

    const created: ProductStoryRequest = {
      id: `HIS-${Date.now()}`,
      storyCode: `HIS-00${nextNumber}`,
      productId: newStory.productId,
      productName: selectedProd?.name || 'Producto',
      sellerId: 'SEL-001',
      proposedStory: newStory.proposedStory,
      mediaUrl: newStory.mediaUrl,
      status: StoryStatus.IN_REVIEW,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setRequests([created, ...requests]);
    setIsModalOpen(false);
    setNewStory({ productId: MY_PRODUCTS[0].id, proposedStory: '', mediaUrl: '' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Solicitudes de Historias de Productos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Historial de borradores enviados para revisión y aprobación del Administrador.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          + Postular Nueva Historia
        </button>
      </div>

      {/* Tarjetas de Solicitudes en Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {item.storyCode}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-1">{item.productName}</h3>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Enviado: {item.createdAt}
                  </span>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                    item.status === StoryStatus.IN_REVIEW
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : item.status === StoryStatus.PUBLISHED
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {item.status === StoryStatus.IN_REVIEW && 'En Revisión'}
                  {item.status === StoryStatus.PUBLISHED && 'Publicada'}
                  {item.status === StoryStatus.REJECTED && 'Rechazada'}
                </span>
              </div>

              {/* Cuerpo del Borrador */}
              <div className="text-xs text-gray-700 space-y-2">
                <p className="italic bg-stone-50 p-3 rounded-xl border border-stone-200/70 leading-relaxed">
                  "{item.proposedStory}"
                </p>
                {item.mediaUrl && (
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-teal-800 hover:underline font-semibold text-[11px]"
                  >
                    📎 Ver material adjunto
                  </a>
                )}
              </div>

              {/* Retroalimentación del Admin si fue Aprobada o Rechazada */}
              {item.adminFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    item.status === StoryStatus.REJECTED
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <strong className="block text-[11px] uppercase tracking-wider font-bold">
                    {item.status === StoryStatus.REJECTED
                      ? 'Motivo de Rechazo / Observaciones:'
                      : 'Mensaje del Admin:'}
                  </strong>
                  <p className="leading-relaxed">{item.adminFeedback}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedRequest(item)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-teal-900 font-semibold rounded-xl text-xs transition-colors border border-stone-300"
              >
                Ver Detalle Completo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Postular Nueva Historia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-teal-900">Postular Historia de Producto</h3>
              <p className="text-xs text-gray-500 mt-1">
                Envía la narrativa que respalda tu producto para la revisión del Administrador.
              </p>
            </div>

            <form onSubmit={handleSubmitStory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Seleccionar Producto</label>
                <select
                  value={newStory.productId}
                  onChange={(e) => setNewStory({ ...newStory, productId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none bg-white"
                >
                  {MY_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Historia / Narrativa del Producto</label>
                <textarea
                  rows={5}
                  required
                  value={newStory.proposedStory}
                  onChange={(e) => setNewStory({ ...newStory, proposedStory: e.target.value })}
                  placeholder="Describe el origen artesanal, valor cultural, impacto comunitario o tradición..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-800">
                  Enlace de Foto / Video Promocional (Opcional)
                </label>
                <input
                  type="url"
                  value={newStory.mediaUrl}
                  onChange={(e) => setNewStory({ ...newStory, mediaUrl: e.target.value })}
                  placeholder="https://ejemplo.com/video-proceso.mp4"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Enviar a Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Detalle de Solicitud */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-teal-900">
                Detalle de Solicitud <span className="font-mono text-amber-800">{selectedRequest.storyCode}</span>
              </h3>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                  selectedRequest.status === StoryStatus.IN_REVIEW
                    ? 'bg-amber-100 text-amber-800'
                    : selectedRequest.status === StoryStatus.PUBLISHED
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedRequest.status}
              </span>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p><strong className="text-gray-900">Producto:</strong> {selectedRequest.productName}</p>
              <p><strong className="text-gray-900">Fecha de Envío:</strong> {selectedRequest.createdAt}</p>

              <div>
                <strong className="text-gray-900 block mb-1">Borrador Enviado:</strong>
                <p className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 leading-relaxed text-gray-800">
                  {selectedRequest.proposedStory}
                </p>
              </div>

              {selectedRequest.adminFeedback && (
                <div>
                  <strong className="text-gray-900 block mb-1">Retroalimentación del Administrador:</strong>
                  <p
                    className={`p-3 rounded-xl border font-medium ${
                      selectedRequest.status === StoryStatus.REJECTED
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {selectedRequest.adminFeedback}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
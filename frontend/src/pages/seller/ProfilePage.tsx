import { useState } from 'react';
import type { SellerProfile, ProfileUpdateRequest } from '../../types/seller';

// Datos simulados del vendedor alineados con el esquema de la DB y el SRI
const INITIAL_PROFILE: SellerProfile = {
  id: 'SEL-001',
  userId: 'USR-001',
  fullName: 'Alexis Sebastian Gómez',
  tradeName: 'Distribuidora Gómez & Hijos',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  email: 'alexis.gomez@ejemplo.com',
  phone: '0998765432',
  taxId: '0102030405001', // RUC de 13 dígitos
  businessAddress: 'Av. Huayna Cápac y Calle Larga, Cuenca',
  establishment: '001',
  emissionPoint: '001',
  isEditable: false,
};

// Productos simulados para vincular a la solicitud de historia
const MY_PRODUCTS = [
  { id: 'PROD-001', name: 'Miel Artesanal 500g' },
  { id: 'PROD-002', name: 'Queso Andino Madurado' },
  { id: 'PROD-003', name: 'Asesoría en Huertos Urbanos' },
];

export const SellerProfilePage = () => {
  const [profile] = useState<SellerProfile>(INITIAL_PROFILE);

  // Modales
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Formulario Solicitud de Cambio de Datos
  const [fieldToUpdate, setFieldToUpdate] = useState<
    'businessAddress' | 'phone' | 'email' | 'taxId' | 'tradeName'
  >('businessAddress');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');

  // Formulario Solicitud de Historia
  const [storyRequest, setStoryRequest] = useState({
    productId: MY_PRODUCTS[0].id,
    proposedStory: '',
    mediaUrl: '',
  });

  // Obtener el valor actual dinámicamente según el campo seleccionado
  const getCurrentFieldValue = () => {
    switch (fieldToUpdate) {
      case 'businessAddress':
        return profile.businessAddress;
      case 'phone':
        return profile.phone;
      case 'email':
        return profile.email;
      case 'taxId':
        return profile.taxId;
      case 'tradeName':
        return profile.tradeName || 'No registrado';
      default:
        return '';
    }
  };

  // Enviar solicitud de cambio de datos
  const handleDataRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !reason.trim()) {
      alert('Por favor completa el nuevo valor y la justificación.');
      return;
    }

    const payload: Partial<ProfileUpdateRequest> = {
      sellerId: profile.id,
      fieldToUpdate,
      currentValue: getCurrentFieldValue(),
      newValue,
      reason,
      status: 'PENDIENTE',
    };

    console.log('Solicitud enviada a NestJS:', payload);
    alert('Solicitud de cambio de datos enviada con éxito. El Administrador revisará tus cambios.');
    
    setIsDataModalOpen(false);
    setNewValue('');
    setReason('');
  };

  // Enviar borrador de historia
  const handleStoryRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyRequest.proposedStory.trim()) {
      alert('Por favor redacta la historia antes de enviarla.');
      return;
    }

    alert(
      'Borrador de historia enviado al Administrador. Recibirás una notificación cuando sea revisado y publicado.'
    );
    setIsStoryModalOpen(false);
    setStoryRequest({ productId: MY_PRODUCTS[0].id, proposedStory: '', mediaUrl: '' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-teal-900">Perfil del Vendedor</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona tu información comercial, tus datos de emisión fiscal SRI y postula historias de tus productos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Datos Personales y Fiscales (2 Columnas) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-700/20 shadow-xs"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
              {profile.tradeName && (
                <p className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md inline-block border border-teal-200">
                  {profile.tradeName}
                </p>
              )}
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
                  ✓ Datos Verificados por Admin
                </span>
              </div>
            </div>
          </div>

          {/* Aviso de Solo Lectura */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <span className="text-base">🔒</span>
            <p className="leading-relaxed">
              Por motivos de seguridad y validez de facturación electrónica (SRI), tus datos personales no se pueden editar directamente. Si necesitas corregirlos, envía una solicitud de actualización.
            </p>
          </div>

          {/* Rejilla de Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Correo de Contacto</label>
              <input
                type="text"
                value={profile.email}
                readOnly
                className="w-full p-2.5 bg-stone-100/70 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Teléfono</label>
              <input
                type="text"
                value={profile.phone}
                readOnly
                className="w-full p-2.5 bg-stone-100/70 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">RUC / Cédula (Facturación)</label>
              <input
                type="text"
                value={profile.taxId}
                readOnly
                className="w-full p-2.5 bg-stone-100/70 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none font-mono font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Punto Emisión SRI (Est. - Pt.Em)</label>
              <input
                type="text"
                value={`${profile.establishment} - ${profile.emissionPoint}`}
                readOnly
                className="w-full p-2.5 bg-stone-100/70 border border-gray-200 rounded-xl text-teal-900 cursor-not-allowed outline-none font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-gray-700">Dirección Fiscal del Negocio</label>
              <input
                type="text"
                value={profile.businessAddress}
                readOnly
                className="w-full p-2.5 bg-stone-100/70 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none font-medium"
              />
            </div>
          </div>

          <button
            onClick={() => setIsDataModalOpen(true)}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-teal-900 font-semibold rounded-xl text-xs transition-colors border border-stone-300 shadow-xs cursor-pointer"
          >
            Solicitar Cambio de Información
          </button>
        </div>

        {/* Tarjeta Explicativa de Historias (1 Columna) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800 text-lg font-bold">
                📖
              </div>
              <div>
                <h3 className="text-base font-bold text-teal-900">Historias de Productos</h3>
                <p className="text-xs text-gray-500">Crea un vínculo emocional con tus compradores</p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-xs text-gray-700 space-y-3">
              <h4 className="font-bold text-teal-900 uppercase tracking-wider text-[11px]">
                ¿En qué consiste este módulo?
              </h4>
              <p className="leading-relaxed">
                Las <strong>Historias de Productos</strong> permiten destacar el origen artesanal, el impacto comunitario o el proceso de elaboración de tus artículos en la portada de la plataforma.
              </p>
              <ul className="space-y-2 text-stone-600 list-disc list-inside text-[11px]">
                <li>Envías un borrador con la historia y fotos/videos demostrativos.</li>
                <li>
                  El <strong>Administrador</strong> revisa la calidad del contenido y aprueba la publicación.
                </li>
                <li>Una vez aprobada, tu historia aparecerá en la sección destacada.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setIsStoryModalOpen(true)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer mt-4"
          >
            Postular Borrador de Historia
          </button>
        </div>
      </div>

      {/* Modal 1: Solicitar Cambio de Datos */}
      {isDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-teal-900">Solicitar Modificación de Datos</h3>
              <p className="text-xs text-gray-500 mt-1">
                Indica qué dato deseas actualizar para que el Administrador revise y autorice el cambio.
              </p>
            </div>

            <form onSubmit={handleDataRequestSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Campo a Modificar</label>
                <select
                  value={fieldToUpdate}
                  onChange={(e) =>
                    setFieldToUpdate(
                      e.target.value as 'businessAddress' | 'phone' | 'email' | 'taxId' | 'tradeName'
                    )
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none bg-white"
                >
                  <option value="businessAddress">Dirección Fiscal del Negocio</option>
                  <option value="phone">Teléfono de Contacto</option>
                  <option value="taxId">RUC / Cédula</option>
                  <option value="email">Correo Electrónico</option>
                  <option value="tradeName">Nombre Comercial</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-500">Valor Actual Registrado</label>
                <input
                  type="text"
                  value={getCurrentFieldValue()}
                  readOnly
                  className="w-full p-2.5 bg-stone-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Nuevo Valor Solicitado</label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Escribe el nuevo dato correcto..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Justificación / Motivo del Cambio</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Cambio de domicilio fiscal o renovación de número telefónico..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDataModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Solicitar Historia de Producto */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-100">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-teal-900">Borrador de Historia de Producto</h3>
              <p className="text-xs text-gray-500 mt-1">
                Redacta la historia que respalda a tu producto para la evaluación del Administrador.
              </p>
            </div>

            <form onSubmit={handleStoryRequestSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Seleccionar Producto</label>
                <select
                  value={storyRequest.productId}
                  onChange={(e) => setStoryRequest({ ...storyRequest, productId: e.target.value })}
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
                <label className="font-semibold text-gray-800">Narrativa / Historia del Producto</label>
                <textarea
                  rows={5}
                  required
                  value={storyRequest.proposedStory}
                  onChange={(e) => setStoryRequest({ ...storyRequest, proposedStory: e.target.value })}
                  placeholder="Cuéntanos el origen, quiénes lo elaboran, la tradición familiar o el valor orgánico de este producto..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-800">
                  Enlace a Foto o Video Promocional (Opcional)
                </label>
                <input
                  type="url"
                  value={storyRequest.mediaUrl}
                  onChange={(e) => setStoryRequest({ ...storyRequest, mediaUrl: e.target.value })}
                  placeholder="https://ejemplo.com/foto-historia.jpg"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Enviar a Revisión de Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
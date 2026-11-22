import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { SolicitudHistoriaProducto, EstadoHistoria } from '../../types';
import { Check, X } from 'lucide-react';

const ProductStoriesModerationPage: React.FC = () => {
  const [historias, setHistorias] = useState<SolicitudHistoriaProducto[]>([]);
  const [selected, setSelected] = useState<SolicitudHistoriaProducto | null>(null);
  const [obs, setObs] = useState('');

  const reloadHistorias = async () => {
    try {
      const data = await adminService.getHistorias();
      setHistorias(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const data = await adminService.getHistorias();
        if (!cancelled) {
          setHistorias(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
        }
      }
    };

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleModerar = async (estado: EstadoHistoria) => {
    if (!selected) return;
    await adminService.moderarHistoria(selected.id, estado, obs);
    setSelected(null);
    setObs('');
    await reloadHistorias();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">Moderación de Historias</h1>
        <p className="text-[#4A6B4E]/60 mt-1">
          Revisa el contenido narrativo enviado por los vendedores[cite: 29].
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {historias.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-[24px] border border-[#D9E7D6] text-[#4A6B4E]/50 italic">
            No hay historias pendientes de moderación en este momento.
          </div>
        ) : (
          historias.map((historia) => (
            <div
              key={historia.id}
              className="bg-white rounded-[24px] border border-[#D9E7D6] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono font-bold text-[#4A6B4E]/50">
                    {historia.codigoHistoria}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      historia.estado === 'PUBLICADA'
                        ? 'bg-[#E6F4EA] text-[#2E6F40]'
                        : historia.estado === 'EN_REVISION'
                          ? 'bg-[#FEF7E0] text-[#9A6B00]'
                          : 'bg-[#FCE8E6] text-[#A53B2B]'
                    }`}
                  >
                    {historia.estado}
                  </span>
                </div>
                <h3 className="font-bold text-[#4A6B4E] text-lg mb-2">{historia.nombreProducto}</h3>
                <p className="text-sm text-[#4A6B4E]/80 line-clamp-3 mb-4">
                  {historia.historiaPropuesta}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(historia);
                  setObs(historia.observacionesAdmin || '');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#D9E7D6] text-[#4A6B4E] font-bold rounded-xl hover:bg-[#4A6B4E] hover:text-white transition-colors mt-4"
              >
                <Check size={16} /> Moderar Historia
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de Moderación */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] p-8 max-w-lg w-full space-y-6 shadow-xl border border-[#D9E7D6]">
            <div>
              <span className="text-xs font-mono font-bold text-[#4A6B4E]/50">
                {selected.codigoHistoria}
              </span>
              <h2 className="text-2xl font-bold text-[#4A6B4E]">{selected.nombreProducto}</h2>
            </div>

            <div className="bg-[#F7F5EC] p-4 rounded-xl border border-[#D9E7D6]/50">
              <p className="text-sm text-[#4A6B4E] italic font-serif">
                &quot;{selected.historiaPropuesta}&quot;
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#4A6B4E] mb-2">
                Observaciones del Administrador
              </label>
              <textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Indica un motivo si vas a rechazar..."
                className="w-full p-4 rounded-xl border border-[#D9E7D6] focus:outline-none focus:ring-2 focus:ring-[#4A6B4E] text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleModerar('PUBLICADA')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4A6B4E] text-white font-bold rounded-xl hover:bg-[#3B573E] transition-colors"
              >
                <Check size={18} /> Aprobar y Publicar
              </button>
              <button
                type="button"
                onClick={() => handleModerar('RECHAZADA')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#A53B2B] text-white font-bold rounded-xl hover:bg-[#852E21] transition-colors"
              >
                <X size={18} /> Rechazar
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="w-full text-center text-xs text-[#4A6B4E]/60 underline hover:text-[#4A6B4E]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStoriesModerationPage;
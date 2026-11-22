import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { Categoria } from '../../types';
import { Plus, Tag } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const reloadCategorias = async () => {
    try {
      const data = await adminService.getCategorias();
      setCategorias(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const data = await adminService.getCategorias();
        if (!cancelled) {
          setCategorias(data);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await adminService.crearCategoria({ nombre: nombre.trim(), descripcion, activa: true });
    setNombre('');
    setDescripcion('');
    await reloadCategorias();
  };

  const handleToggle = async (cat: Categoria) => {
    await adminService.updateCategoria(cat.id, { activa: !cat.activa });
    await reloadCategorias();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#4A6B4E] tracking-tight">Categorías de Productos</h1>
        <p className="text-[#4A6B4E]/60 mt-1">Organiza el catálogo global de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-[24px] border border-[#D9E7D6] shadow-sm h-fit">
          <h3 className="font-bold text-[#4A6B4E] text-lg mb-4 flex items-center gap-2">
            <Plus size={20} /> Nueva Categoría
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4A6B4E] uppercase mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Frutas Orgánicas"
                className="w-full p-3 rounded-xl border border-[#D9E7D6] focus:outline-none focus:ring-2 focus:ring-[#4A6B4E] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A6B4E] uppercase mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripción opcional..."
                className="w-full p-3 rounded-xl border border-[#D9E7D6] focus:outline-none focus:ring-2 focus:ring-[#4A6B4E] text-sm"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#4A6B4E] text-white font-bold rounded-xl hover:bg-[#3B573E] transition-colors"
            >
              Guardar Categoría
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#D9E7D6] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorias.length === 0 ? (
              <p className="col-span-full text-center text-[#4A6B4E]/50 italic py-8">
                No hay categorías agregadas aún.
              </p>
            ) : (
              categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-[#F7F5EC] bg-[#F7F5EC]/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D9E7D6] flex items-center justify-center text-[#4A6B4E]">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#4A6B4E]">{cat.nombre}</h4>
                      {cat.descripcion && (
                        <p className="text-xs text-[#4A6B4E]/60 line-clamp-1">{cat.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      cat.activa
                        ? 'bg-[#E6F4EA] text-[#2E6F40]'
                        : 'bg-[#FCE8E6] text-[#A53B2B]'
                    }`}
                  >
                    {cat.activa ? 'Activa' : 'Inactiva'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
import { useState } from 'react';
import type { Producto, TipoItem, EstadoProducto, ModalidadServicio } from '../../types';

const INITIAL_PRODUCTS: Producto[] = [
  {
    id: 'PROD-001',
    tiendaId: 'store-1',
    categoriaId: 'cat-alimentos',
    categoriaNombre: 'Alimentos',
    nombre: 'Miel Artesanal 500g',
    descripcion: 'Miel 100% natural de flores silvestres recolectada localmente.',
    precio: 10.00,
    stock: 25,
    unidadMedida: 'frasco',
    tipo: 'PERECIBLE',
    estado: 'PUBLICADO',
    fechaCaducidad: '2027-12-31',
    condicionesAlmacenamiento: 'Lugar fresco y seco',
    imagenUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-002',
    tiendaId: 'store-1',
    categoriaId: 'cat-lacteos',
    categoriaNombre: 'Lácteos',
    nombre: 'Queso Andino Madurado',
    descripcion: 'Queso artesanal elaborado con leche fresca de granja.',
    precio: 15.50,
    stock: 8,
    unidadMedida: 'kg',
    tipo: 'PERECIBLE',
    estado: 'PUBLICADO',
    fechaCaducidad: '2026-11-15',
    condicionesAlmacenamiento: 'Refrigerado a 4°C',
    imagenUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-003',
    tiendaId: 'store-1',
    categoriaId: 'cat-servicios',
    categoriaNombre: 'Servicios',
    nombre: 'Asesoría en Huertos Urbanos',
    descripcion: 'Mantenimiento e instalación de cultivos orgánicos en casa.',
    precio: 25.00,
    tipo: 'SERVICIO',
    estado: 'PENDIENTE_REVISION',
    duracionServicio: '2 Horas',
    modalidadServicio: 'A_DOMICILIO',
    cuposDiarios: 3,
    imagenUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&auto=format&fit=crop&q=80',
  },
];

const EMPTY_PRODUCT_FORM = {
  nombre: '',
  descripcion: '',
  precio: 0,
  categoriaNombre: 'General',
  tipo: 'NO_PERECIBLE' as TipoItem,
  unidadMedida: 'unidad',
  stock: 0,
  fechaCaducidad: '',
  condicionesAlmacenamiento: '',
  duracionServicio: '',
  modalidadServicio: 'PRESENCIAL' as ModalidadServicio,
  cuposDiarios: 1,
  imagenUrl: '',
};

export const SellerProductsPage = () => {
  const [products, setProducts] = useState<Producto[]>(INITIAL_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);

  // Abrir modal en modo Creación
  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setFormData(EMPTY_PRODUCT_FORM);
    setIsModalOpen(true);
  };

  // Abrir modal en modo Edición
  const handleOpenEditModal = (product: Producto) => {
    setEditingProductId(product.id);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categoriaNombre: product.categoriaNombre || 'General',
      tipo: product.tipo,
      unidadMedida: product.unidadMedida || 'unidad',
      stock: product.stock ?? 0,
      fechaCaducidad: product.fechaCaducidad ?? '',
      condicionesAlmacenamiento: product.condicionesAlmacenamiento ?? '',
      duracionServicio: product.duracionServicio ?? '',
      modalidadServicio: product.modalidadServicio ?? 'PRESENCIAL',
      cuposDiarios: product.cuposDiarios ?? 1,
      imagenUrl: product.imagenUrl,
    });
    setIsModalOpen(true);
  };

  // Eliminar producto
  const handleDeleteProduct = (productId: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Guardar (Crear o Editar)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || formData.precio <= 0) {
      alert('Por favor ingresa un nombre y un precio válido.');
      return;
    }

    if (editingProductId) {
      // Actualizar existente
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                ...formData,
                estado: 'PENDIENTE_REVISION' as EstadoProducto, // Al editar, requiere revisión de nuevo
              }
            : p
        )
      );
    } else {
      // Crear nuevo
      const newProductItem: Producto = {
        id: `PROD-${Date.now()}`,
        tiendaId: 'store-1',
        categoriaId: 'cat-general',
        ...formData,
        estado: 'PENDIENTE_REVISION' as EstadoProducto,
        imagenUrl: formData.imagenUrl || 'https://via.placeholder.com/150',
      };
      setProducts((prev) => [newProductItem, ...prev]);
    }

    setIsModalOpen(false);
    setFormData(EMPTY_PRODUCT_FORM);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Mis Productos y Servicios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra tu catálogo de productos perecibles, no perecibles y servicios disponibles.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          + Nuevo Producto / Servicio
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100/80 border-b border-gray-200 text-teal-950 font-semibold text-sm">
              <th className="p-4">Imagen</th>
              <th className="p-4">Producto / Servicio</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Estado Moderación</th>
              <th className="p-4">Precio</th>
              <th className="p-4 text-center">Disponibilidad</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                <td className="p-4">
                  <img
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-xs"
                  />
                </td>
                <td className="p-4 max-w-xs">
                  <div className="font-semibold text-gray-900">{prod.nombre}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{prod.descripcion}</div>
                  <span className="inline-block mt-1 text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium border border-stone-200">
                    {prod.categoriaNombre || 'General'}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${
                      prod.tipo === 'PERECIBLE'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : prod.tipo === 'SERVICIO'
                        ? 'bg-sky-50 text-sky-900 border-sky-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    {prod.tipo}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
                      prod.estado === 'PUBLICADO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prod.estado === 'PENDIENTE_REVISION'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {prod.estado}
                  </span>
                </td>
                <td className="p-4 font-semibold text-gray-900">
                  ${prod.precio.toFixed(2)}
                  {prod.unidadMedida && (
                    <span className="text-xs font-normal text-gray-500"> / {prod.unidadMedida}</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {prod.tipo === 'SERVICIO' ? (
                    <span className="inline-block px-2.5 py-1 text-xs bg-stone-100 text-stone-700 font-medium rounded-lg border border-stone-200">
                      {prod.cuposDiarios} cupos/día
                    </span>
                  ) : (
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        (prod.stock ?? 0) > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {prod.stock} {prod.unidadMedida || 'u.'}
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-teal-900 font-medium rounded-lg text-xs transition-colors border border-stone-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.nombre)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-lg text-xs transition-colors border border-rose-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-5 border border-gray-100 my-8">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-teal-900">
                {editingProductId ? 'Editar Registro' : 'Agregar Nuevo Registro'}
              </h3>
              <p className="text-xs text-gray-500">
                Los cambios pasarán por proceso de moderación administrativa antes de ser visibles.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Selector Tipo de Registro */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-800">Tipo de Registro</label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-medium transition-all ${
                      formData.tipo === 'PERECIBLE'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-gray-200 bg-stone-50 text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value="PERECIBLE"
                      checked={formData.tipo === 'PERECIBLE'}
                      onChange={() => setFormData({ ...formData, tipo: 'PERECIBLE' })}
                      className="hidden"
                    />
                    Perecible
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-medium transition-all ${
                      formData.tipo === 'NO_PERECIBLE'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-gray-200 bg-stone-50 text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value="NO_PERECIBLE"
                      checked={formData.tipo === 'NO_PERECIBLE'}
                      onChange={() => setFormData({ ...formData, tipo: 'NO_PERECIBLE' })}
                      className="hidden"
                    />
                    No Perecible
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-medium transition-all ${
                      formData.tipo === 'SERVICIO'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                        : 'border-gray-200 bg-stone-50 text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value={"SERVICIO"}
                      checked={formData.tipo === 'SERVICIO'}
                      onChange={() => setFormData({ ...formData, tipo: 'SERVICIO' })}
                      className="hidden"
                    />
                    Servicio
                  </label>
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Nombre del Producto / Servicio</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Miel de Abeja 500g o Servicio de Corte"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles del producto o servicio..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none resize-none"
                />
              </div>

              {/* Precio, Categoría y Unidad de Medida */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-800">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.precio || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-800">Categoría</label>
                  <input
                    type="text"
                    value={formData.categoriaNombre}
                    onChange={(e) => setFormData({ ...formData, categoriaNombre: e.target.value })}
                    placeholder="Ej: Lácteos, Mantenimiento..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                  />
                </div>

                {formData.tipo !== 'SERVICIO' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-800">Unidad de Medida</label>
                    <input
                      type="text"
                      value={formData.unidadMedida}
                      onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                      placeholder="Ej: kg, libra, frasco, unidad"
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Campos Dinámicos según el Tipo */}
              {formData.tipo === 'PERECIBLE' && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
                  <p className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                    Detalles de Producto Perecible
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Stock Disponible</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Fecha de Caducidad</label>
                      <input
                        type="date"
                        value={formData.fechaCaducidad}
                        onChange={(e) => setFormData({ ...formData, fechaCaducidad: e.target.value })}
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-800">Requisitos de Conservación</label>
                    <input
                      type="text"
                      value={formData.condicionesAlmacenamiento}
                      onChange={(e) => setFormData({ ...formData, condicionesAlmacenamiento: e.target.value })}
                      placeholder="Ej: Refrigerado a 4°C, Mantener alejado del sol..."
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'NO_PERECIBLE' && (
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-3">
                  <p className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                    Detalles de Producto No Perecible
                  </p>
                  <div className="space-y-1 max-w-xs">
                    <label className="font-semibold text-gray-800">Stock Disponible</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'SERVICIO' && (
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200/80 space-y-3">
                  <p className="font-bold text-sky-900 uppercase tracking-wider text-[11px]">
                    Detalles del Servicio
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Duración Estimada</label>
                      <input
                        type="text"
                        value={formData.duracionServicio}
                        onChange={(e) => setFormData({ ...formData, duracionServicio: e.target.value })}
                        placeholder="Ej: 1 Hora, 45 min"
                        className="w-full p-2.5 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Modalidad</label>
                      <select
                        value={formData.modalidadServicio}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            modalidadServicio: e.target.value as ModalidadServicio,
                          })
                        }
                        className="w-full p-2.5 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                      >
                        <option value="PRESENCIAL">Presencial (En local)</option>
                        <option value="A_DOMICILIO">A domicilio</option>
                        <option value="VIRTUAL">Virtual / En línea</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Cupos / Día</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.cuposDiarios || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cuposDiarios: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-full p-2.5 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Imagen URL */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">URL de la Imagen</label>
                <input
                  type="url"
                  value={formData.imagenUrl}
                  onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              {/* Botones Modal */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {editingProductId ? 'Guardar Cambios' : 'Publicar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
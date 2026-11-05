import { useState } from 'react';
import {
  type Product,
  ItemType,
  ProductStatus,
  type ServiceModalidad,
} from '../../types/product';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PROD-001',
    storeId: 'store-1',
    categoryId: 'cat-alimentos',
    categoryName: 'Alimentos',
    name: 'Miel Artesanal 500g',
    description: 'Miel 100% natural de flores silvestres recolectada localmente.',
    price: 10.00,
    stock: 25,
    unitMeasure: 'frasco',
    type: ItemType.PERECIBLE,
    status: ProductStatus.PUBLISHED,
    expirationDate: '2027-12-31',
    storageRequirements: 'Lugar fresco y seco',
    imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-002',
    storeId: 'store-1',
    categoryId: 'cat-lacteos',
    categoryName: 'Lácteos',
    name: 'Queso Andino Madurado',
    description: 'Queso artesanal elaborado con leche fresca de granja.',
    price: 15.50,
    stock: 8,
    unitMeasure: 'kg',
    type: ItemType.PERECIBLE,
    status: ProductStatus.PUBLISHED,
    expirationDate: '2026-11-15',
    storageRequirements: 'Refrigerado a 4°C',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'PROD-003',
    storeId: 'store-1',
    categoryId: 'cat-servicios',
    categoryName: 'Servicios',
    name: 'Asesoría en Huertos Urbanos',
    description: 'Mantenimiento e instalación de cultivos orgánicos en casa.',
    price: 25.00,
    type: ItemType.SERVICIO,
    status: ProductStatus.PENDING_APPROVAL,
    serviceDuration: '2 Horas',
    serviceModalidad: 'A_DOMICILIO',
    dailyCapacity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&auto=format&fit=crop&q=80',
  },
];

const EMPTY_PRODUCT_FORM = {
  name: '',
  description: '',
  price: 0,
  categoryName: 'General',
  type: ItemType.NO_PERECIBLE as ItemType,
  unitMeasure: 'unidad',
  stock: 0,
  expirationDate: '',
  storageRequirements: '',
  serviceDuration: '',
  serviceModalidad: 'PRESENCIAL' as ServiceModalidad,
  dailyCapacity: 1,
  imageUrl: '',
};

export const SellerProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
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
  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryName: product.categoryName || 'General',
      type: product.type,
      unitMeasure: product.unitMeasure || 'unidad',
      stock: product.stock ?? 0,
      expirationDate: product.expirationDate ?? '',
      storageRequirements: product.storageRequirements ?? '',
      serviceDuration: product.serviceDuration ?? '',
      serviceModalidad: product.serviceModalidad ?? 'PRESENCIAL',
      dailyCapacity: product.dailyCapacity ?? 1,
      imageUrl: product.imageUrl,
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
    if (!formData.name.trim() || formData.price <= 0) {
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
                status: ProductStatus.PENDING_APPROVAL, // Al editar, requiere revisión de nuevo
              }
            : p
        )
      );
    } else {
      // Crear nuevo
      const newProductItem: Product = {
        id: `PROD-${Date.now()}`,
        storeId: 'store-1',
        categoryId: 'cat-general',
        ...formData,
        status: ProductStatus.PENDING_APPROVAL,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/150',
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
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-xs"
                  />
                </td>
                <td className="p-4 max-w-xs">
                  <div className="font-semibold text-gray-900">{prod.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{prod.description}</div>
                  <span className="inline-block mt-1 text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium border border-stone-200">
                    {prod.categoryName || 'General'}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${
                      prod.type === ItemType.PERECIBLE
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : prod.type === ItemType.SERVICIO
                        ? 'bg-sky-50 text-sky-900 border-sky-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    {prod.type}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
                      prod.status === ProductStatus.PUBLISHED
                        ? 'bg-emerald-100 text-emerald-800'
                        : prod.status === ProductStatus.PENDING_APPROVAL
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {prod.status}
                  </span>
                </td>
                <td className="p-4 font-semibold text-gray-900">
                  ${prod.price.toFixed(2)}
                  {prod.unitMeasure && (
                    <span className="text-xs font-normal text-gray-500"> / {prod.unitMeasure}</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {prod.type === ItemType.SERVICIO ? (
                    <span className="inline-block px-2.5 py-1 text-xs bg-stone-100 text-stone-700 font-medium rounded-lg border border-stone-200">
                      {prod.dailyCapacity} cupos/día
                    </span>
                  ) : (
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        (prod.stock ?? 0) > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {prod.stock} {prod.unitMeasure || 'u.'}
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
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
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
                      formData.type === ItemType.PERECIBLE
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-gray-200 bg-stone-50 text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value={ItemType.PERECIBLE}
                      checked={formData.type === ItemType.PERECIBLE}
                      onChange={() => setFormData({ ...formData, type: ItemType.PERECIBLE })}
                      className="hidden"
                    />
                    Perecible
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-medium transition-all ${
                      formData.type === ItemType.NO_PERECIBLE
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-gray-200 bg-stone-50 text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value={ItemType.NO_PERECIBLE}
                      checked={formData.type === ItemType.NO_PERECIBLE}
                      onChange={() => setFormData({ ...formData, type: ItemType.NO_PERECIBLE })}
                      className="hidden"
                    />
                    No Perecible
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-medium transition-all ${
                      formData.type === ItemType.SERVICIO
                        ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                        : 'border-gray-200 bg-stone-50 text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value={ItemType.SERVICIO}
                      checked={formData.type === ItemType.SERVICIO}
                      onChange={() => setFormData({ ...formData, type: ItemType.SERVICIO })}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Miel de Abeja 500g o Servicio de Corte"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-800">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-800">Categoría</label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    placeholder="Ej: Lácteos, Mantenimiento..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                  />
                </div>

                {formData.type !== ItemType.SERVICIO && (
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-800">Unidad de Medida</label>
                    <input
                      type="text"
                      value={formData.unitMeasure}
                      onChange={(e) => setFormData({ ...formData, unitMeasure: e.target.value })}
                      placeholder="Ej: kg, libra, frasco, unidad"
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Campos Dinámicos según el Tipo */}
              {formData.type === ItemType.PERECIBLE && (
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
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-800">Requisitos de Conservación</label>
                    <input
                      type="text"
                      value={formData.storageRequirements}
                      onChange={(e) => setFormData({ ...formData, storageRequirements: e.target.value })}
                      placeholder="Ej: Refrigerado a 4°C, Mantener alejado del sol..."
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.type === ItemType.NO_PERECIBLE && (
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

              {formData.type === ItemType.SERVICIO && (
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200/80 space-y-3">
                  <p className="font-bold text-sky-900 uppercase tracking-wider text-[11px]">
                    Detalles del Servicio
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Duración Estimada</label>
                      <input
                        type="text"
                        value={formData.serviceDuration}
                        onChange={(e) => setFormData({ ...formData, serviceDuration: e.target.value })}
                        placeholder="Ej: 1 Hora, 45 min"
                        className="w-full p-2.5 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-800">Modalidad</label>
                      <select
                        value={formData.serviceModalidad}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceModalidad: e.target.value as ServiceModalidad,
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
                        value={formData.dailyCapacity || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyCapacity: parseInt(e.target.value, 10) || 1,
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
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
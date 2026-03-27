

import React, { useState } from "react";
import AdminSearchBar from "./AdminSearchBar";
import AdminGroupSelect from "./AdminGroupSelect";
import AdminNotification from "./AdminNotification";
import { useHermesProductList } from "../hooks/useHermesProductList";

export default function HermesProductList() {
  const {
    hermesProducts,
    loadingHermes,
    errorHermes,
    loading,
    error,
    success,
    selectedImage,
    setSelectedImage,
    search,
    setSearch,
    group,
    setGroup,
    tab,
    setTab,
    groupOptions,
    filteredProducts,
    isPublished,
    handlePublish,
    handleUnpublish,
  } = useHermesProductList();

  // Estado para controlar el toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Mostrar toast personalizado según la acción
  React.useEffect(() => {
    if (success) {
      let customMessage = success;
      let customTitle = '¡Logrado!';
      if (success === '¡Producto publicado!') {
        customMessage = 'El producto fue publicado correctamente.';
        customTitle = 'Producto publicado';
      } else if (success === 'Producto despublicado') {
        customMessage = 'El producto fue quitado de la tienda.';
        customTitle = 'Producto quitado';
      }
      setToast({ message: customMessage, type: 'success', title: customTitle });
    } else if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [success, error]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Productos</h2>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'todos' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 bg-transparent'}`}
          onClick={() => setTab('todos')}
        >
          Todos
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === 'publicados' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 bg-transparent'}`}
          onClick={() => setTab('publicados')}
        >
          Publicados
        </button>
      </div>
      <AdminSearchBar value={search} onChange={setSearch} />
      <AdminGroupSelect value={group} onChange={setGroup} options={groupOptions} />

      {hermesProducts.length === 0 && <div>No hay productos disponibles. (¿La API responde bien?)</div>}
      <ul className="divide-y divide-slate-100">
        {filteredProducts.map((product: any, idx: number) => (
          <li key={`${product.hermes_id ?? 'sinid'}-${idx}`} className="py-4 flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex-1">
              <div className="font-medium text-slate-800 flex items-center gap-2">
                {product.nombre}
                {isPublished(product.hermes_id) && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 font-semibold">Publicado</span>
                )}
              </div>
              <div className="text-slate-500 text-sm">{product.descripcion}</div>
              <div className="text-slate-600 text-xs mt-1">Precio: ${product.precio}</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
              {!isPublished(product.hermes_id) ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="inline-block cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded transition">
                      Seleccionar imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setSelectedImage(prev => ({ ...prev, [product.hermes_id]: e.target.files?.[0] || null }))}
                      />
                    </label>
                    {(() => {
                      const imgFile = selectedImage[product.hermes_id];
                      if (imgFile instanceof File) {
                        return (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-600">
                              {imgFile.name}
                            </span>
                            <img
                              src={URL.createObjectURL(imgFile)}
                              alt="Previsualización"
                              className="w-12 h-12 object-cover rounded border"
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <button
                    className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    onClick={() => handlePublish(product)}
                    disabled={loading}
                  >
                    Publicar
                  </button>
                </>
              ) : (
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleUnpublish(product.hermes_id)}
                  disabled={loading}
                >
                  Quitar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {/* Notificación tipo toast */}
      {toast && (
        <AdminNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          title={toast.title}
        />
      )}
    </div>
  );
}

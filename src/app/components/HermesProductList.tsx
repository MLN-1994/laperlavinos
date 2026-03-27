
import React, { useState } from "react";
import AdminSearchBar from "../../app/admin/components/AdminSearchBar";
import AdminGroupSelect from "../../app/admin/components/AdminGroupSelect";
import Pagination from "../../app/admin/components/Pagination";
import AdminNotification from "../../app/admin/components/AdminNotification";
import Spinner from "./Spinner";
import HermesProductItem from "../../app/admin/components/HermesProductItem";
import { useHermesProductList } from "../hooks/useHermesProductList";

export default function HermesProductList() {
  // Estado para loading individual por producto
  const [loadingProduct, setLoadingProduct] = useState<{ [hermes_id: number]: boolean }>({});
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
    paginatedProducts,
    page,
    setPage,
    pageSize,
    totalFiltered,
    totalPages,
    isPublished,
    handlePublish,
    handleUnpublish,
  } = useHermesProductList();

  // Estado para controlar el toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; title?: string } | null>(null);

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

  // Handler para publicar con loading individual
  const handlePublishWithLoading = async (product: any) => {
    setLoadingProduct(prev => ({ ...prev, [product.hermes_id]: true }));
    await handlePublish(product);
    setLoadingProduct(prev => ({ ...prev, [product.hermes_id]: false }));
  };

  // Handler para quitar con loading individual
  const handleUnpublishWithLoading = async (hermes_id: number) => {
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: true }));
    await handleUnpublish(hermes_id);
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: false }));
  };

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

      {/* Loader global para carga de productos */}
      {loadingHermes ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size={32} colorClass="border-indigo-600" />
          <span className="ml-3 text-slate-500">Cargando productos...</span>
        </div>
      ) : (
        <>
          {hermesProducts.length === 0 && <div>No hay productos disponibles. (¿La API responde bien?)</div>}
          <ul className="divide-y divide-slate-100">
            {paginatedProducts.map((product: any) => (
              <HermesProductItem
                key={product.hermes_id ?? 'sinid'}
                product={product}
                isPublished={isPublished}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                loading={!!loadingProduct[product.hermes_id]}
                onPublish={handlePublishWithLoading}
                onUnpublish={handleUnpublishWithLoading}
              />
            ))}
          </ul>
        </>
      )}

      {/* Controles de paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalFiltered}
        pageSize={pageSize}
      />
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

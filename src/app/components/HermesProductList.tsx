
"use client";
import React, { useState } from "react";
import AdminSearchBar from "../../app/admin/components/AdminSearchBar";
import AdminGroupSelect from "../../app/admin/components/AdminGroupSelect";
import Pagination from "../../app/admin/components/Pagination";
import AdminNotification from "../../app/admin/components/AdminNotification";
import Spinner from "./Spinner";
import HermesProductItem from "../../app/admin/components/HermesProductItem";
import { useHermesProductList } from "../hooks/useHermesProductList";
import type { HermesProduct } from "../../hooks/useHermesProducts";

export default function HermesProductList() {
  // Estado para loading individual por producto
  const [loadingProduct, setLoadingProduct] = useState<{ [hermes_id: number]: boolean }>({});
  const {
    hermesProducts,
    publishedProducts,
    loadingHermes,
    errorHermes,
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
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error'; title?: string } | null>(null);
  const publishedCount = publishedProducts.length;
  const availableCount = hermesProducts.filter((product) => Number(product.stock) > 0).length;

  const showToast = React.useCallback((message: string, type: 'success' | 'error', title?: string) => {
    setToast({ id: Date.now(), message, type, title });
  }, []);

  // Handler para publicar con loading individual
  const handlePublishWithLoading = async (product: HermesProduct) => {
    setLoadingProduct(prev => ({ ...prev, [product.hermes_id]: true }));
    const result = await handlePublish(product);
    setLoadingProduct(prev => ({ ...prev, [product.hermes_id]: false }));

    if (result.ok) {
      showToast('El producto fue publicado correctamente.', 'success', 'Producto publicado');
      return;
    }

    showToast(result.message, 'error');
  };

  // Handler para quitar con loading individual
  const handleUnpublishWithLoading = async (hermes_id: number) => {
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: true }));
    const result = await handleUnpublish(hermes_id);
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: false }));

    if (result.ok) {
      showToast('El producto fue quitado de la tienda.', 'success', 'Producto quitado');
      return;
    }

    showToast(result.message, 'error');
  };

  return (
    <section className="space-y-7">
      <div className="overflow-hidden rounded-[28px] border border-[#dbd0c2] bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-4 sm:p-8 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10">
        <div className="flex flex-col gap-4 sm:gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#cbbca3] sm:mb-3 sm:text-[11px]">
              Catalogo web
            </div>
            <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.1rem]">Productos</h2>
            <p className="mt-2 text-sm leading-6 text-[#d6cdbf] sm:hidden">
              Catálogo listo para administrar.
            </p>
            <p className="mt-4 hidden max-w-xl text-sm leading-6 text-[#d6cdbf] sm:block sm:text-[15px]">
              Elegí qué productos mostrar, cargales imagen y controlá el catálogo visible sin perder la referencia operativa de Hermes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/8 bg-black/10 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Catálogo</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{hermesProducts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Publicados</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{publishedCount}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/8 bg-black/10 p-3 sm:col-span-1 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Con stock</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{availableCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gestión de catálogo</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">Productos</h3>
            </div>

            <div className="inline-flex rounded-2xl border border-[#ddd0be] bg-[#f3ede4] p-1 shadow-inner">
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === 'todos' ? 'bg-[#312c28] text-[#f7f0e2]' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setTab('todos')}
              >
                Todos
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === 'publicados' ? 'bg-[#312c28] text-[#f7f0e2]' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setTab('publicados')}
              >
                Publicados
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
            <AdminSearchBar value={search} onChange={setSearch} />
            <AdminGroupSelect value={group} onChange={setGroup} options={groupOptions} />
          </div>
        </div>

        <div className="mt-2 rounded-[24px] border border-[#e6ddcf] bg-[#fdfbf7] p-4 sm:p-5">
      {loadingHermes ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={32} colorClass="border-[#8f7a58]" />
          <span className="ml-3 text-slate-500">Cargando productos...</span>
        </div>
      ) : (
        <>
          {errorHermes && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorHermes}</div>}
          {hermesProducts.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">No hay productos disponibles. (¿La API responde bien?)</div>}
          <ul className="space-y-3">
            {paginatedProducts.map((product) => (
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
        </div>

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
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          title={toast.title}
        />
      )}
      </div>
    </section>
  );
}

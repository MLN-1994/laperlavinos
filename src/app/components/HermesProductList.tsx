
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
    handleEdit,
    handleUnpublish,
    handleToggleDestacado,
  } = useHermesProductList();

  // Estado para controlar el toast
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error'; title?: string } | null>(null);
  const publishedCount = publishedProducts.length;
  const availableCount = hermesProducts.filter((product) => Number(product.stock) > 0).length;
  const destacadoCount = publishedProducts.filter((p) => p.destacado === true).length;

  const showToast = React.useCallback((message: string, type: 'success' | 'error', title?: string) => {
    setToast({ id: Date.now(), message, type, title });
  }, []);

  // Handler para publicar con loading individual
  const handlePublishWithLoading = async (product: HermesProduct, description: string, enOferta: boolean, descuentoPorcentaje: number | null, images: File[]) => {
    setLoadingProduct(prev => ({ ...prev, [product.hermes_id]: true }));
    const result = await handlePublish(product, description, enOferta, descuentoPorcentaje, images);
    setLoadingProduct(prev => ({ ...prev, [product.hermes_id]: false }));

    if (result.ok) {
      showToast('El producto fue publicado correctamente.', 'success', 'Producto publicado');
      return;
    }

    showToast(result.message, 'error');
  };

  const handleEditWithLoading = async (hermes_id: number, description: string, enOferta: boolean, descuentoPorcentaje: number | null) => {
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: true }));
    const result = await handleEdit(hermes_id, description, enOferta, descuentoPorcentaje);
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: false }));
    if (result.ok) {
      showToast('El producto fue actualizado correctamente.', 'success', 'Producto editado');
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

  const handleToggleDestacadoWithLoading = async (hermes_id: number, destacado: boolean) => {
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: true }));
    const result = await handleToggleDestacado(hermes_id, destacado);
    setLoadingProduct(prev => ({ ...prev, [hermes_id]: false }));
    showToast(result.message, result.ok ? 'success' : 'error');
  };

  return (
    <section className="space-y-7">
      <div className="overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-4 sm:p-8 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10">
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

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/8 bg-black/10 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Catálogo</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{hermesProducts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Publicados</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{publishedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Con stock</p>
              <p className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">{availableCount}</p>
            </div>
            <div className={`rounded-2xl border p-3 sm:p-4 ${
              destacadoCount > 4
                ? 'border-amber-500/40 bg-amber-500/10'
                : 'border-white/8 bg-black/10'
            }`}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a89f91] sm:text-xs sm:tracking-[0.2em]">Destacados ★</p>
              <p className={`mt-1 text-2xl font-semibold sm:mt-2 sm:text-3xl ${
                destacadoCount > 4 ? 'text-amber-400' : 'text-white'
              }`}>{destacadoCount}</p>
              {destacadoCount > 4 && (
                <p className="mt-1 text-[9px] leading-tight text-amber-300">Máx 4 en home</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">Gestión de catálogo</p>
              <h3 className="mt-1 text-2xl font-serif tracking-wide text-[#beb9b1] sm:text-[2rem]">Productos</h3>
            </div>
            <div className="inline-flex rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/30 p-1">
              <button
                className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${tab === 'todos' ? 'bg-[#a68a5c]/20 text-[#c9a96e]' : 'text-[#beb9b1]/50 hover:text-[#beb9b1]'}`}
                onClick={() => setTab('todos')}
              >
                Todos
              </button>
              <button
                className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${tab === 'publicados' ? 'bg-[#a68a5c]/20 text-[#c9a96e]' : 'text-[#beb9b1]/50 hover:text-[#beb9b1]'}`}
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

          {/* Nota explicativa del botón ★ */}
          <div className="flex items-start gap-2.5 rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-3">
            <span className="mt-px text-base leading-none text-[#c9a96e]">★</span>
            <p className="text-[12px] leading-relaxed text-[#beb9b1]/70">
              <span className="font-semibold text-[#c9a96e]/90">Los más vendidos:</span>{' '}
              usá el botón ★ en los productos publicados para elegir cuáles aparecen en esa sección de la home.
              Se muestran <span className="font-semibold text-[#beb9b1]">máximo 4</span>. Si marcás más de 4, solo
              se verán los primeros 4 (orden alfabético). El contador de arriba te avisa cuando superás el límite.
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4 sm:p-5">
      {loadingHermes ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={32} colorClass="border-[#8f7a58]" />
          <span className="ml-3 text-[#beb9b1]/50">Cargando productos...</span>
        </div>
      ) : (
        <>
          {errorHermes && <div className="rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 px-4 py-3 text-sm text-[#f3c3ba]">{errorHermes}</div>}
          {hermesProducts.length === 0 && <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 px-4 py-6 text-sm text-[#beb9b1]/50">No hay productos disponibles. (¿La API responde bien?)</div>}
          <ul className="space-y-3">
            {paginatedProducts.map((product) => (
              <HermesProductItem
                key={product.hermes_id ?? 'sinid'}
                product={product}
                publishedProductId={publishedProducts.find(p => p.hermes_id === product.hermes_id)?.id}
                publishedProduct={publishedProducts.find(p => p.hermes_id === product.hermes_id)}
                isPublished={isPublished}
                loading={!!loadingProduct[product.hermes_id]}
                onPublish={handlePublishWithLoading}
                onUnpublish={handleUnpublishWithLoading}
                onEdit={handleEditWithLoading}
                onToggleDestacado={handleToggleDestacadoWithLoading}
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

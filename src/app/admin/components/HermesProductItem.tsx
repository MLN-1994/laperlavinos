import React, { useEffect, useRef, useState } from "react";
import { FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import Spinner from "../../components/Spinner";
import type { HermesProduct } from "../../../hooks/useHermesProducts";
import type { ProductImage, ProductoPublicado } from "../../../types";
import AdminProductImages from "./AdminProductImages";

interface HermesProductItemProps {
  product: HermesProduct;
  publishedProductId?: string;
  publishedProduct?: ProductoPublicado;
  isPublished: (hermes_id: number) => boolean;
  loading: boolean;
  onPublish: (product: HermesProduct, description: string, enOferta: boolean, descuentoPorcentaje: number | null, images: File[]) => void;
  onDelete: (hermes_id: number) => void;
  onToggleActivo?: (hermes_id: number, activo: boolean) => void;
  onEdit?: (hermes_id: number, description: string, enOferta: boolean, descuentoPorcentaje: number | null) => void;
  onToggleDestacado?: (hermes_id: number, destacado: boolean) => void;
}

const HermesProductItem: React.FC<HermesProductItemProps> = ({
  product,
  publishedProductId,
  publishedProduct,
  isPublished,
  loading,
  onPublish,
  onDelete,
  onToggleActivo,
  onEdit,
  onToggleDestacado,
}) => {
  const [customDescription, setCustomDescription] = useState("");
  const [enOferta, setEnOferta] = useState(false);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<string>("");
  // Imágenes seleccionadas para nuevo producto (aún no publicado)
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // Imágenes existentes para producto ya publicado
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  // Edit mode para producto publicado
  const [editMode, setEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editEnOferta, setEditEnOferta] = useState(false);
  const [editDescuento, setEditDescuento] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasValidHermesId = Number.isFinite(product.hermes_id) && Number.isInteger(product.hermes_id);
  const published = isPublished(product.hermes_id);
  const isActivo = publishedProduct?.activo !== false;
  const stock = Number(product.stock);
  const hasStock = Number.isFinite(stock) && stock > 0;

  // Cargar imágenes existentes cuando el producto está publicado
  useEffect(() => {
    if (!published || !publishedProductId) return;
    setLoadingImages(true);
    fetch(`/api/admin/product-images?product_id=${publishedProductId}`)
      .then((r) => r.json())
      .then((data: ProductImage[] | { error: string }) => {
        if (Array.isArray(data)) setExistingImages(data);
      })
      .catch(() => {/* silencioso */})
      .finally(() => setLoadingImages(false));
  }, [published, publishedProductId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPendingImages((prev) => [...prev, ...files]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openEditMode = () => {
    setEditDescription(publishedProduct?.descripcion ?? "");
    setEditEnOferta(publishedProduct?.en_oferta ?? false);
    setEditDescuento(publishedProduct?.descuento_porcentaje != null ? String(publishedProduct.descuento_porcentaje) : "");
    setEditMode(true);
  };

  const handleEditSubmit = () => {
    if (!onEdit) return;
    const pct = editEnOferta && editDescuento ? Number(editDescuento) : null;
    onEdit(product.hermes_id, editDescription, editEnOferta, pct);
    setEditMode(false);
  };

  return (
    <li className="rounded-sm border border-neutral-200 bg-white p-4 transition hover:border-neutral-200 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-neutral-800 flex items-center gap-2 text-base">
              {product.nombre}
            </div>
            {published && (
              <span className="rounded-sm bg-[#a68a5c]/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">Publicado</span>
            )}
            {published && !isActivo && (
              <span className="rounded-sm bg-neutral-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Oculto</span>
            )}
            <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${hasStock ? 'bg-[#a68a5c]/15 text-neutral-600' : 'bg-neutral-100 text-neutral-400'}`}>
              {hasStock ? `Stock ${stock}` : 'Sin stock'}
            </span>
            {product.grupo ? (
              <span className="rounded-sm bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                {product.grupo}
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm leading-6 text-neutral-400">{product.descripcion}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span className="rounded-sm bg-[#a68a5c]/15 px-3 py-1 font-semibold text-[#c9a96e]">
              ${Number(product.precio).toLocaleString('es-AR')}
            </span>
            {product.marca ? <span>Marca: {product.marca}</span> : null}
          </div>
          {!hasValidHermesId && (
            <div className="text-xs font-medium text-[#a68a5c]/70">
              Este producto no se puede publicar en la tienda.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[280px] lg:max-w-[320px]">
          {!published ? (
            /* â”€â”€ FORMULARIO DE PUBLICACIÁ“N â”€â”€ */
            <>
              <div className="rounded-sm border border-dashed border-neutral-200 bg-neutral-50 p-3 space-y-3">
                {/* Descripción */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 resize-none focus:border-[#a68a5c]/50 focus:outline-none transition disabled:opacity-40"
                    rows={3}
                    placeholder="Descripción del producto para la tienda..."
                    value={customDescription}
                    onChange={e => setCustomDescription(e.target.value)}
                    disabled={!hasValidHermesId || loading}
                  />
                </div>

                {/* Oferta */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id={`oferta-${product.hermes_id}`}
                      checked={enOferta}
                      onChange={e => {
                        setEnOferta(e.target.checked);
                        if (!e.target.checked) setDescuentoPorcentaje("");
                      }}
                      disabled={!hasValidHermesId || loading}
                      className="h-3.5 w-3.5 accent-[#a68a5c] cursor-pointer disabled:opacity-40"
                    />
                    <label
                      htmlFor={`oferta-${product.hermes_id}`}
                      className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 cursor-pointer select-none"
                    >
                      En oferta
                    </label>
                  </div>
                  {enOferta && (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        step={1}
                        placeholder="%"
                        value={descuentoPorcentaje}
                        onChange={e => setDescuentoPorcentaje(e.target.value)}
                        disabled={!hasValidHermesId || loading}
                        className="w-20 rounded-sm border border-[#a68a5c]/30 bg-neutral-50 px-2 py-1.5 text-xs text-[#c9a96e] text-center placeholder-neutral-400 focus:border-[#a68a5c]/60 focus:outline-none transition disabled:opacity-40"
                      />
                      <span className="text-[11px] text-neutral-400">% descuento</span>
                      {descuentoPorcentaje && Number(descuentoPorcentaje) > 0 && (
                        <span className="ml-1 text-[11px] font-semibold text-[#c9a96e]">
                          = ${Math.round(Number(product.precio) * (1 - Number(descuentoPorcentaje) / 100)).toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Selector de imágenes múltiples */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
                    Imágenes del producto
                  </label>
                  <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-neutral-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition ${hasValidHermesId ? 'text-neutral-500 hover:text-neutral-800' : 'cursor-not-allowed text-neutral-300'}`}>
                    + Agregar imágenes
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={!hasValidHermesId || loading}
                      onChange={handleImageSelect}
                    />
                  </label>

                  {pendingImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {pendingImages.map((file, idx) => (
                        <div key={idx} className="group relative aspect-square overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 rounded-sm bg-[#a68a5c] px-1 py-0.5 text-[7px] font-bold uppercase text-white">
                              Principal
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removePendingImage(idx)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase text-white"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {pendingImages.length === 0 && (
                    <p className="mt-2 text-xs text-neutral-400">Cargá al menos una imagen para publicar.</p>
                  )}
                </div>
              </div>

              <button
                className={`group relative flex items-center justify-center overflow-hidden gap-2 rounded-sm px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] transition ${hasValidHermesId ? 'border border-[#a68a5c] text-[#a68a5c] hover:text-neutral-800' : 'cursor-not-allowed border border-neutral-200 text-[#beb9b1]/30'}`}
                onClick={() => {
                  const pct = enOferta && descuentoPorcentaje ? Number(descuentoPorcentaje) : null;
                  onPublish(product, customDescription, enOferta, pct, pendingImages);
                }}
                disabled={loading || !hasValidHermesId}
              >
                {hasValidHermesId && <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-300 translate-y-full group-hover:translate-y-0" />}
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? <Spinner size={14} colorClass="border-current" /> : null}
                  Publicar
                </span>
              </button>
            </>
          ) : (
            /* â”€â”€ PRODUCTO PUBLICADO â”€â”€ */
            <div className="space-y-3">
              {/* Fila de acciones: Editar + Quitar lado a lado */}
              {!editMode && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {onToggleDestacado && (
                      <button
                        type="button"
                        title={publishedProduct?.destacado ? 'Quitar de destacados (Los más vendidos)' : 'Marcar como destacado (Los más vendidos)'}
                        onClick={() => onToggleDestacado(product.hermes_id, !publishedProduct?.destacado)}
                        disabled={loading}
                        className={`flex items-center justify-center rounded-sm border px-3 py-2.5 text-sm transition disabled:opacity-40 ${
                          publishedProduct?.destacado
                            ? 'border-[#c9a96e] bg-[#a68a5c]/10 text-[#c9a96e]'
                            : 'border-neutral-200 text-neutral-300 hover:border-[#a68a5c]/50 hover:text-[#a68a5c]'
                        }`}
                      >
                        ★
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-[#a68a5c]/30 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a68a5c]/70 transition hover:border-[#a68a5c]/60 hover:text-[#a68a5c] disabled:opacity-40"
                        onClick={openEditMode}
                        disabled={loading}
                      >
                        <FiEdit2 size={13} /> Editar
                      </button>
                    )}
                    {onToggleActivo && (
                      <button
                        className={`flex flex-1 items-center justify-center gap-2 rounded-sm border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition disabled:opacity-40 ${
                          isActivo
                            ? 'border-amber-200 text-amber-600/70 hover:border-amber-400 hover:text-amber-700'
                            : 'border-green-200 text-green-600/70 hover:border-green-400 hover:text-green-700'
                        }`}
                        onClick={() => onToggleActivo(product.hermes_id, !isActivo)}
                        disabled={loading}
                      >
                        {loading ? <Spinner size={13} colorClass="border-current" /> : null}
                        {isActivo ? 'Ocultar' : 'Activar'}
                      </button>
                    )}
                  </div>
                  {/* Eliminar con confirmación */}
                  {!confirmDelete ? (
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-sm border border-red-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-400/60 transition hover:border-red-300 hover:text-red-500 disabled:opacity-40"
                      onClick={() => setConfirmDelete(true)}
                      disabled={loading}
                    >
                      <FiTrash2 size={12} /> Eliminar definitivamente
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2">
                      <span className="flex-1 text-xs text-red-600">¿Eliminar y perder foto y descripción?</span>
                      <button
                        className="rounded-sm bg-red-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-600 disabled:opacity-40"
                        onClick={() => { onDelete(product.hermes_id); setConfirmDelete(false); }}
                        disabled={loading}
                      >
                        Sí, eliminar
                      </button>
                      <button
                        className="rounded-sm border border-neutral-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 transition hover:text-neutral-800"
                        onClick={() => setConfirmDelete(false)}
                        disabled={loading}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Formulario de edición */}
              {editMode && (
                <div className="rounded-sm border border-[#a68a5c]/20 bg-neutral-50 p-3 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Descripción</label>
                    <textarea
                      className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 resize-none focus:border-[#a68a5c]/50 focus:outline-none transition"
                      rows={3}
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-oferta-${product.hermes_id}`}
                        checked={editEnOferta}
                        onChange={e => { setEditEnOferta(e.target.checked); if (!e.target.checked) setEditDescuento(""); }}
                        disabled={loading}
                        className="h-3.5 w-3.5 accent-[#a68a5c] cursor-pointer"
                      />
                      <label htmlFor={`edit-oferta-${product.hermes_id}`} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 cursor-pointer select-none">
                        En oferta
                      </label>
                    </div>
                    {editEnOferta && (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <input
                          type="number" min={1} max={99} step={1} placeholder="%"
                          value={editDescuento}
                          onChange={e => setEditDescuento(e.target.value)}
                          disabled={loading}
                          className="w-16 rounded-sm border border-[#a68a5c]/30 bg-neutral-50 px-2 py-1.5 text-xs text-[#c9a96e] text-center placeholder-neutral-400 focus:border-[#a68a5c]/60 focus:outline-none transition"
                        />
                        <span className="text-[11px] text-neutral-400">% desc.</span>
                        {editDescuento && Number(editDescuento) > 0 && (
                          <span className="text-[11px] font-semibold text-[#c9a96e]">
                            = ${Math.round(Number(product.precio) * (1 - Number(editDescuento) / 100)).toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-[#a68a5c] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a68a5c] transition hover:bg-[#a68a5c]/10 disabled:opacity-40"
                      onClick={handleEditSubmit}
                      disabled={loading}
                    >
                      {loading ? <Spinner size={12} colorClass="border-current" /> : <FiCheck size={13} />} Guardar
                    </button>
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-neutral-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 transition hover:text-neutral-800 disabled:opacity-40"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                    >
                      <FiX size={13} /> Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Imágenes del producto */}
              {publishedProductId && (
                loadingImages ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Spinner size={12} colorClass="border-[#8f7a58]" /> Cargando imágenes...
                  </div>
                ) : (
                  <AdminProductImages
                    productId={publishedProductId}
                    images={existingImages}
                    onImagesChange={setExistingImages}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default HermesProductItem;

import React, { useState } from "react";
import { FiTrash2, FiEdit2, FiX, FiCheck } from "react-icons/fi";
import Spinner from "../../components/Spinner";
import type { HermesProduct } from "../../../hooks/useHermesProducts";
import type { ProductoPublicado } from "../../../types";

interface HermesProductItemProps {
  product: HermesProduct;
  isPublished: (hermes_id: number) => boolean;
  publishedProduct?: ProductoPublicado;
  selectedImage: { [hermes_id: number]: File | null };
  setSelectedImage: React.Dispatch<React.SetStateAction<{ [hermes_id: number]: File | null }>>;
  loading: boolean;
  onPublish: (product: HermesProduct, description: string, enOferta: boolean, descuentoPorcentaje: number | null) => void;
  onUnpublish: (hermes_id: number) => void;
  onEdit: (hermes_id: number, description: string, enOferta: boolean, descuentoPorcentaje: number | null, newImage: File | null) => void;
}

const HermesProductItem: React.FC<HermesProductItemProps> = ({
  product,
  isPublished,
  publishedProduct,
  selectedImage,
  setSelectedImage,
  loading,
  onPublish,
  onUnpublish,
  onEdit,
}) => {
  const [customDescription, setCustomDescription] = useState("");
  const [enOferta, setEnOferta] = useState(false);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editEnOferta, setEditEnOferta] = useState(false);
  const [editDescuento, setEditDescuento] = useState<string>("");
  const [editImage, setEditImage] = useState<File | null>(null);

  const hasValidHermesId = Number.isFinite(product.hermes_id) && Number.isInteger(product.hermes_id);
  const imagePreview = selectedImage[product.hermes_id];
  const published = isPublished(product.hermes_id);
  const stock = Number(product.stock);
  const hasStock = Number.isFinite(stock) && stock > 0;

  const openEditMode = () => {
    setEditDescription(publishedProduct?.descripcion ?? "");
    setEditEnOferta(publishedProduct?.en_oferta ?? false);
    setEditDescuento(publishedProduct?.descuento_porcentaje != null ? String(publishedProduct.descuento_porcentaje) : "");
    setEditImage(null);
    setEditMode(true);
  };

  const handleEditSubmit = () => {
    const pct = editEnOferta && editDescuento ? Number(editDescuento) : null;
    onEdit(product.hermes_id, editDescription, editEnOferta, pct, editImage);
    setEditMode(false);
  };

  return (
    <li className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-4 transition hover:border-[#beb9b1]/20 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium text-[#f5efe3] flex items-center gap-2 text-base">
          {product.nombre}
          </div>
          {published && (
            <span className="rounded-sm bg-[#a68a5c]/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">Publicado</span>
          )}
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${hasStock ? 'bg-[#a68a5c]/15 text-[#beb9b1]/70' : 'bg-[#beb9b1]/10 text-[#beb9b1]/40'}`}>
            {hasStock ? `Stock ${stock}` : 'Sin stock'}
          </span>
          {product.grupo ? (
            <span className="rounded-sm bg-[#beb9b1]/10 px-2.5 py-1 text-[11px] font-medium text-[#beb9b1]/60">
              {product.grupo}
            </span>
          ) : null}
        </div>
        <div className="mt-2 text-sm leading-6 text-[#beb9b1]/50">{product.descripcion}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#beb9b1]/60">
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

      <div className="flex flex-col gap-3 xl:min-w-[280px] xl:max-w-[320px]">
        {!published ? (
          <>
            <div className="rounded-sm border border-dashed border-[#beb9b1]/20 bg-[#1a1a1a]/30 p-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/50 mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/40 px-3 py-2 text-xs text-[#f5efe3] placeholder-[#beb9b1]/30 resize-none focus:border-[#a68a5c]/50 focus:outline-none transition disabled:opacity-40"
                  rows={3}
                  placeholder="Descripción del producto para la tienda..."
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  disabled={!hasValidHermesId || loading}
                />
              </div>
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
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 cursor-pointer select-none"
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
                      className="w-20 rounded-sm border border-[#a68a5c]/30 bg-[#1a1a1a]/40 px-2 py-1.5 text-xs text-[#c9a96e] text-center placeholder-[#beb9b1]/30 focus:border-[#a68a5c]/60 focus:outline-none transition disabled:opacity-40"
                    />
                    <span className="text-[11px] text-[#beb9b1]/50">% descuento</span>
                    {descuentoPorcentaje && Number(descuentoPorcentaje) > 0 && (
                      <span className="ml-1 text-[11px] font-semibold text-[#c9a96e]">
                        = ${Math.round(Number(product.precio) * (1 - Number(descuentoPorcentaje) / 100)).toLocaleString('es-AR')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <label className={`flex cursor-pointer items-center justify-center rounded-sm px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition ${hasValidHermesId ? 'border border-[#beb9b1]/20 text-[#beb9b1]/60 hover:text-[#beb9b1]' : 'cursor-not-allowed border border-[#beb9b1]/10 text-[#beb9b1]/30'}`}>
                Seleccionar imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!hasValidHermesId || loading}
                  onChange={e => setSelectedImage(prev => ({ ...prev, [product.hermes_id]: e.target.files?.[0] || null }))}
                />
              </label>
              {imagePreview instanceof File ? (
                <div className="mt-3 flex items-center gap-3 rounded-sm bg-[#1a1a1a]/30 p-2">
                  <img
                    src={URL.createObjectURL(imagePreview)}
                    alt="Previalización"
                    className="h-14 w-14 rounded-sm object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#f5efe3]">{imagePreview.name}</p>
                    <p className="text-xs text-[#beb9b1]/50">Imagen lista para publicar</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#beb9b1]/40">Cargá una imagen para publicar este producto.</p>
              )}
            </div>
            <button
              className={`group relative flex items-center justify-center overflow-hidden gap-2 rounded-sm px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] transition ${hasValidHermesId ? 'border border-[#a68a5c] text-[#a68a5c] hover:text-[#3c3c3b]' : 'cursor-not-allowed border border-[#beb9b1]/10 text-[#beb9b1]/30'}`}
              onClick={() => {
                const pct = enOferta && descuentoPorcentaje ? Number(descuentoPorcentaje) : null;
                onPublish(product, customDescription, enOferta, pct);
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
        ) : editMode ? (
          <div className="rounded-sm border border-[#a68a5c]/30 bg-[#1a1a1a]/40 p-3 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a96e]">Editar publicación</p>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/50 mb-1.5">
                Descripción
              </label>
              <textarea
                className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/40 px-3 py-2 text-xs text-[#f5efe3] placeholder-[#beb9b1]/30 resize-none focus:border-[#a68a5c]/50 focus:outline-none transition"
                rows={3}
                placeholder="Descripción del producto para la tienda..."
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id={`edit-oferta-${product.hermes_id}`}
                  checked={editEnOferta}
                  onChange={e => {
                    setEditEnOferta(e.target.checked);
                    if (!e.target.checked) setEditDescuento("");
                  }}
                  disabled={loading}
                  className="h-3.5 w-3.5 accent-[#a68a5c] cursor-pointer disabled:opacity-40"
                />
                <label
                  htmlFor={`edit-oferta-${product.hermes_id}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 cursor-pointer select-none"
                >
                  En oferta
                </label>
              </div>
              {editEnOferta && (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    placeholder="%"
                    value={editDescuento}
                    onChange={e => setEditDescuento(e.target.value)}
                    disabled={loading}
                    className="w-20 rounded-sm border border-[#a68a5c]/30 bg-[#1a1a1a]/40 px-2 py-1.5 text-xs text-[#c9a96e] text-center placeholder-[#beb9b1]/30 focus:border-[#a68a5c]/60 focus:outline-none transition"
                  />
                  <span className="text-[11px] text-[#beb9b1]/50">% descuento</span>
                  {editDescuento && Number(editDescuento) > 0 && (
                    <span className="ml-1 text-[11px] font-semibold text-[#c9a96e]">
                      = ${Math.round(Number(product.precio) * (1 - Number(editDescuento) / 100)).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Imagen actual */}
            {publishedProduct?.imagen_url && !editImage && (
              <div className="flex items-center gap-3 rounded-sm bg-[#1a1a1a]/30 p-2">
                <img
                  src={publishedProduct.imagen_url}
                  alt="Imagen actual"
                  className="h-12 w-12 rounded-sm object-cover"
                />
                <p className="text-xs text-[#beb9b1]/50">Imagen actual</p>
              </div>
            )}
            {editImage && (
              <div className="flex items-center gap-3 rounded-sm bg-[#1a1a1a]/30 p-2">
                <img
                  src={URL.createObjectURL(editImage)}
                  alt="Nueva imagen"
                  className="h-12 w-12 rounded-sm object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#f5efe3]">{editImage.name}</p>
                  <p className="text-xs text-[#beb9b1]/50">Nueva imagen seleccionada</p>
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-center rounded-sm border border-[#beb9b1]/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 transition hover:text-[#beb9b1]">
              {editImage ? 'Cambiar imagen' : 'Reemplazar imagen'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading}
                onChange={e => setEditImage(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="flex gap-2">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-[#a68a5c]/50 bg-[#a68a5c]/10 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#c9a96e] transition hover:bg-[#a68a5c]/20 disabled:opacity-50"
                onClick={handleEditSubmit}
                disabled={loading}
              >
                {loading ? <Spinner size={13} colorClass="border-current" /> : <FiCheck size={13} />}
                Guardar
              </button>
              <button
                className="flex items-center justify-center gap-1.5 rounded-sm border border-[#beb9b1]/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/50 transition hover:text-[#beb9b1] disabled:opacity-50"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                <FiX size={13} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-[#a68a5c]/30 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 transition hover:border-[#a68a5c]/60 hover:text-[#c9a96e] disabled:opacity-50"
              onClick={openEditMode}
              disabled={loading}
            >
              <FiEdit2 size={13} />
              Editar
            </button>
            <button
              className="flex items-center justify-center rounded-sm border border-[#d03416]/20 p-2.5 text-[#d03416]/50 transition hover:border-[#d03416]/50 hover:text-[#d03416] disabled:opacity-50"
              onClick={() => onUnpublish(product.hermes_id)}
              disabled={loading}
              title="Quitar de la tienda"
            >
              {loading ? <Spinner size={14} colorClass="border-current" /> : <FiTrash2 size={15} />}
            </button>
          </div>
        )}
      </div>
      </div>
    </li>
  );
};

export default HermesProductItem;

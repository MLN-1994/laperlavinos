import React from "react";
import Spinner from "../../components/Spinner";
import type { HermesProduct } from "../../../hooks/useHermesProducts";

interface HermesProductItemProps {
  product: HermesProduct;
  isPublished: (hermes_id: number) => boolean;
  selectedImage: { [hermes_id: number]: File | null };
  setSelectedImage: React.Dispatch<React.SetStateAction<{ [hermes_id: number]: File | null }>>;
  loading: boolean;
  onPublish: (product: HermesProduct) => void;
  onUnpublish: (hermes_id: number) => void;
}

const HermesProductItem: React.FC<HermesProductItemProps> = ({
  product,
  isPublished,
  selectedImage,
  setSelectedImage,
  loading,
  onPublish,
  onUnpublish,
}) => {
  const hasValidHermesId = Number.isFinite(product.hermes_id) && Number.isInteger(product.hermes_id);
  const imagePreview = selectedImage[product.hermes_id];
  const published = isPublished(product.hermes_id);
  const stock = Number(product.stock);
  const hasStock = Number.isFinite(stock) && stock > 0;

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
            <div className="rounded-sm border border-dashed border-[#beb9b1]/20 bg-[#1a1a1a]/30 p-3">
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
              onClick={() => onPublish(product)}
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
          <button
            className="flex items-center justify-center gap-2 rounded-sm border border-[#d03416]/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#d03416]/60 transition hover:border-[#d03416]/50 hover:text-[#d03416]"
            onClick={() => onUnpublish(product.hermes_id)}
            disabled={loading}
          >
            {loading ? <Spinner size={14} colorClass="border-current" /> : null}
            Quitar
          </button>
        )}
      </div>
      </div>
    </li>
  );
};

export default HermesProductItem;

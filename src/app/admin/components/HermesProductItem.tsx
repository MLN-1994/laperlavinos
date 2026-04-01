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
    <li className="rounded-[24px] border border-[#e5d8c7] bg-[#fffdf9] p-4 shadow-sm transition hover:border-[#cfbea6] hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium text-slate-900 flex items-center gap-2 text-base">
          {product.nombre}
          </div>
          {published && (
            <span className="rounded-full bg-[#e8ede7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52614f]">Publicado</span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${hasStock ? 'bg-[#f2e8d9] text-[#7a6648]' : 'bg-slate-200 text-slate-600'}`}>
            {hasStock ? `Stock ${stock}` : 'Sin stock'}
          </span>
          {product.grupo ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {product.grupo}
            </span>
          ) : null}
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-500">{product.descripcion}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-[#f4ece0] px-3 py-1 font-semibold text-[#6f5c40]">
            ${Number(product.precio).toLocaleString('es-AR')}
          </span>
          {product.marca ? <span>Marca: {product.marca}</span> : null}
        </div>
        {!hasValidHermesId && (
          <div className="mt-3 text-xs font-medium text-amber-700">
            Este producto no se puede publicar en la tienda.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 xl:min-w-[280px] xl:max-w-[320px]">
        {!published ? (
          <>
            <div className="rounded-2xl border border-dashed border-[#d5c8b6] bg-[#faf6ef] p-3">
              <label className={`flex cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${hasValidHermesId ? 'bg-[#ede4d8] text-[#54473a] hover:bg-[#e2d5c4]' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}>
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
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-2 shadow-sm">
                  <img
                    src={URL.createObjectURL(imagePreview)}
                    alt="Previsualización"
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{imagePreview.name}</p>
                    <p className="text-xs text-slate-500">Imagen lista para publicar</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">Cargá una imagen para publicar este producto.</p>
              )}
            </div>
            <button
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${hasValidHermesId ? 'bg-[#312c28] text-[#f7f0e2] hover:bg-[#403932]' : 'cursor-not-allowed bg-slate-300 text-slate-500'}`}
              onClick={() => onPublish(product)}
              disabled={loading || !hasValidHermesId}
            >
              {loading ? <Spinner size={16} colorClass="border-white" /> : null}
              Publicar
            </button>
          </>
        ) : (
          <button
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#dbc7c4] bg-[#f8efee] px-4 py-3 text-sm font-semibold text-[#8b5a53] transition hover:bg-[#f3e7e6]"
            onClick={() => onUnpublish(product.hermes_id)}
            disabled={loading}
          >
            {loading ? <Spinner size={16} colorClass="border-white" /> : null}
            Quitar
          </button>
        )}
      </div>
      </div>
    </li>
  );
};

export default HermesProductItem;

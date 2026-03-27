import React from "react";
import Spinner from "../../components/Spinner";

interface HermesProductItemProps {
  product: any;
  isPublished: (hermes_id: number) => boolean;
  selectedImage: { [hermes_id: number]: File | null };
  setSelectedImage: React.Dispatch<React.SetStateAction<{ [hermes_id: number]: File | null }>>;
  loading: boolean;
  onPublish: (product: any) => void;
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
  return (
    <li className="py-4 flex flex-col md:flex-row md:items-center md:gap-4">
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
              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
              onClick={() => onPublish(product)}
              disabled={loading}
            >
              {loading ? <Spinner size={16} colorClass="border-white" /> : null}
              Publicar
            </button>
          </>
        ) : (
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center justify-center gap-2"
            onClick={() => onUnpublish(product.hermes_id)}
            disabled={loading}
          >
            {loading ? <Spinner size={16} colorClass="border-white" /> : null}
            Quitar
          </button>
        )}
      </div>
    </li>
  );
};

export default HermesProductItem;

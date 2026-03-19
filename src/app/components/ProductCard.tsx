import { useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

type ProductoPublicado = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  categoria_id?: string;
};

interface ProductCardProps {
  product: ProductoPublicado;
  addToCart: (product: ProductoPublicado) => void;
}

export default function ProductCard({ product, addToCart }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 transition-all duration-300 hover:shadow-md hover:border-blue-100">
      
      {/* Imagen Compacta */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <img
          src={product.imagen_url || "/placeholder.png"}
          alt={product.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badge Mini */}
        <div className="absolute top-1.5 left-1.5">
          <span className="inline-flex items-center rounded-md bg-white/80 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-gray-700 shadow-sm ring-1 ring-black/5">
            {product.categoria_id || "Nuevo"}
          </span>
        </div>
      </div>

      {/* Información Densa */}
      <div className="flex flex-1 flex-col px-1 py-2">
        <div className="flex-1">
          <h3 className="text-[13px] font-bold leading-tight text-gray-800 line-clamp-1 group-hover:text-blue-600">
            {product.nombre}
          </h3>
          <p className="mt-0.5 text-[10px] leading-3 text-gray-400 line-clamp-2">
            {product.descripcion}
          </p>
        </div>

        {/* Footer de Card Minimalista */}
        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-gray-900 leading-none">
              ${product.precio.toLocaleString("es-AR")}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isAdded}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
              isAdded
                ? "bg-green-500 text-white"
                : "bg-gray-50 text-gray-900 hover:bg-blue-600 hover:text-white"
            }`}
          >
            {isAdded ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <ShoppingCartIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
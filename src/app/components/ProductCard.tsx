import { useState } from "react";
import Link from "next/link";
import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

type ProductoPublicado = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  categoria_id?: string;
  en_oferta?: boolean | null;
  descuento_porcentaje?: number | null;
};

interface ProductCardProps {
  product: ProductoPublicado;
  addToCart: (product: ProductoPublicado) => void;
}

export default function ProductCard({ product, addToCart }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const enOferta = product.en_oferta === true && (product.descuento_porcentaje ?? 0) > 0;
  const precioFinal = enOferta
    ? Math.round(product.precio * (1 - (product.descuento_porcentaje ?? 0) / 100))
    : product.precio;

  const handleAdd = () => {
    addToCart({ ...product, precio: precioFinal });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white p-2 transition-all duration-500 hover:border-neutral-400 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]">

      {/* Imagen con overlay hover */}
      <Link href={`/producto/${product.id}`} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-neutral-100">
        <img
          src={product.imagen_url || "/placeholder.png"}
          alt={product.nombre}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Degradado inferior en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Botón "Ver producto" centrado en hover */}
        <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="border border-white/80 bg-black/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm">
            Ver producto
          </span>
        </div>

        {/* Badge oferta */}
        {enOferta && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center bg-[#c0392b] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white shadow-xl">
              -{product.descuento_porcentaje}%
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col px-1 py-3">
        <div className="flex-1">
          <Link href={`/producto/${product.id}`} target="_blank" rel="noopener noreferrer">
            <h3
              className="text-[13px] font-serif leading-snug tracking-tight text-neutral-800 line-clamp-2 group-hover:text-neutral-600 transition-colors"
              title={product.nombre}
            >
              {product.nombre}
            </h3>
          </Link>
        </div>

        {/* Footer: Precio y Botón */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex flex-col">
            {enOferta && (
              <span className="text-[11px] font-light line-through text-neutral-400">
                ${product.precio.toLocaleString("es-AR")}
              </span>
            )}
            <span className={`font-serif text-[15px] font-light tracking-tight ${enOferta ? 'text-[#c0392b]' : 'text-neutral-700'}`}>
              ${precioFinal.toLocaleString("es-AR")}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isAdded}
            aria-label="Agregar al carrito"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ease-out shadow-sm
              ${isAdded
                ? "bg-neutral-800 border-neutral-800 scale-110"
                : "bg-transparent border-neutral-300 text-neutral-600 hover:bg-neutral-800 hover:text-white hover:border-neutral-800"
              }`}
          >
            <div className={`absolute transition-all duration-300 ${isAdded ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}>
              <ShoppingCartIcon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className={`absolute transition-all duration-500 ${isAdded ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45"}`}>
              <CheckIcon className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            {isAdded && (
              <span className="absolute inset-0 rounded-full animate-ping bg-neutral-400/30" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
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
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[#3c3c3b]/40 backdrop-blur-md p-2 transition-all duration-500 hover:border-[#a68a5c]/40 hover:bg-[#3c3c3b]/60">
      
      {/* Imagen con Overlay de Lujo */}
      <Link href={`/producto/${product.id}`} target="_blank" rel="noopener noreferrer" className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-[#1a1a1a]">
        <img
          src={product.imagen_url || "/placeholder.png"}
          alt={product.nombre}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Badge Elegante */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center bg-[#a68a5c] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white shadow-xl">
            {product.categoria_id || "Exclusivo"}
          </span>
        </div>
      </Link>

      {/* Información con tipografía cuidada */}
      <div className="flex flex-1 flex-col px-1 py-3">
        <div className="flex-1">
          <Link href={`/producto/${product.id}`} target="_blank" rel="noopener noreferrer">
            <h3 className="text-[14px] font-serif tracking-tight text-[#beb9b1] line-clamp-1 group-hover:text-[#a68a5c] transition-colors">
              {product.nombre}
            </h3>
          </Link>
          <p className="mt-1 text-[11px] leading-4 text-[#beb9b1]/50 line-clamp-2 italic">
            {product.descripcion}
          </p>
        </div>

        {/* Footer: Precio y Botón */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#beb9b1]/5">
          <div className="flex flex-col">
            <span className="text-[16px] font-light text-[#a68a5c] tracking-tighter">
              ${product.precio.toLocaleString("es-AR")}
            </span>
          </div>

          <button
  onClick={handleAdd}
  disabled={isAdded}
  className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ease-out shadow-lg
    ${isAdded 
      ? "bg-[#a68a5c] border-[#a68a5c] scale-110 shadow-[#a68a5c]/20" 
      : "bg-transparent border-[#a68a5c]/40 text-[#a68a5c] hover:bg-[#a68a5c] hover:text-[#3c3c3b] hover:border-[#a68a5c]"
    }`}
>
  {/* Icono del Carrito (Desaparece con fade y escala) */}
  <div className={`absolute transition-all duration-300 ${isAdded ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}>
    <ShoppingCartIcon className="h-4 w-4" strokeWidth={1.5} />
  </div>

  {/* Icono de Check (Aparece con rotación y escala) */}
  <div className={`absolute transition-all duration-500 ${isAdded ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45"}`}>
    <CheckIcon className="h-5 w-5 text-[#3c3c3b]" strokeWidth={2.5} />
  </div>

  {/* Anillo de expansión (Efecto visual de "click" premium) */}
  {isAdded && (
    <span className="absolute inset-0 rounded-full animate-ping bg-[#a68a5c]/30" />
  )}
</button>
        </div>
      </div>
    </div>
  );
}
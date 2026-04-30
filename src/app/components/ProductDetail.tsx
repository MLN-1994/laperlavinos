"use client";

import { useState } from "react";
import { HiOutlineShoppingCart, HiOutlineCheckCircle, HiMinus, HiPlus, HiArrowLeft } from "react-icons/hi2";
import { useCartStore } from "../../store/useCartStore";
import { useRouter } from "next/navigation";
import { ProductoPublicado } from "../../types";

interface ProductDetailProps {
  product: ProductoPublicado;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.nombre,
        price: product.precio,
        description: product.descripcion ?? "",
        image: product.imagen_url ?? "/placeholder.png",
        category: product.categoria_id ?? "",
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => q + 1);

  return (
    <section className="min-h-screen bg-[#1c1a17] px-4 py-10 sm:px-8 lg:px-16">
      {/* Volver */}
      <button
        onClick={handleBack}
        className="mb-8 inline-flex items-center gap-2 text-[#beb9b1]/60 hover:text-[#a68a5c] transition-colors text-sm tracking-wide"
      >
        <HiArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[#111]">
          <img
            src={product.imagen_url || "/placeholder.png"}
            alt={product.nombre}
            className="h-full w-full object-cover opacity-90"
          />
          {product.categoria_id && (
            <span className="absolute top-4 left-4 bg-[#a68a5c] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-xl">
              {product.categoria_id}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            {product.marca && (
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#a68a5c]">
                {product.marca}
              </p>
            )}
            <h1 className="font-serif text-3xl font-light leading-snug text-[#e8e3da] sm:text-4xl">
              {product.nombre}
            </h1>
            <div className="mt-5 border-t border-[#beb9b1]/10 pt-5">
              <p className="text-sm leading-relaxed text-[#beb9b1]/70 italic">
                {product.descripcion}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Precio */}
            <div>
              <span className="text-4xl font-light text-[#a68a5c] tracking-tight">
                ${product.precio.toLocaleString("es-AR")}
              </span>
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-[#beb9b1]/50">
                Cantidad
              </span>
              <div className="flex items-center gap-3 rounded-full border border-[#beb9b1]/15 bg-[#2a2622] px-4 py-2">
                <button
                  onClick={decrease}
                  className="text-[#beb9b1]/60 hover:text-[#a68a5c] transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <HiMinus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-medium text-[#e8e3da]">
                  {quantity}
                </span>
                <button
                  onClick={increase}
                  className="text-[#beb9b1]/60 hover:text-[#a68a5c] transition-colors"
                >
                  <HiPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Botón añadir */}
            <button
              onClick={handleAdd}
              disabled={added}
              className={`relative flex w-full items-center justify-center gap-3 rounded-sm border py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-500 shadow-lg
                ${added
                  ? "border-[#a68a5c] bg-[#a68a5c]/20 text-[#a68a5c] scale-[0.99]"
                  : "border-[#a68a5c]/50 bg-transparent text-[#e8e3da] hover:bg-[#a68a5c] hover:border-[#a68a5c] hover:text-[#1c1a17]"
                }`}
            >
              <span
                className={`absolute flex items-center gap-2 transition-all duration-300 ${added ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              >
                <HiOutlineCheckCircle className="h-5 w-5" />
                Agregado al carrito
              </span>
              <span
                className={`flex items-center gap-2 transition-all duration-300 ${added ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
              >
                <HiOutlineShoppingCart className="h-5 w-5" />
                Añadir al carrito
              </span>
            </button>

            {product.stock != null && product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-amber-400/80 tracking-wide">
                ¡Solo quedan {product.stock} unidades!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


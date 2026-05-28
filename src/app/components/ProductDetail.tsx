"use client";

import { useState } from "react";
import { HiOutlineShoppingCart, HiOutlineCheckCircle, HiMinus, HiPlus, HiArrowLeft } from "react-icons/hi2";
import { SiMercadopago, SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import { MapPinIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "../../store/useCartStore";
import { useRouter } from "next/navigation";
import { ProductoPublicado, ProductImage } from "../../types";

interface ProductDetailProps {
  product: ProductoPublicado;
  images?: ProductImage[];
}

export default function ProductDetail({ product, images = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const router = useRouter();

  const enOferta = product.en_oferta === true && (product.descuento_porcentaje ?? 0) > 0;
  const precioFinal = enOferta
    ? Math.round(product.precio * (1 - (product.descuento_porcentaje ?? 0) / 100))
    : product.precio;

  // Galería: combinar imagen_url principal con las imágenes adicionales
  const allImages: string[] = images.length > 0
    ? images.sort((a, b) => a.orden - b.orden).map((img) => img.url)
    : [product.imagen_url ?? "/placeholder.png"];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = allImages[activeIdx] ?? "/placeholder.png";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/productos');
    }
  };

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.nombre,
        price: precioFinal,
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
    <section className="min-h-screen bg-[#F5EFE6] px-4 py-10 sm:px-8 lg:px-16">
      {/* Volver */}
      <button
        onClick={handleBack}
        className="mb-8 inline-flex items-center gap-2 text-neutral-400 hover:text-[#a68a5c] transition-colors text-sm tracking-wide"
      >
        <HiArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Galería estilo ML: miniaturas izquierda + imagen principal */}
        <div className="flex gap-3">
          {/* Columna de miniaturas (solo si hay más de 1) */}
          {allImages.length > 1 && (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-0.5">
              {allImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`flex-shrink-0 h-16 w-16 overflow-hidden rounded-sm border-2 transition-all ${
                    idx === activeIdx
                      ? 'border-[#a68a5c]'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Vista ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Imagen principal */}
          <div className="relative flex-1 aspect-[4/5] overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100">
            <img
              key={activeImage}
              src={activeImage}
              alt={product.nombre}
              className="h-full w-full object-cover opacity-90 transition-opacity duration-300"
            />
            {product.categoria_id && (
              <span className="absolute top-4 left-4 bg-[#a68a5c] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-xl">
                {product.categoria_id}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            {product.marca && (
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#a68a5c]">
                {product.marca}
              </p>
            )}
            <h1 className="font-serif text-3xl font-light leading-snug text-neutral-800 sm:text-4xl">
              {product.nombre}
            </h1>
            <div className="mt-5 border-t border-neutral-200 pt-5">
              <p className="text-sm leading-relaxed text-neutral-500 italic whitespace-pre-line">
                {product.descripcion}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Precio */}
            <div className="flex items-end gap-3">
              {enOferta && (
                <span className="text-lg font-light line-through text-neutral-400">
                  ${product.precio.toLocaleString("es-AR")}
                </span>
              )}
              <span className={`text-4xl font-light tracking-tight ${enOferta ? 'text-[#c0392b]' : 'text-[#a68a5c]'}`}>
                ${precioFinal.toLocaleString("es-AR")}
              </span>
              {enOferta && (
                <span className="mb-1 rounded-sm bg-[#c0392b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                  -{product.descuento_porcentaje}% OFF
                </span>
              )}
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-neutral-400">
                Cantidad
              </span>
              <div className="flex items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 shadow-sm">
                <button
                  onClick={decrease}
                  className="text-neutral-400 hover:text-[#a68a5c] transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <HiMinus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-medium text-neutral-800">
                  {quantity}
                </span>
                <button
                  onClick={increase}
                  className="text-neutral-400 hover:text-[#a68a5c] transition-colors"
                >
                  <HiPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Botón añadir */}
            <button
              onClick={handleAdd}
              disabled={added}
              className={`relative flex w-full items-center justify-center gap-3 rounded-sm border py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-500 shadow-sm
                ${added
                  ? "border-[#a68a5c] bg-[#a68a5c]/10 text-[#a68a5c] scale-[0.99]"
                  : "border-neutral-800 bg-neutral-900 text-neutral-100 hover:bg-[#a68a5c] hover:border-[#a68a5c] hover:text-neutral-900"
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
              <p className="text-xs text-amber-600 tracking-wide">
                ¡Solo quedan {product.stock} unidades!
              </p>
            )}

            {/* Formas de pago y envíos */}
            <div className="mt-2 border-t border-neutral-200 pt-5 space-y-4">
              {/* Formas de pago */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Formas de pago</p>
                <div className="space-y-2">
                  {/* Transferencia */}
                  <div className="flex items-center gap-2 rounded-sm border border-[#a68a5c]/40 bg-[#a68a5c]/5 px-3 py-2">
                    <span className="text-xs font-semibold text-[#a68a5c] tracking-wide">Transferencia bancaria</span>
                    <span className="ml-auto rounded bg-[#a68a5c] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">10% OFF</span>
                  </div>
                  {/* Mercado Pago */}
                  <div className="flex items-center gap-2 rounded-sm border border-[#009ee3]/30 bg-[#009ee3]/5 px-3 py-2">
                    <SiMercadopago className="h-4 w-4 text-[#009ee3] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#009ee3] tracking-wide">Mercado Pago</span>
                  </div>
                  {/* Tarjetas */}
                  <div className="flex items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <span className="text-xs text-neutral-600 font-medium">Tarjetas / Débito</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <SiVisa className="h-4 w-auto text-[#1a1f71]" title="Visa" />
                      <SiMastercard className="h-4 w-auto text-[#eb001b]" title="Mastercard" />
                      <SiAmericanexpress className="h-4 w-auto text-[#2e77bc]" title="American Express" />
                      {["Cabal", "Naranja"].map((b) => (
                        <span key={b} className="rounded border border-neutral-200 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-neutral-400">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Envío */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Envío y retiro</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <MapPinIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-xs text-neutral-600">Envío a domicilio — <span className="font-medium">Andreani</span></span>
                  </div>
                  <div className="flex items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <BuildingStorefrontIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-xs text-neutral-600">Retiro en local — <span className="font-medium">Pilmaiquén 292, Bahía Blanca</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


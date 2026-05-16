'use client';

import Link from 'next/link';
import { usePublishedProducts } from '../../hooks/usePublishedProducts';
import { useCartStore } from '../../store/useCartStore';
import ProductCard from './ProductCard';

export default function MasVendidos() {
  const { productos, loading } = usePublishedProducts();
  const addToCart = useCartStore((s) => s.addToCart);

  // Muestra hasta 4 productos marcados como destacado.
  // Si ninguno tiene el flag, muestra los primeros 4 publicados como fallback.
  const starred = productos.filter((p) => p.destacado === true);
  const featured = (starred.length > 0 ? starred : productos).slice(0, 4);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.12em] text-[#1A120B]">
          Los más vendidos
        </h2>
        <Link
          href="/productos"
          className="text-xs font-semibold text-[#6B5744] underline-offset-2 transition-colors hover:text-[#C9A96E] hover:underline"
        >
          ver todos →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded bg-[#E8DFD0]" />
          ))}
        </div>
      ) : featured.length === 0 ? null : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={() =>
                addToCart({
                  id: product.id,
                  name: product.nombre,
                  price: product.precio,
                  description: product.descripcion,
                  image: product.imagen_url || '',
                  category: product.categoria_id || '',
                })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useCallback, useMemo, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { usePublishedProducts } from '../../hooks/usePublishedProducts';
import type { ProductoPublicado } from '../../types';
import ProductCard from './ProductCard';
import SearchBar, { type SearchFilters } from './SearchBar';

export default function ProductList() {
    const addToCart = useCartStore((state) => state.addToCart);
    const { productos, loading, error } = usePublishedProducts();
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        sortOrder: 'price-asc',
    });

    const handleSearch = useCallback((nextFilters: SearchFilters) => {
        setFilters(nextFilters);
    }, []);

    const filteredProducts = useMemo(() => {
        const searchNeedle = filters.query.trim().toLowerCase();
        const visibleProducts = productos.filter((product: ProductoPublicado) => {
            const matchesQuery =
                searchNeedle.length === 0 ||
                [product.nombre, product.descripcion, product.categoria_id, product.grupo, product.marca]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(searchNeedle);

            if (!matchesQuery) {
                return false;
            }

            return true;
        });

        return [...visibleProducts].sort((left, right) => {
            if (filters.sortOrder === 'price-desc') {
                return right.precio - left.precio;
            }

            return left.precio - right.precio;
        });
    }, [filters.query, filters.sortOrder, productos]);

    if (loading) {
        return (
            <section className="rounded-[32px] border border-[#beb9b1]/10 bg-black/20 px-6 py-20 text-center text-sm text-[#beb9b1]/70 backdrop-blur-sm">
                Cargando productos...
            </section>
        );
    }

    if (error) {
        return (
            <section className="rounded-[32px] border border-[#d97b70]/20 bg-[#4a2522]/35 px-6 py-20 text-center text-sm text-[#f0b7ae] backdrop-blur-sm">
                Error: {error}
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="rounded-[32px] border border-[#beb9b1]/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(0,0,0,0.08))] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-6 lg:p-8">
                <div className="mb-8 space-y-6 border-b border-[#beb9b1]/8 pb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a68a5c]">Tienda</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#ebe3d2]">Productos</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#beb9b1]/60">
                            Encontrá etiquetas, varietales y regalos filtrando por texto y ordenando por precio.
                        </p>
                        </div>
                        <p className="text-sm text-[#beb9b1]/60">{filteredProducts.length} visibles de {productos.length}</p>
                    </div>

                    <SearchBar
                        onSearch={handleSearch}
                        className="pt-4"
                        placeholder="Buscar..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        addToCart={() =>
                            addToCart({
                                id: product.id,
                                name: product.nombre,
                                price: product.precio,
                                description: product.descripcion,
                                image: product.imagen_url || "",
                                category: product.categoria_id || "",
                            })
                        }
                    />
                ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="rounded-[28px] border border-[#beb9b1]/10 bg-black/20 px-6 py-12 text-center text-sm text-[#beb9b1]/70 backdrop-blur-sm">
                        No encontramos productos con esos filtros. Probá ampliar la búsqueda o cambiar el orden aplicado.
                    </div>
                )}
            </div>
        </section>
    );
}


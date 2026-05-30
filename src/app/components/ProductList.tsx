"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { usePublishedProducts } from '../../hooks/usePublishedProducts';
import type { ProductoPublicado } from '../../types';
import ProductCard from './ProductCard';
import SearchBar, { type SearchFilters } from './SearchBar';
import CategoryFilter from './CategoryFilter';

export default function ProductList() {
    const addToCart = useCartStore((state) => state.addToCart);
    const { productos, loading, error } = usePublishedProducts();
    const searchParams = useSearchParams();
    const qParam = searchParams.get('q') ?? '';
    const [filters, setFilters] = useState<SearchFilters>(() => ({
        query: qParam,
        sortOrder: 'price-asc',
        minPrice: '',
        maxPrice: '',
    }));
    const [selectedGroup, setSelectedGroup] = useState<string | null>(
        () => searchParams.get('categoria'),
    );
    const initialSearchFilters = useMemo(() => ({ query: qParam }), [qParam]);
    const priceRangeLimits = useMemo(() => {
        const PRICE_MAX_CAP = 2_000_000;

        if (!productos.length) return undefined;

        const values = productos
            .map((product) => product.precio)
            .filter((price) => Number.isFinite(price));

        if (!values.length) return undefined;

        const computedMin = Math.min(...values);
        const computedMax = Math.max(...values);

        return {
            min: Math.min(computedMin, PRICE_MAX_CAP),
            max: Math.min(computedMax, PRICE_MAX_CAP),
        };
    }, [productos]);

    // Sincroniza filtros cuando cambian params de URL (navegación desde header)
    useEffect(() => {
        setSelectedGroup(searchParams.get('categoria'));
        setFilters((prev) => ({ ...prev, query: searchParams.get('q') ?? '' }));
    }, [searchParams]);

    const handleSearch = useCallback((nextFilters: SearchFilters) => {
        setFilters(nextFilters);
    }, []);

    const availableGroups = useMemo(
        () => [...new Set(productos.map((p) => p.grupo).filter(Boolean))] as string[],
        [productos],
    );

    const filteredProducts = useMemo(() => {
        const searchNeedle = filters.query.trim().toLowerCase();
        const minPriceValue = Number(filters.minPrice);
        const maxPriceValue = Number(filters.maxPrice);
        const hasMinPrice = filters.minPrice.trim() !== '' && Number.isFinite(minPriceValue);
        const hasMaxPrice = filters.maxPrice.trim() !== '' && Number.isFinite(maxPriceValue);

        const visibleProducts = productos.filter((product: ProductoPublicado) => {
            const matchesQuery =
                searchNeedle.length === 0 ||
                [product.nombre, product.descripcion, product.categoria_id, product.grupo, product.marca]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(searchNeedle);

            if (!matchesQuery) return false;

            if (selectedGroup && product.grupo?.toUpperCase() !== selectedGroup.toUpperCase()) {
                return false;
            }

            if (hasMinPrice && product.precio < minPriceValue) {
                return false;
            }

            if (hasMaxPrice && product.precio > maxPriceValue) {
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
    }, [filters.query, filters.sortOrder, filters.minPrice, filters.maxPrice, productos, selectedGroup]);

    if (loading) {
        return (
            <section className="rounded-[32px] border border-neutral-200 bg-white px-6 py-20 text-center text-sm text-neutral-400">
                Cargando productos...
            </section>
        );
    }

    if (error) {
        return (
            <section className="rounded-[32px] border border-red-200 bg-red-50 px-6 py-20 text-center text-sm text-red-500">
                Error: {error}
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <CategoryFilter
                availableGroups={availableGroups}
                selected={selectedGroup}
                onChange={setSelectedGroup}
            />
            <div className="rounded-[32px] border border-neutral-200 bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
                <div className="mb-8 space-y-6 border-b border-neutral-100 pb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <h3 className="text-xl font-semibold tracking-tight text-neutral-800">Tienda</h3>
                    </div>

                    <SearchBar
                        onSearch={handleSearch}
                        initialFilters={initialSearchFilters}
                        priceRangeLimits={priceRangeLimits}
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
                                stock: product.stock ?? null,
                            })
                        }
                    />
                ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="rounded-sm border border-[#E8DFD0] bg-[#F5EFE6] px-6 py-12 text-center text-sm text-[#9E8B7A]">
                        No encontramos productos con esos filtros. Probá ampliar la búsqueda o cambiar el orden aplicado.
                    </div>
                )}
            </div>
        </section>
    );
}


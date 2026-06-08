"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { usePublishedProducts } from '../../hooks/usePublishedProducts';
import type { ProductoPublicado } from '../../types';
import ProductCard from './ProductCard';
import SearchBar, { type TextFilters } from './SearchBar';
import CatalogFiltersPanel from './CatalogFiltersPanel';

interface CatalogFilters {
    minPrice: string;
    maxPrice: string;
}

function normalizeValue(value: string) {
    return value.trim().toLowerCase();
}

function parseBrandsFromParams(searchParams: URLSearchParams) {
    const repeated = searchParams
        .getAll('marca')
        .map((value) => value.trim())
        .filter(Boolean);

    if (repeated.length > 0) {
        return repeated;
    }

    const csv = (searchParams.get('marcas') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    return csv;
}

export default function ProductList() {
    const addToCart = useCartStore((state) => state.addToCart);
    const { productos, loading, error } = usePublishedProducts();
    const searchParams = useSearchParams();
    const qParam = searchParams.get('q') ?? '';
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const featuredSliderRef = useRef<HTMLDivElement | null>(null);
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        () => parseBrandsFromParams(searchParams),
    );
    const [textFilters, setTextFilters] = useState<TextFilters>(() => ({
        query: qParam,
    }));
    const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(() => ({
        minPrice: '',
        maxPrice: '',
    }));
    const [selectedGroup, setSelectedGroup] = useState<string | null>(
        () => searchParams.get('categoria'),
    );
    const initialSearchFilters = useMemo(
        () => ({
            query: textFilters.query,
        }),
        [textFilters.query],
    );
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
        setSelectedBrands(parseBrandsFromParams(searchParams));
        setTextFilters((prev) => ({ ...prev, query: searchParams.get('q') ?? '' }));
    }, [searchParams]);

    const handleSearch = useCallback((nextFilters: TextFilters) => {
        setTextFilters(nextFilters);
    }, []);

    const handlePriceRangeChange = useCallback((next: { minPrice: string; maxPrice: string }) => {
        setCatalogFilters((prev) => ({
            ...prev,
            minPrice: next.minPrice,
            maxPrice: next.maxPrice,
        }));
    }, []);

    const availableGroups = useMemo(
        () => [...new Set(productos.map((p) => p.grupo?.trim()).filter(Boolean))]
            .sort((left, right) => left!.localeCompare(right!, 'es', { sensitivity: 'base' })) as string[],
        [productos],
    );

    const availableBrands = useMemo(
        () => [...new Set(productos.map((p) => p.marca?.trim()).filter(Boolean))]
            .sort((left, right) => left!.localeCompare(right!, 'es', { sensitivity: 'base' })) as string[],
        [productos],
    );

    const selectedBrandSet = useMemo(
        () => new Set(selectedBrands.map(normalizeValue)),
        [selectedBrands],
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;

        if (selectedGroup) count += 1;
        if (selectedBrands.length > 0) count += selectedBrands.length;
        if (catalogFilters.minPrice.trim() !== '') count += 1;
        if (catalogFilters.maxPrice.trim() !== '') count += 1;

        return count;
    }, [selectedGroup, selectedBrands, catalogFilters.minPrice, catalogFilters.maxPrice]);

    useEffect(() => {
        if (!isMobileFiltersOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileFiltersOpen]);

    const handleClearFilters = useCallback(() => {
        setSelectedGroup(null);
        setSelectedBrands([]);
        setTextFilters({
            query: '',
        });
        setCatalogFilters({
            minPrice: '',
            maxPrice: '',
        });
    }, []);

    const filteredProducts = useMemo(() => {
        const searchNeedle = textFilters.query.trim().toLowerCase();
        const minPriceValue = Number(catalogFilters.minPrice);
        const maxPriceValue = Number(catalogFilters.maxPrice);
        const hasMinPrice = catalogFilters.minPrice.trim() !== '' && Number.isFinite(minPriceValue);
        const hasMaxPrice = catalogFilters.maxPrice.trim() !== '' && Number.isFinite(maxPriceValue);

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

            if (selectedBrandSet.size > 0) {
                const productBrand = product.marca ? normalizeValue(product.marca) : '';

                if (!productBrand || !selectedBrandSet.has(productBrand)) {
                    return false;
                }
            }

            if (hasMinPrice && product.precio < minPriceValue) {
                return false;
            }

            if (hasMaxPrice && product.precio > maxPriceValue) {
                return false;
            }

            return true;
        });

        return [...visibleProducts].sort((left, right) => left.precio - right.precio);
    }, [textFilters.query, catalogFilters.minPrice, catalogFilters.maxPrice, productos, selectedGroup, selectedBrandSet]);

    const featuredProducts = useMemo(
        () => filteredProducts.filter((product) => product.destacado === true),
        [filteredProducts],
    );

    const regularProducts = useMemo(
        () => filteredProducts.filter((product) => product.destacado !== true),
        [filteredProducts],
    );

    const scrollFeatured = useCallback((direction: 'left' | 'right') => {
        const slider = featuredSliderRef.current;
        if (!slider) return;

        const scrollAmount = Math.max(280, Math.floor(slider.clientWidth * 0.85));
        slider.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }, []);

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
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
                <div className="hidden lg:block">
                    <CatalogFiltersPanel
                        categories={availableGroups}
                        brands={availableBrands}
                        selectedCategory={selectedGroup}
                        selectedBrands={selectedBrands}
                        minPrice={catalogFilters.minPrice}
                        maxPrice={catalogFilters.maxPrice}
                        priceRangeLimits={priceRangeLimits}
                        onCategoryChange={setSelectedGroup}
                        onBrandsChange={setSelectedBrands}
                        onPriceRangeChange={handlePriceRangeChange}
                        onClearAll={handleClearFilters}
                    />
                </div>

                <div className="rounded-[32px] border border-neutral-200 bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8">
                    <div className="mb-8 space-y-6 border-b border-neutral-100 pb-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <h3 className="text-xl font-semibold tracking-tight text-neutral-800">Tienda</h3>

                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="inline-flex h-10 items-center justify-center rounded-full border border-[#D8C8AF] bg-[#F8F3EA] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5C4630] transition hover:border-[#C9A96E] hover:text-[#3A2A1D] lg:hidden"
                            >
                                Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
                            </button>
                        </div>

                        <SearchBar
                            onSearch={handleSearch}
                            initialFilters={initialSearchFilters}
                            placeholder="Buscar..."
                        />
                    </div>

                    {featuredProducts.length > 0 && (
                        <div className="mb-8 space-y-4 border-b border-[#E8DFD0] pb-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B5744]">
                                    Productos destacados
                                </h4>
                            </div>

                            <div className="group/featured relative">
                                {featuredProducts.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => scrollFeatured('left')}
                                            aria-label="Ver destacados anteriores"
                                            className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8C8AF]/80 bg-white/85 text-[#6B5744] shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm transition hover:border-[#C9A96E] hover:text-[#3A2A1D] group-hover/featured:flex lg:flex"
                                        >
                                            {'<'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => scrollFeatured('right')}
                                            aria-label="Ver siguientes destacados"
                                            className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8C8AF]/80 bg-white/85 text-[#6B5744] shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm transition hover:border-[#C9A96E] hover:text-[#3A2A1D] group-hover/featured:flex lg:flex"
                                        >
                                            {'>'}
                                        </button>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-12 bg-gradient-to-r from-white via-white/80 to-transparent lg:block" />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-12 bg-gradient-to-l from-white via-white/80 to-transparent lg:block" />
                                    </>
                                )}

                                <div
                                    ref={featuredSliderRef}
                                    className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-1 scrollbar-hide"
                                >
                                    {featuredProducts.map((product) => (
                                        <div key={product.id} className="w-[185px] min-w-[185px] snap-start sm:w-[210px] sm:min-w-[210px] lg:w-[225px] lg:min-w-[225px]">
                                            <ProductCard
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {regularProducts.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B5744]">
                                Catalogo
                            </h4>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {regularProducts.map((product) => (
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
                        </div>
                    )}

                    {filteredProducts.length === 0 && (
                        <div className="rounded-sm border border-[#E8DFD0] bg-[#F5EFE6] px-6 py-12 text-center text-sm text-[#9E8B7A]">
                            No encontramos productos con esos filtros. Proba ampliar la busqueda o cambiar el orden aplicado.
                        </div>
                    )}
                </div>
            </div>

            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Cerrar filtros"
                        className="absolute inset-0 bg-[#1B1209]/45"
                        onClick={() => setIsMobileFiltersOpen(false)}
                    />

                    <div className="absolute inset-y-0 right-0 flex w-[92%] max-w-sm flex-col bg-[#F5EFE6] p-3 shadow-[-8px_0_24px_rgba(0,0,0,0.2)]">
                        <div className="mb-3 flex items-center justify-between border-b border-[#E2D6C3] pb-3">
                            <h3 className="text-[18px] font-semibold tracking-tight text-[#3A2A1D]">Filtrar productos</h3>
                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C8AF] bg-white text-[#6B5640] transition hover:border-[#C9A96E] hover:text-[#3A2A1D]"
                                aria-label="Cerrar panel de filtros"
                            >
                                X
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
                            <CatalogFiltersPanel
                                categories={availableGroups}
                                brands={availableBrands}
                                selectedCategory={selectedGroup}
                                selectedBrands={selectedBrands}
                                minPrice={catalogFilters.minPrice}
                                maxPrice={catalogFilters.maxPrice}
                                priceRangeLimits={priceRangeLimits}
                                onCategoryChange={setSelectedGroup}
                                onBrandsChange={setSelectedBrands}
                                onPriceRangeChange={handlePriceRangeChange}
                                onClearAll={handleClearFilters}
                                showClearButton={false}
                                className="border-[#E2D6C3] shadow-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-[#E2D6C3] pt-3">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="h-10 rounded-full border border-[#D8C8AF] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B5640]"
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="h-10 rounded-full border border-[#C9A96E] bg-[#C9A96E] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3A2A1D]"
                            >
                                Ver productos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}


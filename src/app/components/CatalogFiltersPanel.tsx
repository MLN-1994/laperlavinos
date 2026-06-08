'use client';

import { useMemo, useState } from 'react';

interface CatalogFiltersPanelProps {
  categories: string[];
  brands: string[];
  selectedCategory: string | null;
  selectedBrands: string[];
  minPrice: string;
  maxPrice: string;
  priceRangeLimits?: {
    min: number;
    max: number;
  };
  onCategoryChange: (category: string | null) => void;
  onBrandsChange: (brands: string[]) => void;
  onPriceRangeChange: (next: { minPrice: string; maxPrice: string }) => void;
  onClearAll: () => void;
  showClearButton?: boolean;
  className?: string;
}

const SECTION_TITLE_CLASS =
  'mb-2 border-b border-[#C9A96E]/50 pb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#D4B278]';

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export default function CatalogFiltersPanel({
  categories,
  brands,
  selectedCategory,
  selectedBrands,
  minPrice,
  maxPrice,
  priceRangeLimits,
  onCategoryChange,
  onBrandsChange,
  onPriceRangeChange,
  onClearAll,
  showClearButton = true,
  className,
}: CatalogFiltersPanelProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [openSections, setOpenSections] = useState({
    categories: false,
    brands: false,
    price: false,
  });

  const toggleSection = (section: 'categories' | 'brands' | 'price') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const limits = useMemo(() => {
    if (!priceRangeLimits || !Number.isFinite(priceRangeLimits.min) || !Number.isFinite(priceRangeLimits.max)) {
      return null;
    }

    const min = Math.floor(Math.min(priceRangeLimits.min, priceRangeLimits.max));
    const max = Math.ceil(Math.max(priceRangeLimits.min, priceRangeLimits.max));

    if (max < min) return null;

    return { min, max };
  }, [priceRangeLimits]);

  const activeRange = useMemo(() => {
    if (!limits) return null;

    const parsedMin = Number(minPrice);
    const parsedMax = Number(maxPrice);
    const hasMin = minPrice.trim() !== '' && Number.isFinite(parsedMin);
    const hasMax = maxPrice.trim() !== '' && Number.isFinite(parsedMax);

    const nextMin = hasMin ? Math.max(limits.min, Math.min(parsedMin, limits.max)) : limits.min;
    const nextMax = hasMax ? Math.max(limits.min, Math.min(parsedMax, limits.max)) : limits.max;

    return {
      min: Math.min(nextMin, nextMax),
      max: Math.max(nextMin, nextMax),
    };
  }, [limits, minPrice, maxPrice]);

  const hasPriceRange = Boolean(limits && activeRange && limits.max > limits.min);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);

  const applyRange = (nextMin: number, nextMax: number) => {
    if (!limits) return;

    const clampedMin = Math.max(limits.min, Math.min(nextMin, nextMax));
    const clampedMax = Math.min(limits.max, Math.max(nextMin, nextMax));

    onPriceRangeChange({
      minPrice: clampedMin <= limits.min ? '' : String(clampedMin),
      maxPrice: clampedMax >= limits.max ? '' : String(clampedMax),
    });
  };

  const normalizedSelectedBrands = useMemo(
    () => new Set(selectedBrands.map(normalizeValue)),
    [selectedBrands],
  );

  const visibleBrands = useMemo(() => {
    const needle = brandSearch.trim().toLowerCase();

    const filtered = brands.filter((brand) => brand.toLowerCase().includes(needle));

    if (showAllBrands || filtered.length <= 12) {
      return filtered;
    }

    return filtered.slice(0, 12);
  }, [brands, brandSearch, showAllBrands]);

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    selectedBrands.length > 0 ||
    minPrice.trim() !== '' ||
    maxPrice.trim() !== '';

  const sectionButtonClass =
    'flex w-full items-center justify-between rounded-[12px] border border-[#E8DFD0] bg-[#F8F3EA] px-3 py-2 text-left transition hover:border-[#D5C3A6]';

  const sectionTitleClass =
    'text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7A6243]';

  const rootClassName = className ? ` ${className}` : '';

  return (
    <aside className={`rounded-[24px] border border-[#E8DFD0] bg-[#FFFFFF] p-4 text-[#4C3A28] shadow-[0_8px_24px_rgba(34,28,20,0.08)] sm:p-5${rootClassName}`}>
      <div className="mb-3 shrink-0">
        <h3 className="text-[18px] font-semibold tracking-tight text-[#3A2A1D]">Filtros</h3>
      </div>

      <div className="space-y-4">

      <section>
        <button type="button" onClick={() => toggleSection('categories')} className={sectionButtonClass}>
          <span className={sectionTitleClass}>Categorias</span>
          <span className="text-[#9E8B7A]">{openSections.categories ? '−' : '+'}</span>
        </button>

        {openSections.categories && (
          <div className="mt-2 space-y-1 pr-1">
            {categories.map((category) => {
              const checked = selectedCategory?.toUpperCase() === category.toUpperCase();

              return (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[13px] text-[#4C3A28] transition hover:bg-[#F5EFE6]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onCategoryChange(checked ? null : category)}
                    className="h-3.5 w-3.5 rounded border-[#C9A96E] bg-transparent accent-[#B89458]"
                  />
                  <span>{category}</span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <button type="button" onClick={() => toggleSection('brands')} className={sectionButtonClass}>
          <span className={sectionTitleClass}>Marcas</span>
          <span className="text-[#9E8B7A]">{openSections.brands ? '−' : '+'}</span>
        </button>

        {openSections.brands && (
          <div className="mt-2">
            <input
              type="search"
              value={brandSearch}
              onChange={(event) => {
                setBrandSearch(event.target.value);
                setShowAllBrands(false);
              }}
              placeholder="Buscar marca..."
              className="mb-2 h-9 w-full rounded-md border border-[#E2D6C3] bg-[#FCFAF6] px-3 text-[13px] text-[#4C3A28] outline-none placeholder:text-[#B5A18A] focus:border-[#C9A96E]"
              aria-label="Buscar marca en filtros"
            />

            <div className="space-y-1 pr-1">
              {visibleBrands.map((brand) => {
                const checked = normalizedSelectedBrands.has(normalizeValue(brand));

                return (
                  <label
                    key={brand}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[13px] text-[#4C3A28] transition hover:bg-[#F5EFE6]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onBrandsChange([...selectedBrands, brand]);
                          return;
                        }

                        onBrandsChange(
                          selectedBrands.filter(
                            (selectedBrand) => normalizeValue(selectedBrand) !== normalizeValue(brand),
                          ),
                        );
                      }}
                      className="h-3.5 w-3.5 rounded border-[#C9A96E] bg-transparent accent-[#B89458]"
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}

              {visibleBrands.length === 0 && (
                <p className="px-2 py-1 text-[12px] text-[#9E8B7A]">No hay marcas para esta busqueda.</p>
              )}
            </div>

            {brands.length > 12 && (
              <button
                type="button"
                onClick={() => setShowAllBrands((prev) => !prev)}
                className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8E734B] transition hover:text-[#6F583A]"
              >
                {showAllBrands ? 'Ver menos' : 'Ver mas'}
              </button>
            )}
          </div>
        )}
      </section>

      {limits && activeRange && (
        <section>
          <button type="button" onClick={() => toggleSection('price')} className={sectionButtonClass}>
            <span className={sectionTitleClass}>Rango de precio</span>
            <span className="text-[#9E8B7A]">{openSections.price ? '−' : '+'}</span>
          </button>

          {openSections.price && (
            <div className="mt-2 rounded-[14px] border border-[#E8DFD0] bg-[#FCFAF6] px-3 py-3">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[0.06em] text-[#8E734B]">
                <span>{formatPrice(activeRange.min)}</span>
                <span>{formatPrice(activeRange.max)}</span>
              </div>

              {hasPriceRange ? (
                <>
                  <div className="relative h-8">
                    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E2D6C3]" />
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#C9A96E]"
                      style={{
                        left: `${((activeRange.min - limits.min) / (limits.max - limits.min)) * 100}%`,
                        right: `${100 - ((activeRange.max - limits.min) / (limits.max - limits.min)) * 100}%`,
                      }}
                    />

                    <input
                      type="range"
                      min={limits.min}
                      max={limits.max}
                      step={1}
                      value={activeRange.min}
                      onChange={(event) => {
                        const nextMin = Number(event.target.value);
                        applyRange(Math.min(nextMin, activeRange.max), activeRange.max);
                      }}
                      className="pointer-events-none absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#B89458] [&::-webkit-slider-thumb]:bg-[#C9A96E] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#B89458] [&::-moz-range-thumb]:bg-[#C9A96E]"
                      aria-label="Precio minimo"
                    />

                    <input
                      type="range"
                      min={limits.min}
                      max={limits.max}
                      step={1}
                      value={activeRange.max}
                      onChange={(event) => {
                        const nextMax = Number(event.target.value);
                        applyRange(activeRange.min, Math.max(nextMax, activeRange.min));
                      }}
                      className="pointer-events-none absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#B89458] [&::-webkit-slider-thumb]:bg-[#C9A96E] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#B89458] [&::-moz-range-thumb]:bg-[#C9A96E]"
                      aria-label="Precio maximo"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onPriceRangeChange({ minPrice: '', maxPrice: '' })}
                    className="mt-2 rounded-[10px] border border-[#DECFB7] bg-[#FFFFFF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E734B] transition hover:border-[#C9A96E] hover:text-[#6F583A]"
                  >
                    Limpiar rango
                  </button>
                </>
              ) : (
                <p className="text-[12px] text-[#9E8B7A]">No hay rango de precios disponible.</p>
              )}
            </div>
          )}
        </section>
      )}

      </div>

      {showClearButton && (
        <div className="mt-3 shrink-0 border-t border-[#E8DFD0] pt-3">
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="h-10 w-full rounded-full border border-[#C9A96E] bg-[#C9A96E] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3A2A1D] transition hover:bg-[#D6B984] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </aside>
  );
}

'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';

export type SearchSortOrder = 'price-asc' | 'price-desc';

export interface SearchFilters {
  query: string;
  sortOrder: SearchSortOrder;
  minPrice: string;
  maxPrice: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  priceRangeLimits?: {
    min: number;
    max: number;
  };
  placeholder?: string;
  className?: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  sortOrder: 'price-asc',
  minPrice: '',
  maxPrice: '',
};

function normalizeFilters(initialFilters?: Partial<SearchFilters>): SearchFilters {
  return {
    query: initialFilters?.query ?? DEFAULT_FILTERS.query,
    sortOrder: initialFilters?.sortOrder ?? DEFAULT_FILTERS.sortOrder,
    minPrice: initialFilters?.minPrice ?? DEFAULT_FILTERS.minPrice,
    maxPrice: initialFilters?.maxPrice ?? DEFAULT_FILTERS.maxPrice,
  };
}

export default function SearchBar({
  onSearch,
  initialFilters,
  priceRangeLimits,
  placeholder = 'Encontrá tu etiqueta...',
  className,
}: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(() => normalizeFilters(initialFilters));
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [rangeSelection, setRangeSelection] = useState<{ min: number; max: number } | null>(null);
  const queryId = useId();

  const limits = useMemo(() => {
    if (!priceRangeLimits || !Number.isFinite(priceRangeLimits.min) || !Number.isFinite(priceRangeLimits.max)) {
      return null;
    }

    const min = Math.floor(Math.min(priceRangeLimits.min, priceRangeLimits.max));
    const max = Math.ceil(Math.max(priceRangeLimits.min, priceRangeLimits.max));

    if (max < min) {
      return null;
    }

    return { min, max };
  }, [priceRangeLimits]);

  const hasPriceRange = Boolean(limits && limits.max > limits.min);

  const formatPrice = useCallback((value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const applyRangeToFilters = useCallback(
    (nextRange: { min: number; max: number }) => {
      if (!limits) return;

      const clampedMin = Math.max(limits.min, Math.min(nextRange.min, nextRange.max));
      const clampedMax = Math.min(limits.max, Math.max(nextRange.min, nextRange.max));

      setRangeSelection({ min: clampedMin, max: clampedMax });
      setFilters((current) => ({
        ...current,
        minPrice: clampedMin <= limits.min ? '' : String(clampedMin),
        maxPrice: clampedMax >= limits.max ? '' : String(clampedMax),
      }));
    },
    [limits],
  );

  useEffect(() => {
    setFilters(normalizeFilters(initialFilters));
  }, [initialFilters]);

  useEffect(() => {
    if (!limits) {
      setRangeSelection(null);
      return;
    }

    const parsedMin = Number(filters.minPrice);
    const parsedMax = Number(filters.maxPrice);
    const hasMin = filters.minPrice.trim() !== '' && Number.isFinite(parsedMin);
    const hasMax = filters.maxPrice.trim() !== '' && Number.isFinite(parsedMax);

    const nextMin = hasMin ? Math.max(limits.min, Math.min(parsedMin, limits.max)) : limits.min;
    const nextMax = hasMax ? Math.max(limits.min, Math.min(parsedMax, limits.max)) : limits.max;

    setRangeSelection({
      min: Math.min(nextMin, nextMax),
      max: Math.max(nextMin, nextMax),
    });
  }, [filters.minPrice, filters.maxPrice, limits]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters.query]);

  useEffect(() => {
    onSearch({
      query: debouncedQuery,
      sortOrder: filters.sortOrder,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });
  }, [debouncedQuery, filters.sortOrder, filters.minPrice, filters.maxPrice, onSearch]);

  const rootClassName = className ? ` ${className}` : '';
  const activeRange = rangeSelection && limits
    ? rangeSelection
    : limits
      ? { min: limits.min, max: limits.max }
      : null;

  const selectedMinLabel = activeRange && limits ? formatPrice(activeRange.min) : null;
  const selectedMaxLabel = activeRange && limits ? formatPrice(activeRange.max) : null;

  return (
    <div
      className={`rounded-[26px] border border-neutral-200 bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition duration-500 sm:p-3.5${rootClassName}`}
      aria-label="Filtros de búsqueda"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <svg className="h-[20px] w-[20px] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
          </span>
          <input
            id={queryId}
            type="search"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder={placeholder}
            className="h-[48px] w-full rounded-[18px] border border-neutral-200 bg-white py-3 pl-12 pr-4 text-base sm:text-sm text-neutral-800 outline-none transition-all duration-300 placeholder:text-neutral-300 focus:border-neutral-400 focus:shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
            aria-label="Buscar productos por texto"
          />
        </div>

        <div className="mt-2 w-full shrink-0 sm:mt-0 sm:w-[270px]" aria-label="Ordenar productos por precio">
          <div className="rounded-[18px] border border-neutral-200 bg-[#f8f6f1] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setFilters((current) => ({ ...current, sortOrder: 'price-asc' }))}
                className={`h-[40px] rounded-[12px] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  filters.sortOrder === 'price-asc'
                    ? 'bg-white text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                    : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-700'
                }`}
                aria-pressed={filters.sortOrder === 'price-asc'}
              >
                Menor a mayor
              </button>
              <button
                type="button"
                onClick={() => setFilters((current) => ({ ...current, sortOrder: 'price-desc' }))}
                className={`h-[40px] rounded-[12px] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  filters.sortOrder === 'price-desc'
                    ? 'bg-white text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                    : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-700'
                }`}
                aria-pressed={filters.sortOrder === 'price-desc'}
              >
                Mayor a menor
              </button>
            </div>
          </div>
        </div>
      </div>

      {limits && activeRange && (
        <div className="mt-3 rounded-[16px] border border-neutral-200 bg-[#faf9f6] px-4 py-3 sm:px-5">
          <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            <span>Rango de precio</span>
            {selectedMinLabel && selectedMaxLabel && (
              <span className="text-[10px] tracking-[0.12em] text-neutral-600">
                {selectedMinLabel} - {selectedMaxLabel}
              </span>
            )}
          </div>

          {hasPriceRange ? (
            <>
              <div className="relative h-10">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-200" />
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#a68a5c]"
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
                    applyRangeToFilters({ min: Math.min(nextMin, activeRange.max), max: activeRange.max });
                  }}
                  className="pointer-events-none absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#8c734d] [&::-webkit-slider-thumb]:bg-[#c9a96e] [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#8c734d] [&::-moz-range-thumb]:bg-[#c9a96e]"
                  aria-label="Precio mínimo del rango"
                />

                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={1}
                  value={activeRange.max}
                  onChange={(event) => {
                    const nextMax = Number(event.target.value);
                    applyRangeToFilters({ min: activeRange.min, max: Math.max(nextMax, activeRange.min) });
                  }}
                  className="pointer-events-none absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#8c734d] [&::-webkit-slider-thumb]:bg-[#c9a96e] [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#8c734d] [&::-moz-range-thumb]:bg-[#c9a96e]"
                  aria-label="Precio máximo del rango"
                />
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => applyRangeToFilters({ min: limits.min, max: limits.max })}
                  className="ml-auto rounded-[12px] border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700"
                >
                  Limpiar
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500">No hay rango de precios disponible para filtrar con la selección actual.</p>
          )}
        </div>
      )}
    </div>
  );
}
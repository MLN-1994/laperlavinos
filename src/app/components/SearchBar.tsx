'use client';

import { useEffect, useId, useState } from 'react';

export type SearchSortOrder = 'price-asc' | 'price-desc';

export interface SearchFilters {
  query: string;
  sortOrder: SearchSortOrder;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  placeholder?: string;
  className?: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  sortOrder: 'price-asc',
};

function normalizeFilters(initialFilters?: Partial<SearchFilters>): SearchFilters {
  return {
    query: initialFilters?.query ?? DEFAULT_FILTERS.query,
    sortOrder: initialFilters?.sortOrder ?? DEFAULT_FILTERS.sortOrder,
  };
}

export default function SearchBar({
  onSearch,
  initialFilters,
  placeholder = 'Encontrá tu etiqueta...',
  className,
}: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(() => normalizeFilters(initialFilters));
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const queryId = useId();
  const sortId = useId();

  useEffect(() => {
    setFilters(normalizeFilters(initialFilters));
  }, [initialFilters]);

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
    });
  }, [debouncedQuery, filters.sortOrder, onSearch]);

  const rootClassName = className ? ` ${className}` : '';

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

        <div className="relative w-full mt-2 sm:mt-0 sm:w-[220px] shrink-0">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <svg className="h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M6 7h8M6 10h5M6 13h3" />
            </svg>
          </span>
          <select
            id={sortId}
            value={filters.sortOrder}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sortOrder: event.target.value as SearchSortOrder,
              }))
            }
            className="h-[48px] w-full appearance-none rounded-[18px] border border-neutral-200 bg-white py-3 pl-11 pr-10 text-base sm:text-sm text-neutral-700 outline-none transition-all duration-300 focus:border-neutral-400 focus:shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
            aria-label="Ordenar productos por precio"
          >
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <svg className="h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="m5 8 5 5 5-5" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
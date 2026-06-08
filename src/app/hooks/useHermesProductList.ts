
import { useState, useEffect, useCallback, useMemo } from "react";
import { useHermesProducts, type HermesProduct } from "../../hooks/useHermesProducts";
import { usePublishedProducts } from "../../hooks/usePublishedProducts";
import { useProductPublication } from "../../hooks/useProductPublication";
import type { ProductoPublicado } from "../../types";

// Estado de paginación
// (debe ir dentro del hook, no fuera)

export function useHermesProductList() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { productos: hermesProducts, loading: loadingHermes, error: errorHermes } = useHermesProducts();
  const { productos: publishedProducts, refetch: refetchPublished } = usePublishedProducts('/api/admin/published-products');
  const { publishProduct, unpublishProduct, editProduct, toggleDestacado, toggleActivo, loading, error, success } = useProductPublication();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [tab, setTab] = useState<'todos' | 'publicados' | 'destacados'>("todos");

  const groupOptions = useMemo(
    () => Array.from(new Set(
      hermesProducts
        .map((product) => product.grupo)
        .filter((groupName): groupName is string => typeof groupName === 'string' && groupName.length > 0),
    )).sort(),
    [hermesProducts],
  );

  const isPublished = useCallback(
    (hermes_id: number) => publishedProducts.some((product: ProductoPublicado) => product.hermes_id === hermes_id),
    [publishedProducts],
  );

  const isDestacado = useCallback(
    (hermes_id: number) =>
      publishedProducts.some((product: ProductoPublicado) => product.hermes_id === hermes_id && product.destacado === true),
    [publishedProducts],
  );

  const handlePublish = useCallback(async (product: HermesProduct, description?: string, enOferta?: boolean, descuentoPorcentaje?: number | null, images?: File[]) => {
    const result = await publishProduct({
      hermes_id: product.hermes_id,
      nombre: product.nombre,
      descripcion: description?.trim() || product.descripcion,
      precio: product.precio,
      images: images ?? [],
      en_oferta: enOferta ?? false,
      descuento_porcentaje: descuentoPorcentaje ?? null,
    });
    refetchPublished();
    return result;
  }, [publishProduct, refetchPublished]);

  const handleEdit = useCallback(async (hermes_id: number, description: string, enOferta: boolean, descuentoPorcentaje: number | null) => {
    const result = await editProduct({ hermes_id, descripcion: description, en_oferta: enOferta, descuento_porcentaje: descuentoPorcentaje });
    refetchPublished();
    return result;
  }, [editProduct, refetchPublished]);

  const handleUnpublish = useCallback(async (hermes_id: number) => {
    const result = await unpublishProduct(hermes_id);
    refetchPublished();
    return result;
  }, [unpublishProduct, refetchPublished]);

  const handleToggleDestacado = useCallback(async (hermes_id: number, destacado: boolean) => {
    const result = await toggleDestacado(hermes_id, destacado);
    refetchPublished();
    return result;
  }, [toggleDestacado, refetchPublished]);

  const handleToggleActivo = useCallback(async (hermes_id: number, activo: boolean) => {
    const result = await toggleActivo(hermes_id, activo);
    refetchPublished();
    return result;
  }, [toggleActivo, refetchPublished]);

  const filterFn = useCallback((product: HermesProduct) => {
    const q = search.toLowerCase();
    const matchText =
      product.nombre.toLowerCase().includes(q) ||
      String(product.hermes_id).toLowerCase().includes(q) ||
      product.grupo?.toLowerCase().includes(q);
    const matchGroup = group ? product.grupo === group : true;
    return matchText && matchGroup;
  }, [search, group]);

  const filteredProducts = useMemo(() => {
    if (tab === 'todos') {
      return hermesProducts.filter(filterFn);
    }

    if (tab === 'publicados') {
      return hermesProducts.filter((product) => isPublished(product.hermes_id)).filter(filterFn);
    }

    return hermesProducts.filter((product) => isDestacado(product.hermes_id)).filter(filterFn);
  }, [hermesProducts, tab, filterFn, isPublished, isDestacado]);

  // Total de productos filtrados y total de páginas
  const totalFiltered = filteredProducts.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  // Productos paginados
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredProducts, pageSize]
  );

  const setSearchAndResetPage = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setGroupAndResetPage = useCallback((value: string) => {
    setGroup(value);
    setPage(1);
  }, []);

  const setTabAndResetPage = useCallback((value: 'todos' | 'publicados' | 'destacados') => {
    setTab(value);
    setPage(1);
  }, []);

  useEffect(() => {
    if (hermesProducts.length > 0) {
      const ids = hermesProducts.map((product) => product.hermes_id);
      const idsSet = new Set(ids.filter((id) => id !== undefined && id !== null));
      if (ids.length !== idsSet.size) {
        console.warn(
          "⚠️ Hay productos con hermes_id duplicado o faltante en Hermes:",
          hermesProducts.filter((product, index, items) =>
            items.findIndex((candidate) => candidate.hermes_id === product.hermes_id) !== index
            || !Number.isFinite(product.hermes_id),
          ),
        );
      }
    }
  }, [hermesProducts]);

  return {
    hermesProducts,
    publishedProducts,
    loadingHermes,
    errorHermes,
    loading,
    error,
    success,
    search,
    setSearch: setSearchAndResetPage,
    group,
    setGroup: setGroupAndResetPage,
    tab,
    setTab: setTabAndResetPage,
    groupOptions,
    filteredProducts,
    paginatedProducts,
    page: currentPage,
    setPage,
    pageSize,
    totalFiltered,
    totalPages,
    isPublished,
    handlePublish,
    handleEdit,
    handleUnpublish,
    handleToggleDestacado,
    handleToggleActivo,
  };
}

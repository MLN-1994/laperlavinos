import { useState, useEffect, useCallback, useMemo } from "react";
import { useHermesProducts } from "../../hooks/useHermesProducts";
import { usePublishedProducts } from "../../hooks/usePublishedProducts";
import { useProductPublication } from "../../hooks/useProductPublication";

export function useHermesProductList() {
  const { productos: hermesProducts, loading: loadingHermes, error: errorHermes } = useHermesProducts();
  const { productos: publishedProducts, refetch: refetchPublished } = usePublishedProducts();
  const { publishProduct, unpublishProduct, loading, error, success } = useProductPublication();
  const [selectedImage, setSelectedImage] = useState<{ [hermes_id: number]: File | null }>({});
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [tab, setTab] = useState<'todos' | 'publicados'>("todos");

  // Obtener grupos únicos ordenados alfabéticamente
  const groupOptions = useMemo(() =>
    Array.from(new Set((hermesProducts || []).map((p: any) => p.grupo).filter(Boolean))).sort(),
    [hermesProducts]
  );

  // Saber si un producto está publicado
  const isPublished = useCallback((hermes_id: number) => publishedProducts.some((p: any) => p.hermes_id === hermes_id), [publishedProducts]);

  // Handlers
  const handlePublish = useCallback(async (product: any) => {
    await publishProduct({
      hermes_id: product.hermes_id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      imagen: selectedImage[product.hermes_id] || null,
    });
    setSelectedImage((prev) => ({ ...prev, [product.hermes_id]: null }));
    refetchPublished();
  }, [publishProduct, refetchPublished, selectedImage]);

  const handleUnpublish = useCallback(async (hermes_id: number) => {
    await unpublishProduct(hermes_id);
    refetchPublished();
  }, [unpublishProduct, refetchPublished]);

  // Filtrado profesional por descripción, código y grupo (con select)
  const filterFn = useCallback((p: any) => {
    const q = search.toLowerCase();
    const matchText =
      p.nombre?.toLowerCase().includes(q) ||
      String(p.hermes_id).toLowerCase().includes(q) ||
      p.grupo?.toLowerCase().includes(q);
    const matchGroup = group ? p.grupo === group : true;
    return matchText && matchGroup;
  }, [search, group]);

  const filteredProducts = useMemo(() => {
    if (!hermesProducts) return [];
    return tab === 'todos'
      ? hermesProducts.filter(filterFn)
      : hermesProducts.filter((p: any) => isPublished(p.hermes_id)).filter(filterFn);
  }, [hermesProducts, tab, filterFn, isPublished]);

  // Log de control: detectar productos con hermes_id duplicado o faltante
  useEffect(() => {
    if (hermesProducts && hermesProducts.length > 0) {
      const ids = hermesProducts.map((p: any) => p.hermes_id);
      const idsSet = new Set(ids.filter((id: any) => id !== undefined && id !== null));
      if (ids.length !== idsSet.size) {
        console.warn("⚠️ Hay productos con hermes_id duplicado o faltante en Hermes:", hermesProducts.filter((p: any, i: number, arr: any[]) =>
          arr.findIndex(x => x.hermes_id === p.hermes_id) !== i || !p.hermes_id
        ));
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
    selectedImage,
    setSelectedImage,
    search,
    setSearch,
    group,
    setGroup,
    tab,
    setTab,
    groupOptions,
    filteredProducts,
    isPublished,
    handlePublish,
    handleUnpublish,
  };
}

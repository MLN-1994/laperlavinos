import { useEffect, useState } from "react";
import { ProductoPublicado } from "../types";

export function usePublishedProducts(endpoint = '/api/published-products') {
  const [productos, setProductos] = useState<ProductoPublicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        cache: 'no-store',
      });
      const data = (await response.json()) as { error?: string } | ProductoPublicado[];

      if (!response.ok) {
        throw new Error('error' in data ? data.error : 'No se pudieron cargar los productos.');
      }

      setProductos(data as ProductoPublicado[]);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'No se pudieron cargar los productos.');
      setProductos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return { productos, loading, error, refetch: fetchProductos };
}

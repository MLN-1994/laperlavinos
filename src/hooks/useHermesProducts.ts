import { useEffect, useState } from "react";

export interface HermesProduct {
  hermes_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number | null;
  grupo?: string | null;
  marca?: string | null;
  categoria?: string;
  categoria_id?: string | null;
  imagen_url?: string | null;
}

export function useHermesProducts() {
  const [productos, setProductos] = useState<HermesProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHermesProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hermes-products");
        if (!res.ok) throw new Error("Error al obtener productos de Hermes");
        const data = (await res.json()) as HermesProduct[];
        setProductos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener productos de Hermes");
        setProductos([]);
      }
      setLoading(false);
    }
    fetchHermesProducts();
  }, []);

  return { productos, loading, error };
}

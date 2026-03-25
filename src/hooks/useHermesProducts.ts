import { useEffect, useState } from "react";

export interface HermesProduct {
  hermes_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: string;
  [key: string]: any;
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
        const data = await res.json();
        setProductos(data);
      } catch (err: any) {
        setError(err.message);
        setProductos([]);
      }
      setLoading(false);
    }
    fetchHermesProducts();
  }, []);

  return { productos, loading, error };
}

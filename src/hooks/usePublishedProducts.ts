import { useEffect, useState } from "react";
import { getSupabaseClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";
import { ProductoPublicado } from "../types";

export function usePublishedProducts() {
  const [productos, setProductos] = useState<ProductoPublicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    if (!hasSupabaseBrowserConfig()) {
      setError('Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setProductos([]);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("productos_publicados")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) {
      setError(error.message);
      setProductos([]);
    } else {
      setProductos(data as ProductoPublicado[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, loading, error, refetch: fetchProductos };
}

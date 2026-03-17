import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ProductoPublicado } from "../types";

export function useProductos() {
  const [productos, setProductos] = useState<ProductoPublicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("productos_publicados")
      .select("*")
      .order("nombre", { ascending: true }); // Orden alfabético
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
    // eslint-disable-next-line
  }, []);

  return { productos, loading, error, refetch: fetchProductos };
}

import { useState } from "react";
import { getSupabaseClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";
import { ProductoPublicado } from "../types";

interface PublishOptions {
  hermes_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: File | null;
  destacado?: boolean;
  activo?: boolean;
}

export function useProductPublication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Publicar producto (alta en Supabase)
  const publishProduct = async (options: PublishOptions) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!hasSupabaseBrowserConfig()) {
      setError('Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    let imagen_url = undefined;
    if (options.imagen) {
      const nombreArchivo = `${Date.now()}_${options.imagen.name}`;
      const { error: imgError } = await supabase.storage.from("productos").upload(nombreArchivo, options.imagen);
      if (imgError) {
        setError("Error al subir imagen");
        setLoading(false);
        return;
      }
      imagen_url = supabase.storage.from("productos").getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const productosPublicadosTable = (supabase as any).from("productos_publicados");
    const { error: insertError } = await productosPublicadosTable.insert({
      hermes_id: options.hermes_id,
      nombre: options.nombre,
      descripcion: options.descripcion,
      precio: options.precio,
      imagen_url,
      destacado: options.destacado ?? false,
      activo: options.activo ?? true,
    });
    if (insertError) setError("Error al publicar producto");
    else setSuccess("¡Producto publicado!");
    setLoading(false);
  };

  // Despublicar producto (baja en Supabase)
  const unpublishProduct = async (hermes_id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!hasSupabaseBrowserConfig()) {
      setError('Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    const productosPublicadosTable = (supabase as any).from("productos_publicados");
    const { error: deleteError } = await productosPublicadosTable.delete().eq("hermes_id", hermes_id);
    if (deleteError) setError("Error al despublicar producto");
    else setSuccess("Producto despublicado");
    setLoading(false);
  };

  return {
    loading,
    error,
    success,
    publishProduct,
    unpublishProduct,
  };
}

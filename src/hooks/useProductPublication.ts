import { useState } from "react";

interface PublishOptions {
  hermes_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: File | null;
  destacado?: boolean;
  activo?: boolean;
  en_oferta?: boolean;
  descuento_porcentaje?: number | null;
}

interface PublicationResult {
  ok: boolean;
  message: string;
}

function isValidHermesId(value: number) {
  return Number.isFinite(value) && Number.isInteger(value);
}

export function useProductPublication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Publicar producto (alta en Supabase)
  const publishProduct = async (options: PublishOptions): Promise<PublicationResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isValidHermesId(options.hermes_id)) {
      const message = 'Este producto no tiene un hermes_id valido y no se puede publicar.';
      setError(message);
      setLoading(false);
      return { ok: false, message };
    }

    if (!options.imagen) {
      const message = 'Selecciona una imagen antes de publicar el producto.';
      setError(message);
      setLoading(false);
      return { ok: false, message };
    }

    try {
      const formData = new FormData();
      formData.append('hermes_id', String(options.hermes_id));
      formData.append('nombre', options.nombre);
      formData.append('descripcion', options.descripcion);
      formData.append('precio', String(options.precio));
      formData.append('destacado', String(options.destacado ?? false));
      formData.append('activo', String(options.activo ?? true));
      formData.append('en_oferta', String(options.en_oferta ?? false));
      if (options.descuento_porcentaje != null) {
        formData.append('descuento_porcentaje', String(options.descuento_porcentaje));
      }

      if (options.imagen) {
        formData.append('imagen', options.imagen);
      }

      const response = await fetch('/api/admin/published-products', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Error al publicar producto');
      }

      setSuccess('¡Producto publicado!');
      return { ok: true, message: '¡Producto publicado!' };
    } catch (publishError) {
      const message = publishError instanceof Error ? publishError.message : 'Error al publicar producto';
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Despublicar producto (baja en Supabase)
  const unpublishProduct = async (hermes_id: number): Promise<PublicationResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isValidHermesId(hermes_id)) {
      const message = 'Este producto no tiene un hermes_id valido y no se puede despublicar.';
      setError(message);
      setLoading(false);
      return { ok: false, message };
    }

    try {
      const response = await fetch('/api/admin/published-products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hermes_id }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Error al despublicar producto');
      }

      setSuccess('Producto despublicado');
      return { ok: true, message: 'Producto despublicado' };
    } catch (unpublishError) {
      const message = unpublishError instanceof Error ? unpublishError.message : 'Error al despublicar producto';
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Editar producto publicado
  const editProduct = async (options: Omit<PublishOptions, 'nombre' | 'precio' | 'activo' | 'destacado'>): Promise<PublicationResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!isValidHermesId(options.hermes_id)) {
      const message = 'Este producto no tiene un hermes_id valido y no se puede editar.';
      setError(message);
      setLoading(false);
      return { ok: false, message };
    }

    try {
      const formData = new FormData();
      formData.append('hermes_id', String(options.hermes_id));
      formData.append('descripcion', options.descripcion ?? '');
      formData.append('en_oferta', String(options.en_oferta ?? false));
      if (options.descuento_porcentaje != null) {
        formData.append('descuento_porcentaje', String(options.descuento_porcentaje));
      }
      if (options.imagen) {
        formData.append('imagen', options.imagen);
      }

      const response = await fetch('/api/admin/published-products', {
        method: 'PATCH',
        body: formData,
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Error al editar producto');
      }

      setSuccess('¡Producto actualizado!');
      return { ok: true, message: '¡Producto actualizado!' };
    } catch (editError) {
      const message = editError instanceof Error ? editError.message : 'Error al editar producto';
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    publishProduct,
    unpublishProduct,
    editProduct,
  };
}

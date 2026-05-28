import { useState } from "react";

interface PublishOptions {
  hermes_id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  images: File[];
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

    if (!options.images || options.images.length === 0) {
      const message = 'Seleccioná al menos una imagen antes de publicar el producto.';
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
      // La primera imagen va como imagen_url principal
      formData.append('imagen', options.images[0]);

      const response = await fetch('/api/admin/published-products', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Error al publicar producto');
      }

      // Subir todas las imágenes a producto_imagenes
      if (data.id && options.images.length > 0) {
        const imagesFormData = new FormData();
        imagesFormData.append('product_id', data.id);
        for (const img of options.images) {
          imagesFormData.append('imagenes', img);
        }
        await fetch('/api/admin/product-images', {
          method: 'POST',
          body: imagesFormData,
        });
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

  // Editar producto publicado (descripción, oferta, descuento)
  const editProduct = async (options: { hermes_id: number; descripcion: string; en_oferta?: boolean; descuento_porcentaje?: number | null }): Promise<PublicationResult> => {
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
      const response = await fetch('/api/admin/published-products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hermes_id: options.hermes_id,
          descripcion: options.descripcion ?? '',
          en_oferta: options.en_oferta ?? false,
          descuento_porcentaje: options.descuento_porcentaje ?? null,
        }),
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

  // Marcar/desmarcar destacado
  const toggleDestacado = async (hermes_id: number, destacado: boolean): Promise<PublicationResult> => {
    try {
      const response = await fetch('/api/admin/published-products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hermes_id, destacado }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Error al actualizar');
      return { ok: true, message: destacado ? '¡Marcado como destacado!' : 'Quitado de destacados.' };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar';
      return { ok: false, message };
    }
  };

  // Activar/ocultar producto (activo true/false)
  const toggleActivo = async (hermes_id: number, activo: boolean): Promise<PublicationResult> => {
    try {
      const response = await fetch('/api/admin/published-products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hermes_id, activo }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Error al actualizar');
      return { ok: true, message: activo ? 'Producto activado.' : 'Producto ocultado.' };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar';
      return { ok: false, message };
    }
  };

  return {
    loading,
    error,
    success,
    publishProduct,
    unpublishProduct,
    editProduct,
    toggleDestacado,
    toggleActivo,
  };
}

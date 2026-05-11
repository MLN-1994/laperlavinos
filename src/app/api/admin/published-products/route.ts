import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isValidHermesId(value: number) {
  return Number.isFinite(value) && Number.isInteger(value);
}

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const formData = await request.formData();
    const hermesIdValue = formData.get('hermes_id');
    const nombreValue = formData.get('nombre');
    const descripcionValue = formData.get('descripcion');
    const precioValue = formData.get('precio');
    const destacadoValue = formData.get('destacado');
    const activoValue = formData.get('activo');
    const enOfertaValue = formData.get('en_oferta');
    const descuentoPorcentajeValue = formData.get('descuento_porcentaje');
    const imageValue = formData.get('imagen');

    const hermesId = Number(hermesIdValue);
    const nombre = typeof nombreValue === 'string' ? nombreValue.trim() : '';
    const descripcion = typeof descripcionValue === 'string' ? descripcionValue.trim() : '';
    const precio = Number(precioValue);
    const enOferta = enOfertaValue === 'true';
    const rawDescuento = Number(descuentoPorcentajeValue);
    const descuentoPorcentaje = enOferta && Number.isFinite(rawDescuento) && rawDescuento > 0 && rawDescuento < 100
      ? rawDescuento
      : null;

    if (!isValidHermesId(hermesId)) {
      return NextResponse.json({ error: 'El hermes_id es obligatorio.' }, { status: 400 });
    }

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });
    }

    if (!descripcion) {
      return NextResponse.json({ error: 'La descripcion es obligatoria.' }, { status: 400 });
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      return NextResponse.json({ error: 'El precio debe ser mayor a 0.' }, { status: 400 });
    }

    const { data: existingProduct, error: existingProductError } = await getSupabaseAdmin()
      .from('productos_publicados')
      .select('id, imagen_url')
      .eq('hermes_id', hermesId)
      .maybeSingle();

    if (existingProductError) {
      throw new Error(existingProductError.message);
    }

    if (existingProduct) {
      return NextResponse.json({ error: 'El producto ya está publicado.' }, { status: 400 });
    }

    let imagenUrl: string | null = null;

    if (imageValue instanceof File && imageValue.size > 0) {
      const buffer = Buffer.from(await imageValue.arrayBuffer());
      const filePath = `${Date.now()}_${sanitizeFileName(imageValue.name)}`;
      const { error: uploadError } = await getSupabaseAdmin().storage.from('productos').upload(filePath, buffer, {
        contentType: imageValue.type || 'application/octet-stream',
      });

      if (uploadError) {
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      imagenUrl = getSupabaseAdmin().storage.from('productos').getPublicUrl(filePath).data.publicUrl;
    }

    if (!imagenUrl) {
      return NextResponse.json({ error: 'Selecciona una imagen antes de publicar el producto.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('productos_publicados')
      .insert({
        hermes_id: hermesId,
        nombre,
        descripcion,
        precio,
        imagen_url: imagenUrl,
        destacado: destacadoValue === 'true',
        activo: activoValue !== 'false',
        en_oferta: enOferta,
        descuento_porcentaje: descuentoPorcentaje,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo publicar el producto.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const formData = await request.formData();
    const hermesIdValue = formData.get('hermes_id');
    const descripcionValue = formData.get('descripcion');
    const enOfertaValue = formData.get('en_oferta');
    const descuentoPorcentajeValue = formData.get('descuento_porcentaje');
    const imageValue = formData.get('imagen');

    const hermesId = Number(hermesIdValue);

    if (!isValidHermesId(hermesId)) {
      return NextResponse.json({ error: 'El hermes_id es obligatorio.' }, { status: 400 });
    }

    const { data: existingProduct, error: fetchError } = await getSupabaseAdmin()
      .from('productos_publicados')
      .select('id, imagen_url')
      .eq('hermes_id', hermesId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }

    const enOferta = enOfertaValue === 'true';
    const rawDescuento = Number(descuentoPorcentajeValue);
    const descuentoPorcentaje = enOferta && Number.isFinite(rawDescuento) && rawDescuento > 0 && rawDescuento < 100
      ? rawDescuento
      : null;

    let imagenUrl: string = existingProduct.imagen_url ?? '';

    if (imageValue instanceof File && imageValue.size > 0) {
      const buffer = Buffer.from(await imageValue.arrayBuffer());
      const filePath = `${Date.now()}_${sanitizeFileName(imageValue.name)}`;
      const { error: uploadError } = await getSupabaseAdmin().storage.from('productos').upload(filePath, buffer, {
        contentType: imageValue.type || 'application/octet-stream',
      });

      if (uploadError) {
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      imagenUrl = getSupabaseAdmin().storage.from('productos').getPublicUrl(filePath).data.publicUrl;
    }

    const descripcion = typeof descripcionValue === 'string' ? descripcionValue.trim() : undefined;

    const { data, error } = await getSupabaseAdmin()
      .from('productos_publicados')
      .update({
        ...(descripcion !== undefined ? { descripcion } : {}),
        en_oferta: enOferta,
        descuento_porcentaje: descuentoPorcentaje,
        imagen_url: imagenUrl,
      })
      .eq('hermes_id', hermesId)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo editar el producto.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as { hermes_id?: number };
    const hermesId = Number(body.hermes_id);

    if (!isValidHermesId(hermesId)) {
      return NextResponse.json({ error: 'El hermes_id es obligatorio.' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('productos_publicados')
      .delete()
      .eq('hermes_id', hermesId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo despublicar el producto.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
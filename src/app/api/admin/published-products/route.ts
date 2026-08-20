import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadToMediaHost } from '@/lib/mediaUpload';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isValidHermesId(value: number) {
  return Number.isFinite(value) && Number.isInteger(value);
}

export async function GET() {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  const { data, error } = await getSupabaseAdmin()
    .from('productos_publicados')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
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
      const { url } = await uploadToMediaHost(imageValue, 'productos', {
        fileName: `${Date.now()}_${sanitizeFileName(imageValue.name)}`,
      });
      imagenUrl = url;
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
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      hermes_id?: number;
      descripcion?: string;
      en_oferta?: boolean;
      descuento_porcentaje?: number | null;
      destacado?: boolean;
      activo?: boolean;
    };

    const hermesId = Number(body.hermes_id);
    if (!isValidHermesId(hermesId)) {
      return NextResponse.json({ error: 'El hermes_id es obligatorio.' }, { status: 400 });
    }

    const updates: Partial<{
      descripcion: string;
      en_oferta: boolean;
      descuento_porcentaje: number | null;
      destacado: boolean;
      activo: boolean;
      updated_at: string;
    }> = {};
    if (body.descripcion !== undefined) updates.descripcion = body.descripcion.trim();
    if (body.en_oferta !== undefined) {
      updates.en_oferta = body.en_oferta;
      const rawDescuento = Number(body.descuento_porcentaje);
      updates.descuento_porcentaje =
        body.en_oferta && Number.isFinite(rawDescuento) && rawDescuento > 0 && rawDescuento < 100
          ? rawDescuento
          : null;
    }
    if (body.destacado !== undefined) updates.destacado = body.destacado;
    if (body.activo !== undefined) updates.activo = body.activo;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar.' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await getSupabaseAdmin()
      .from('productos_publicados')
      .update(updates)
      .eq('hermes_id', hermesId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el producto.';
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
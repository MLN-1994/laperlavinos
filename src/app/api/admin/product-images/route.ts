import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadToMediaHost } from '@/lib/mediaUpload';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// GET /api/admin/product-images?product_id=xxx
export async function GET(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ error: 'product_id es obligatorio.' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('producto_imagenes')
    .select('*')
    .eq('product_id', productId)
    .order('orden', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}


// FormData: product_id, imagenes[] (File[])
export async function POST(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const productId = formData.get('product_id');

    if (typeof productId !== 'string' || !productId) {
      return NextResponse.json({ error: 'product_id es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verificar que el producto existe
    const { data: product, error: productError } = await supabase
      .from('productos_publicados')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }

    // Obtener el orden actual máximo
    const { data: existing } = await supabase
      .from('producto_imagenes')
      .select('orden')
      .eq('product_id', productId)
      .order('orden', { ascending: false })
      .limit(1);

    let nextOrden = (existing?.[0]?.orden ?? -1) + 1;

    const files = formData.getAll('imagenes') as File[];

    if (files.length === 0 || !(files[0] instanceof File)) {
      return NextResponse.json({ error: 'Seleccioná al menos una imagen.' }, { status: 400 });
    }

    const inserted = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const filePath = `${Date.now()}_${sanitizeFileName(file.name)}`;
      let url: string;

      try {
        const upload = await uploadToMediaHost(file, 'productos', {
          productId,
          fileName: filePath,
        });
        url = upload.url;
      } catch {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filePath, buffer, { contentType: file.type || 'application/octet-stream' });

        if (uploadError) {
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        url = supabase.storage.from('productos').getPublicUrl(filePath).data.publicUrl;
      }

      const { data: row, error: insertError } = await supabase
        .from('producto_imagenes')
        .insert({ product_id: productId, url, orden: nextOrden })
        .select('*')
        .single();

      if (insertError) throw new Error(insertError.message);

      inserted.push(row);
      nextOrden++;
    }

    return NextResponse.json(inserted);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al subir imágenes.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/product-images
// body: { id: string }  (id de producto_imagenes)
export async function DELETE(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { id?: string };
    const imageId = body.id;

    if (!imageId) {
      return NextResponse.json({ error: 'id es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: image, error: fetchError } = await supabase
      .from('producto_imagenes')
      .select('id, url')
      .eq('id', imageId)
      .maybeSingle();

    if (fetchError || !image) {
      return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
    }

    // Extraer el path relativo del storage desde la URL pública
    const storageUrl = supabase.storage.from('productos').getPublicUrl('').data.publicUrl;
    const filePath = image.url.replace(storageUrl, '');

    // Intentar borrar del storage (no es crítico si falla)
    await supabase.storage.from('productos').remove([filePath]);

    const { error: deleteError } = await supabase
      .from('producto_imagenes')
      .delete()
      .eq('id', imageId);

    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al eliminar imagen.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

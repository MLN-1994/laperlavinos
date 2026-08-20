import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { uploadToMediaHost } from '@/lib/mediaUpload';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG o WebP.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'La imagen no puede superar 2 MB.' }, { status: 400 });
    }

    const { url } = await uploadToMediaHost(file, 'banners', {
      fileName: `banner-${Date.now()}.${(file.name.split('.').pop()?.toLowerCase() || 'jpg')}`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo subir la imagen.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

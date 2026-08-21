import fs from 'node:fs/promises';
import path from 'node:path';

export const MEDIA_BASE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || process.env.MEDIA_BASE_URL;
  if (raw) {
    return raw.replace(/\/+$/, '');
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://media.laperlawines.com.ar'
    : '';
})();

const MEDIA_UPLOAD_TOKEN = process.env.MEDIA_UPLOAD_TOKEN;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadToLocalFallback(file: File, folder: 'productos' | 'banners', fileName: string) {
  const safeFileName = sanitizeFileName(fileName || `upload-${Date.now()}`);
  const uploadRoot = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(uploadRoot, { recursive: true });

  const destination = path.join(uploadRoot, safeFileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destination, bytes);

  const publicUrl = `/uploads/${folder}/${safeFileName}`;

  return {
    url: publicUrl,
    path: publicUrl,
  };
}

export async function uploadToMediaHost(
  file: File,
  folder: 'productos' | 'banners',
  options?: { productId?: string; fileName?: string }
) {
  const safeName = sanitizeFileName(options?.fileName || file.name || `upload-${Date.now()}`);

  if (!MEDIA_BASE_URL) {
    return uploadToLocalFallback(file, folder, safeName);
  }

  const formData = new FormData();
  formData.append('file', file, safeName);
  formData.append('folder', folder);

  if (options?.productId) {
    formData.append('product_id', options.productId);
  }

  const endpoint = `${MEDIA_BASE_URL}/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        ...(MEDIA_UPLOAD_TOKEN ? { 'X-Media-Token': MEDIA_UPLOAD_TOKEN } : {}),
      },
    });

    const text = await response.text();
    let payload: any = {};

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    if (!response.ok) {
      const message = payload?.error || payload?.message || `La subida falló con estado ${response.status}.`;
      throw new Error(message);
    }

    const url = payload?.url || payload?.publicUrl || payload?.data?.url || payload?.data?.publicUrl;

    if (!url) {
      throw new Error('El servidor de media no devolvió una URL válida para la imagen.');
    }

    return {
      url,
      path: payload?.path || payload?.data?.path || null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido al subir imagen al host de media.';
    throw new Error(
      `No se pudo subir la imagen a ${endpoint}. ${message} Si queres fallback local en desarrollo, quita NEXT_PUBLIC_MEDIA_BASE_URL.`
    );
  }
}

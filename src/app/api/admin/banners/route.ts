import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Banner } from '@/types/banner';

interface BannerPayload {
  id?: string;
  titulo?: string;
  imagen_url?: string;
  activo?: boolean;
}

function normalizeBannerPayload(payload: BannerPayload) {
  const titulo = payload.titulo?.trim();
  const imagenUrl = payload.imagen_url?.trim();

  if (!imagenUrl) {
    throw new Error('La URL de imagen es obligatoria.');
  }

  return {
    // The DB type requires titulo; keep image-only UX by persisting an empty string when omitted.
    titulo: titulo ?? '',
    imagen_url: imagenUrl,
    activo: payload.activo ?? true,
  };
}

function buildBannerUpdatePayload(payload: BannerPayload): Partial<Banner> {
  const updatePayload: Partial<Banner> = {};

  if (payload.titulo !== undefined) {
    updatePayload.titulo = payload.titulo.trim() || undefined;
  }

  if (payload.imagen_url !== undefined) {
    const imagenUrl = payload.imagen_url.trim();

    if (!imagenUrl) {
      throw new Error('La URL de imagen es obligatoria.');
    }

    updatePayload.imagen_url = imagenUrl;
  }

  if (payload.activo !== undefined) {
    updatePayload.activo = payload.activo;
  }

  return updatePayload;
}

export async function GET() {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json((data ?? []) as Banner[]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron cargar los banners.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as BannerPayload;
    const payload = normalizeBannerPayload(body);

    const { data, error } = await getSupabaseAdmin()
      .from('banners')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data as Banner);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el banner.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as BannerPayload;

    if (!body.id) {
      return NextResponse.json({ error: 'Falta el id del banner.' }, { status: 400 });
    }

    const updatePayload = buildBannerUpdatePayload(body);

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para actualizar.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('banners')
      .update(updatePayload)
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data as Banner);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el banner.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as { id?: string };

    if (!body.id) {
      return NextResponse.json({ error: 'Falta el id del banner.' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from('banners').delete().eq('id', body.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el banner.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
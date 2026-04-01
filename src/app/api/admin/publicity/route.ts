import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { buildPublicityPayload, defaultPublicityConfig, normalizePublicityConfig } from '@/lib/publicity';
import type { PublicityConfig } from '@/types/publicity';

export async function GET() {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('home_publicity')
      .select('*')
      .eq('id', 'home')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(normalizePublicityConfig((data as Partial<PublicityConfig> | null) ?? defaultPublicityConfig));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cargar la publicidad.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as Partial<PublicityConfig>;
    const payload = buildPublicityPayload(body);

    const { data, error } = await getSupabaseAdmin()
      .from('home_publicity')
      .upsert({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(normalizePublicityConfig(data as Partial<PublicityConfig>));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar la publicidad.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
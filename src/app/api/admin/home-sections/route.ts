import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from('home_sections')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as {
    tipo: string;
    producto_id?: string | null;
    producto_nombre?: string | null;
    imagen_url?: string | null;
    titulo?: string | null;
    subtitulo?: string | null;
    cita?: string | null;
    cta_label?: string | null;
    cta_href?: string | null;
    activo?: boolean;
  };

  const { tipo, ...rest } = body;

  if (!tipo) {
    return NextResponse.json({ error: 'El campo "tipo" es requerido.' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('home_sections')
    .upsert(
      { tipo, ...rest, updated_at: new Date().toISOString() },
      { onConflict: 'tipo' },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

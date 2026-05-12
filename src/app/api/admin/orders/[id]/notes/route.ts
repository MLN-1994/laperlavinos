import { NextResponse } from 'next/server';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import { requireAdminApiUser } from '@/lib/adminAuth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Configuración de servidor incompleta.' }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID de pedido requerido.' }, { status: 400 });
  }

  let notas_internas: string;
  try {
    const body = (await request.json()) as { notas_internas?: unknown };
    notas_internas = typeof body.notas_internas === 'string' ? body.notas_internas.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('web_orders')
    .update({ notas_internas: notas_internas || null })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'No se pudo guardar la nota.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

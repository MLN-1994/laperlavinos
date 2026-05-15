import { NextResponse, after } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Supabase admin no configurado.' }, { status: 503 });
  }

  const { id } = await params;

  let body: { action?: string };
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  const { action } = body;
  if (action !== 'aprobar' && action !== 'rechazar') {
    return NextResponse.json(
      { error: 'action debe ser "aprobar" o "rechazar".' },
      { status: 400 },
    );
  }

  const newStatus =
    action === 'aprobar' ? 'transferencia_aprobada' : 'transferencia_rechazada';

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('web_orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pendiente_transferencia'); // solo si sigue pendiente

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Al aprobar: registrar la venta en Hermes (descuenta stock) en background
  if (action === 'aprobar') {
    const hermesUrl = new URL('/api/hermes/venta', request.url).toString();
    const orderId = id;
    after(async () => {
      try {
        const res = await fetch(hermesUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ web_order_id: orderId }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error(
            `[admin/status] Error al registrar venta en Hermes order=${orderId} status=${res.status}`,
            data,
          );
        } else {
          console.log(
            `[admin/status] Venta registrada en Hermes order=${orderId} comprobante=${(data as Record<string, unknown>)?.hermes_comprobante ?? 'desconocido'}`,
          );
        }
      } catch (err: unknown) {
        console.error(
          `[admin/status] Fallo de red al llamar a Hermes order=${orderId}`,
          err instanceof Error ? err.message : err,
        );
      }
    });
  }

  return NextResponse.json({ ok: true, newStatus });
}

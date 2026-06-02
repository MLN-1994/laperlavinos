import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const CRON_SECRET = process.env.CRON_SECRET?.trim() ?? '';
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const FROM = process.env.RESEND_FROM_EMAIL?.trim() ?? 'La Perla Vinos <noreply@laperlawines.com.ar>';
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL?.trim();
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://www.laperlawines.com.ar';

// Máximo de intentos antes de marcar como dead
const MAX_RETRIES = 5;
// Cuántos eventos procesar por ejecución
const BATCH_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization') ?? '';
  if (!CRON_SECRET) return false;
  return authHeader === `Bearer ${CRON_SECRET}`;
}

/** Backoff exponencial: 2^(retryCount-1) * 5 min, máximo 24h */
function nextRetryAt(retryCount: number): string {
  const delayMs = Math.min(Math.pow(2, retryCount - 1) * 5 * 60 * 1000, 24 * 60 * 60 * 1000);
  return new Date(Date.now() + delayMs).toISOString();
}

async function sendDeadLetterAlert(orderId: string, lastError: string | null, retryCount: number) {
  if (!RESEND_API_KEY || !ADMIN_ALERT_EMAIL) {
    console.warn(`[process-events] Sin RESEND_API_KEY o ADMIN_ALERT_EMAIL — alerta dead-letter omitida order=${orderId}`);
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const adminUrl = `${BASE_URL}/admin/pedidos`;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_ALERT_EMAIL,
    subject: `⚠️ Venta no registrada en Hermes — pedido ${orderId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#b91c1c;">⚠️ Fallo de integración: Hermes no registró la venta</h2>
        <p>El pedido <strong>${orderId}</strong> fue aprobado pero no pudo registrarse en Hermes
        luego de <strong>${retryCount} intentos</strong>.</p>
        <p><strong>Último error:</strong></p>
        <pre style="background:#f3f4f6;padding:12px;border-radius:4px;overflow:auto;">${lastError ?? 'Sin detalle'}</pre>
        <p>El evento quedó marcado como <code>dead</code> y no se reintentará automáticamente.</p>
        <p>
          <a href="${adminUrl}" style="
            display:inline-block;background:#7c3aed;color:#fff;
            padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;
          ">Ver pedidos en el panel</a>
        </p>
        <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb;">
        <p style="font-size:12px;color:#9ca3af;">La Perla Vinos — alerta automática de sistema</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  // Obtener eventos pendientes o fallidos cuyo next_retry_at ya pasó
  const { data: events, error: fetchError } = await supabase
    .from('integration_events')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lte('next_retry_at', new Date().toISOString())
    .order('next_retry_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('[process-events] Error al obtener eventos:', fetchError.message);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ processed: 0, message: 'Sin eventos pendientes' });
  }

  console.log(`[process-events] Procesando ${events.length} evento(s)`);

  const results: { id: string; status: string; error?: string }[] = [];

  for (const event of events) {
    // Marcar como processing para evitar ejecuciones paralelas
    await supabase
      .from('integration_events')
      .update({ status: 'processing' })
      .eq('id', event.id);

    let success = false;
    let errorMessage: string | null = null;

    if (event.event_type === 'hermes_venta') {
      try {
        const hermesUrl = `${BASE_URL}/api/hermes/venta`;
        const res = await fetch(hermesUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ web_order_id: event.web_order_id }),
        });
        const data = await res.json().catch(() => null);

        if (res.ok) {
          success = true;
          console.log(
            `[process-events] Hermes OK order=${event.web_order_id} comprobante=${(data as Record<string, unknown>)?.hermes_comprobante ?? '?'}`,
          );
        } else {
          errorMessage = `HTTP ${res.status}: ${JSON.stringify(data)}`;
          console.error(`[process-events] Hermes falló order=${event.web_order_id}`, errorMessage);
        }
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[process-events] Excepción al llamar Hermes order=${event.web_order_id}`, errorMessage);
      }
    } else {
      // Tipo de evento desconocido — marcar dead inmediatamente
      errorMessage = `Tipo de evento desconocido: ${event.event_type}`;
      success = false;
    }

    if (success) {
      await supabase
        .from('integration_events')
        .update({ status: 'done', last_error: null })
        .eq('id', event.id);
      results.push({ id: event.id, status: 'done' });
    } else {
      const newRetryCount = (event.retry_count ?? 0) + 1;

      if (newRetryCount >= MAX_RETRIES) {
        await supabase
          .from('integration_events')
          .update({ status: 'dead', retry_count: newRetryCount, last_error: errorMessage })
          .eq('id', event.id);

        console.warn(`[process-events] Evento dead order=${event.web_order_id} tras ${newRetryCount} intentos`);

        try {
          await sendDeadLetterAlert(event.web_order_id, errorMessage, newRetryCount);
        } catch (emailErr) {
          console.error('[process-events] Error enviando alerta dead-letter', emailErr);
        }

        results.push({ id: event.id, status: 'dead', error: errorMessage ?? undefined });
      } else {
        await supabase
          .from('integration_events')
          .update({
            status: 'failed',
            retry_count: newRetryCount,
            last_error: errorMessage,
            next_retry_at: nextRetryAt(newRetryCount),
          })
          .eq('id', event.id);

        results.push({ id: event.id, status: 'failed', error: errorMessage ?? undefined });
      }
    }
  }

  const summary = {
    processed: results.length,
    done: results.filter((r) => r.status === 'done').length,
    failed: results.filter((r) => r.status === 'failed').length,
    dead: results.filter((r) => r.status === 'dead').length,
  };

  console.log('[process-events] Resumen:', summary);
  return NextResponse.json(summary);
}

import { NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import { sendApprovedSaleNotificationEmail } from '@/lib/orderEmail';
import type { Database, Json } from '@/types/supabase';

type WebOrderUpdate = Database['public']['Tables']['web_orders']['Update'];

// ─────────────────────────────────────────────────────────────────────────────
// Tipos del webhook OpenPay
// ─────────────────────────────────────────────────────────────────────────────

interface OpenPayWebhookBody {
  data?: {
    type?: string;
    order?: {
      uuid?: string;
      status?: string;
      source?: string;
    };
    payment?: {
      id?: number;
      authorizationCode?: string;
      refNumber?: string;
      status?: string;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.OPENPAY_WEBHOOK_SECRET?.trim() ?? '';
const WEBHOOK_DEBUG_ENABLED = process.env.OPENPAY_WEBHOOK_DEBUG === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// Validación del secret en query param
// ─────────────────────────────────────────────────────────────────────────────

function verifyWebhookSecret(url: URL): void {
  if (!WEBHOOK_SECRET) {
    throw new Error('OPENPAY_WEBHOOK_SECRET no está configurado. El webhook está deshabilitado hasta que se configure la variable de entorno.');
  }

  const providedSecret = url.searchParams.get('secret') ?? '';

  // Comparación en tiempo constante para evitar timing attacks
  const provided = Buffer.from(providedSecret);
  const expected = Buffer.from(WEBHOOK_SECRET);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new Error('Webhook secret inválido.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapeo de estados
// ─────────────────────────────────────────────────────────────────────────────

function mapOrderStatus(paymentStatus: string | null | undefined, orderStatus: string | null | undefined) {
  // La orden OpenPay puede tener status: PENDING, SUCCESS, FAILED, EXPIRED
  // El pago: APPROVED, REJECTED, PENDING
  if (paymentStatus === 'APPROVED' || orderStatus === 'SUCCESS') {
    return 'pago_aprobado';
  }
  if (paymentStatus === 'REJECTED' || orderStatus === 'FAILED') {
    return 'pago_rechazado';
  }
  if (orderStatus === 'EXPIRED') {
    return 'pago_cancelado';
  }
  return 'checkout_generado';
}

function normalizePaymentStatus(paymentStatus: string | null | undefined): string | null {
  if (!paymentStatus) return null;
  switch (paymentStatus.toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'PENDING':
      return 'pending';
    default:
      return paymentStatus.toLowerCase();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logger
// ─────────────────────────────────────────────────────────────────────────────

function logWebhook(prefix: string, payload: Record<string, unknown>) {
  if (!WEBHOOK_DEBUG_ENABLED) return;
  console.log(`[OpenPay webhook] ${prefix}`);
  console.log(JSON.stringify(payload, null, 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para procesar webhooks.');
    }

    const url = new URL(request.url);
    verifyWebhookSecret(url);

    const rawBody = await request.text();
    let parsedBody: unknown = null;

    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      return NextResponse.json({ received: false, reason: 'invalid_json' }, { status: 400 });
    }

    const webhookBody = parsedBody as OpenPayWebhookBody | null;
    const orderUuid = webhookBody?.data?.order?.uuid?.trim();

    logWebhook('POST recibido', {
      url: url.toString(),
      body: parsedBody,
    });

    if (!orderUuid) {
      return NextResponse.json({ received: true, ignored: true, reason: 'missing_order_uuid' });
    }

    const orderStatus = webhookBody?.data?.order?.status;
    const paymentStatus = webhookBody?.data?.payment?.status;
    const paymentId = webhookBody?.data?.payment?.id;
    const refNumber = webhookBody?.data?.payment?.refNumber;

    const mappedStatus = mapOrderStatus(paymentStatus, orderStatus);
    const normalizedPaymentStatus = normalizePaymentStatus(paymentStatus);

    const updatePayload: WebOrderUpdate = {
      status: mappedStatus,
      payment_status: normalizedPaymentStatus,
      raw_webhook_payload: JSON.parse(JSON.stringify(parsedBody)) as Json,
    };

    const supabaseAdmin = getSupabaseAdmin();
    const { data: order, error: updateError } = await supabaseAdmin
      .from('web_orders')
      .update(updatePayload)
      .eq('openpay_order_uuid', orderUuid)
      .select('id, external_reference, status, payment_status')
      .maybeSingle();

    if (updateError) {
      throw new Error(`No se pudo actualizar el pedido por webhook OpenPay: ${updateError.message}`);
    }

    if (!order) {
      logWebhook('No se encontro pedido para webhook', { orderUuid, paymentId });
      return NextResponse.json({ received: true, ignored: true, reason: 'order_not_found' });
    }

    logWebhook('Pedido actualizado por webhook', {
      order,
      orderUuid,
      paymentId,
      refNumber,
      orderStatus,
      paymentStatus,
    });

    // Pago aprobado: encolar registro en Hermes (outbox pattern)
    if (normalizedPaymentStatus === 'approved' && order.id) {
      const orderId = order.id;
      console.log(`[OpenPay webhook] Pago aprobado — encolando registro Hermes para order=${orderId}`);

      const { error: eventError } = await supabaseAdmin
        .from('integration_events')
        .upsert(
          {
            event_type: 'hermes_venta',
            web_order_id: orderId,
            idempotency_key: `hermes_venta:${orderId}`,
            status: 'pending',
            next_retry_at: new Date().toISOString(),
          },
          { onConflict: 'idempotency_key', ignoreDuplicates: true },
        );
      if (eventError) {
        console.error(`[OpenPay webhook] Error al encolar evento Hermes order=${orderId}`, eventError.message);
      }

      after(async () => {
        try {
          const { data: fullOrder } = await supabaseAdmin
            .from('web_orders')
            .select('id, buyer_name, buyer_email, external_reference, total_amount, currency_id')
            .eq('id', orderId)
            .maybeSingle();

          if (!fullOrder?.buyer_email) {
            return;
          }

          const { data: items } = await supabaseAdmin
            .from('web_order_items')
            .select('title, quantity, unit_price, line_total')
            .eq('order_id', orderId);

          await sendApprovedSaleNotificationEmail({
            sourceLabel: 'OpenPay / BBVA',
            buyerName: fullOrder.buyer_name,
            buyerEmail: fullOrder.buyer_email,
            externalReference: fullOrder.external_reference,
            paymentReference: paymentId ? String(paymentId) : refNumber ?? null,
            totalAmount: fullOrder.total_amount,
            currencyId: fullOrder.currency_id,
            items: (items ?? []).map((i) => ({
              title: i.title,
              quantity: i.quantity ?? 1,
              unitPrice: i.unit_price ?? 0,
              lineTotal: i.line_total ?? 0,
            })),
          });
        } catch (err) {
          console.error(`[OpenPay webhook] Error enviando aviso interno order=${orderId}`, err);
        }
      });
    }

    return NextResponse.json({ received: true, orderId: order.id, status: mappedStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook OpenPay.';

    if (message.includes('secret inválido')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[OpenPay webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

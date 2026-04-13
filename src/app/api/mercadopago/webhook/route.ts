import { NextResponse } from 'next/server';
import { fetchMercadoPagoPayment } from '@/lib/mercadoPago';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import type { Database, Json } from '@/types/supabase';

type WebOrderUpdate = Database['public']['Tables']['web_orders']['Update'];

interface MercadoPagoWebhookBody {
  action?: string;
  type?: string;
  data?: {
    id?: string | number;
  };
}

const ALLOWED_PAYMENT_STATUSES = new Set([
  'pending',
  'in_process',
  'approved',
  'rejected',
  'cancelled',
  'refunded',
  'charged_back',
]);

function parseWebhookBody(rawBody: string) {
  let parsedBody: unknown = rawBody;

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = rawBody;
  }

  return parsedBody;
}

function getWebhookBody(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload as MercadoPagoWebhookBody;
}

function getWebhookPaymentId(parsedBody: unknown, url: URL) {
  const body = getWebhookBody(parsedBody);
  const bodyPaymentId = body?.data?.id;

  if (typeof bodyPaymentId === 'string' || typeof bodyPaymentId === 'number') {
    return String(bodyPaymentId);
  }

  const queryPaymentId = url.searchParams.get('data.id') ?? url.searchParams.get('id');
  return queryPaymentId?.trim() || null;
}

function getWebhookTopic(parsedBody: unknown, url: URL) {
  const body = getWebhookBody(parsedBody);
  return body?.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic') ?? null;
}

function normalizePaymentStatus(status: string | null | undefined) {
  if (!status) {
    return null;
  }

  return ALLOWED_PAYMENT_STATUSES.has(status) ? status : null;
}

function mapOrderStatus(paymentStatus: string | null) {
  switch (paymentStatus) {
    case 'approved':
      return 'pago_aprobado';
    case 'rejected':
      return 'pago_rechazado';
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'pago_cancelado';
    case 'pending':
    case 'in_process':
    default:
      return 'checkout_generado';
  }
}

function buildWebhookPayload(params: {
  url: URL;
  request: Request;
  parsedBody: unknown;
  paymentId: string;
  payment: {
    id: string | number;
    status?: string | null;
    status_detail?: string | null;
    external_reference?: string | null;
    transaction_amount?: number | null;
    currency_id?: string | null;
    date_created?: string | null;
    date_approved?: string | null;
    payer?: {
      email?: string | null;
      identification?: {
        type?: string | null;
        number?: string | null;
      } | null;
    } | null;
  };
}) {
  return {
    url: params.url.toString(),
    headers: Object.fromEntries(params.request.headers.entries()),
    body: params.parsedBody,
    query: Object.fromEntries(params.url.searchParams.entries()),
    payment_id: params.paymentId,
    payment: {
      id: params.payment.id,
      status: params.payment.status ?? null,
      status_detail: params.payment.status_detail ?? null,
      external_reference: params.payment.external_reference ?? null,
      transaction_amount: params.payment.transaction_amount ?? null,
      currency_id: params.payment.currency_id ?? null,
      date_created: params.payment.date_created ?? null,
      date_approved: params.payment.date_approved ?? null,
      payer: params.payment.payer ?? null,
    },
  } as Json;
}

function logWebhook(prefix: string, payload: unknown) {
  console.log(`[MercadoPago webhook] ${prefix}`);
  console.log(JSON.stringify(payload, null, 2));
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para procesar webhooks.');
    }

    const url = new URL(request.url);
    const rawBody = await request.text();
    const parsedBody = parseWebhookBody(rawBody);
    const paymentId = getWebhookPaymentId(parsedBody, url);
    const topic = getWebhookTopic(parsedBody, url);

    logWebhook('POST recibido', {
      url: url.toString(),
      headers: Object.fromEntries(request.headers.entries()),
      body: parsedBody,
      query: Object.fromEntries(url.searchParams.entries()),
      topic,
      paymentId,
    });

    if (!paymentId) {
      return NextResponse.json({ received: true, ignored: true, reason: 'missing_payment_id' });
    }

    const payment = await fetchMercadoPagoPayment(paymentId);
    const externalReference = payment.external_reference?.trim();

    if (!externalReference) {
      logWebhook('Pago sin external_reference', { paymentId, payment });
      return NextResponse.json({ received: true, ignored: true, reason: 'missing_external_reference' });
    }

    const paymentStatus = normalizePaymentStatus(payment.status);
    const status = mapOrderStatus(paymentStatus);
    const updatePayload: WebOrderUpdate = {
      status,
      payment_status: paymentStatus,
      mercadopago_payment_id: String(payment.id),
      raw_webhook_payload: buildWebhookPayload({
        url,
        request,
        parsedBody,
        paymentId,
        payment,
      }),
    };

    const supabaseAdmin = getSupabaseAdmin();
    const { data: order, error: updateError } = await supabaseAdmin
      .from('web_orders')
      .update(updatePayload)
      .eq('external_reference', externalReference)
      .select('id, external_reference, status, payment_status, mercadopago_payment_id')
      .maybeSingle();

    if (updateError) {
      throw new Error(`No se pudo actualizar el pedido por webhook: ${updateError.message}`);
    }

    if (!order) {
      logWebhook('No se encontro pedido para webhook', {
        externalReference,
        paymentId,
        topic,
      });
      return NextResponse.json({ received: true, ignored: true, reason: 'order_not_found' });
    }

    logWebhook('Pedido actualizado por webhook', {
      order,
      paymentId,
      externalReference,
      topic,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MercadoPago webhook] Error procesando POST', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    logWebhook('GET recibido', {
      url: url.toString(),
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MercadoPago webhook] Error procesando GET', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
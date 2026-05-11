import { NextResponse } from 'next/server';
import { createOpenPayOrder, hasOpenPayConfig } from '@/lib/openPayClient';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import { requireAdminApiUser } from '@/lib/adminAuth';
import type { Database, Json } from '@/types/supabase';

type WebOrderInsert = Database['public']['Tables']['web_orders']['Insert'];
type WebOrderItemInsert = Database['public']['Tables']['web_order_items']['Insert'];

interface ManualLinkBody {
  title?: unknown;
  amount?: unknown;
}

function toJsonValue(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  try {
    if (!hasSupabaseAdminConfig()) {
      throw new Error('Falta configurar Supabase admin para registrar pedidos.');
    }

    if (!hasOpenPayConfig()) {
      throw new Error('Falta configurar las variables de OpenPay.');
    }

    const body = (await request.json()) as ManualLinkBody;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const amount = Number(body.amount);

    if (!title) {
      return NextResponse.json({ error: 'Ingresá un concepto para el cobro.' }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Ingresá un monto válido mayor a 0.' }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const externalReference = `cobro-manual-op-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const supabaseAdmin = getSupabaseAdmin();

    const orderPayload: WebOrderInsert = {
      status: 'checkout_generado',
      payment_provider: 'openpay',
      external_reference: externalReference,
      buyer_name: 'Cobro Manual Admin',
      buyer_email: 'admin@laperlavinos.com',
      subtotal_amount: amount,
      total_amount: amount,
      currency_id: 'ARS',
      notes: `Cobro manual: ${title}`,
      raw_checkout_payload: toJsonValue({ title, amount, source: 'admin_manual' }),
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('web_orders')
      .insert(orderPayload)
      .select('id')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'No se pudo crear el pedido web.');
    }

    const itemPayload: WebOrderItemInsert = {
      order_id: order.id,
      product_id: order.id, // sin producto real; usamos el order id como referencia
      hermes_id: null,
      title,
      quantity: 1,
      unit_price: amount,
      line_total: amount,
      product_snapshot: toJsonValue({ title, amount, source: 'admin_manual' }),
    };

    await supabaseAdmin.from('web_order_items').insert(itemPayload);

    const webhookSecret = process.env.OPENPAY_WEBHOOK_SECRET?.trim() ?? '';
    const webhookUrl = webhookSecret
      ? `${origin}/api/openpay/webhook?secret=${encodeURIComponent(webhookSecret)}`
      : `${origin}/api/openpay/webhook`;

    const openpayOrder = await createOpenPayOrder({
      items: [{ id: 1, name: title, quantity: 1, unitPrice: amount }],
      redirectUrls: {
        success: `${origin}/admin/openpay`,
        failed: `${origin}/admin/openpay`,
      },
      webhookUrl,
      expireLimitMinutes: 2880, // 48 horas para cobros manuales
    });

    const orderUuid = openpayOrder.data.attributes.uuid;
    const checkoutUrl = openpayOrder.data.attributes.links.checkout;

    await supabaseAdmin
      .from('web_orders')
      .update({ openpay_order_uuid: orderUuid })
      .eq('id', order.id);

    return NextResponse.json({ checkoutUrl, orderUuid, orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo generar el link de cobro.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

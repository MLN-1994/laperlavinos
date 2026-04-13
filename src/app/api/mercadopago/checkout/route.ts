import { NextResponse } from 'next/server';
import { createMercadoPagoCheckoutPreference } from '@/lib/mercadoPago';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import type { CheckoutItemInput } from '@/types/mercadopago';
import type { Database, Json } from '@/types/supabase';

interface CheckoutRequestBody {
  items?: CheckoutItemInput[];
}

type WebOrderInsert = Database['public']['Tables']['web_orders']['Insert'];
type WebOrderItemInsert = Database['public']['Tables']['web_order_items']['Insert'];

function buildExternalReference() {
  return `pedido-web-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function calculateTotalAmount(items: CheckoutItemInput[]) {
  return items.reduce((total, item) => total + Number(item.unit_price) * Number(item.quantity), 0);
}

function buildOrderItems(orderId: string, items: CheckoutItemInput[]): WebOrderItemInsert[] {
  return items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    title: item.title,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    line_total: Number(item.unit_price) * Number(item.quantity),
    product_snapshot: {
      id: item.id,
      title: item.title,
      description: item.description ?? null,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      currency_id: item.currency_id ?? 'ARS',
      picture_url: item.picture_url ?? null,
      category_id: item.category_id ?? null,
    },
  }));
}

function toJsonValue(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para registrar pedidos web.');
    }

    const body = (await request.json()) as CheckoutRequestBody;
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    const invalidItem = items.find(
      (item) =>
        !item.id ||
        !item.title ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price <= 0,
    );

    if (invalidItem) {
      return NextResponse.json({ error: 'Hay productos inválidos en el pedido.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const totalAmount = calculateTotalAmount(items);
    const externalReference = buildExternalReference();
    const orderPayload: WebOrderInsert = {
      status: 'pendiente',
      external_reference: externalReference,
      buyer_name: 'Cliente web',
      subtotal_amount: totalAmount,
      total_amount: totalAmount,
      currency_id: items[0]?.currency_id ?? 'ARS',
      raw_checkout_payload: toJsonValue(body),
      notes: 'Checkout generado sin datos de comprador; pendiente ampliar payload del frontend.',
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('web_orders')
      .insert(orderPayload)
      .select('id')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'No se pudo crear el pedido web.');
    }

    const orderItemsPayload = buildOrderItems(order.id, items);
    const { error: orderItemsError } = await supabaseAdmin.from('web_order_items').insert(orderItemsPayload);

    if (orderItemsError) {
      await supabaseAdmin.from('web_orders').delete().eq('id', order.id);
      throw new Error(`No se pudieron guardar los items del pedido: ${orderItemsError.message}`);
    }

    const preference = await createMercadoPagoCheckoutPreference({
      items,
      origin: new URL(request.url).origin,
      externalReference,
    });

    const { error: updateOrderError } = await supabaseAdmin
      .from('web_orders')
      .update({
        status: 'checkout_generado',
        mercadopago_preference_id: preference.id,
      })
      .eq('id', order.id);

    if (updateOrderError) {
      throw new Error(`Se creó la preferencia pero no se pudo actualizar el pedido: ${updateOrderError.message}`);
    }

    return NextResponse.json(preference);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo generar el checkout de Mercado Pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
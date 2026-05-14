import { NextResponse } from 'next/server';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref')?.trim();

  if (!ref) {
    return NextResponse.json({ error: 'ref requerido' }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: 'Configuración faltante' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from('web_orders')
    .select('id, buyer_name, subtotal_amount, shipping_amount, shipping_service, shipping_payload, total_amount, currency_id')
    .eq('external_reference', ref)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from('web_order_items')
    .select('title, quantity, unit_price, line_total')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true });

  if (itemsError) {
    return NextResponse.json({ error: 'Error al cargar items' }, { status: 500 });
  }

  return NextResponse.json({
    buyerName: order.buyer_name,
    subtotalAmount: order.subtotal_amount,
    shippingAmount: order.shipping_amount,
    shippingService: order.shipping_service,
    shippingPayload: order.shipping_payload,
    totalAmount: order.total_amount,
    currencyId: order.currency_id ?? 'ARS',
    items: (items ?? []).map((item) => ({
      title: item.title,
      quantity: item.quantity ?? 0,
      unitPrice: item.unit_price ?? 0,
      lineTotal: item.line_total ?? 0,
    })),
  });
}

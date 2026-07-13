/**
 * Script de prueba: envía el aviso interno de venta aprobada para un pedido existente.
 * Uso: npx tsx scripts/test-approved-sale-email.ts <order_id|external_reference>
 */
import { createClient } from '@supabase/supabase-js';
import { sendApprovedSaleNotificationEmail } from '../src/lib/orderEmail';

const orderId = process.argv[2];

if (!orderId) {
  console.error('Uso: npx tsx scripts/test-approved-sale-email.ts <order_id|external_reference>');
  process.exit(1);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let { data: order } = await supabase
    .from('web_orders')
    .select('id, buyer_name, buyer_email, external_reference, mercadopago_payment_id, total_amount, currency_id, payment_provider')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    const { data: orderByReference } = await supabase
      .from('web_orders')
      .select('id, buyer_name, buyer_email, external_reference, mercadopago_payment_id, total_amount, currency_id, payment_provider')
      .eq('external_reference', orderId)
      .maybeSingle();

    order = orderByReference ?? null;
  }

  if (!order) {
    console.error('Pedido no encontrado por id ni por external_reference');
    process.exit(1);
  }

  const { data: items } = await supabase
    .from('web_order_items')
    .select('title, quantity, unit_price, line_total')
    .eq('order_id', order.id);

  console.log(`Enviando aviso interno de venta a ${process.env.RESEND_NOTIFY_EMAIL ?? 'ventas@laperlawines.com.ar'}...`);

  await sendApprovedSaleNotificationEmail({
    sourceLabel: order.payment_provider ?? 'Pedido web',
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    externalReference: order.external_reference,
    paymentReference: order.mercadopago_payment_id,
    totalAmount: order.total_amount,
    currencyId: order.currency_id,
    items: (items ?? []).map((item) => ({
      title: item.title,
      quantity: item.quantity ?? 1,
      unitPrice: item.unit_price ?? 0,
      lineTotal: item.line_total ?? 0,
    })),
  });

  console.log('Aviso interno enviado OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
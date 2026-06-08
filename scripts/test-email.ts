/**
 * Script de prueba: envía el email de confirmación para un pedido específico.
 * Uso: npx tsx scripts/test-email.ts <order_id>
 */
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '../src/lib/orderEmail';

const orderId = process.argv[2];
if (!orderId) {
  console.error('Uso: npx tsx scripts/test-email.ts <order_id>');
  process.exit(1);
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: order } = await supabase
    .from('web_orders')
    .select('id, buyer_name, buyer_email, external_reference, mercadopago_payment_id, total_amount, currency_id')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) { console.error('Pedido no encontrado'); process.exit(1); }
  if (!order.buyer_email) { console.error('El pedido no tiene buyer_email'); process.exit(1); }

  const { data: items } = await supabase
    .from('web_order_items')
    .select('title, quantity, unit_price, line_total')
    .eq('order_id', orderId);

  console.log(`Enviando email a ${order.buyer_email}...`);

  await sendOrderConfirmationEmail({
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    externalReference: order.external_reference,
    mercadopagoPaymentId: order.mercadopago_payment_id,
    totalAmount: order.total_amount,
    currencyId: order.currency_id,
    items: (items ?? []).map((i) => ({
      title: i.title,
      quantity: i.quantity ?? 1,
      unitPrice: i.unit_price ?? 0,
      lineTotal: i.line_total ?? 0,
    })),
  });

  console.log('Email enviado OK');
}

main().catch((err) => { console.error(err); process.exit(1); });

import AdminOrdersPanel from '../components/AdminOrdersPanel';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminPedidosPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('web_orders')
    .select('id, status, payment_status, external_reference, mercadopago_preference_id, mercadopago_payment_id, buyer_name, buyer_email, buyer_phone, buyer_document_type, buyer_document_number, buyer_address, subtotal_amount, shipping_amount, total_amount, currency_id, notes, notas_internas, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (ordersError) {
    throw new Error(`No se pudieron cargar los pedidos web: ${ordersError.message}`);
  }

  const orderIds = (orders ?? []).map((order) => order.id);
  const { data: orderItems, error: orderItemsError } = orderIds.length === 0
    ? { data: [], error: null }
    : await supabaseAdmin
      .from('web_order_items')
      .select('id, order_id, product_id, title, quantity, unit_price, line_total')
      .in('order_id', orderIds)
      .order('created_at', { ascending: true });

  if (orderItemsError) {
    throw new Error(`No se pudieron cargar los items de pedidos: ${orderItemsError.message}`);
  }

  const itemsByOrderId = new Map<string, typeof orderItems>();

  for (const item of orderItems ?? []) {
    const currentItems = itemsByOrderId.get(item.order_id) ?? [];
    currentItems.push(item);
    itemsByOrderId.set(item.order_id, currentItems);
  }

  const normalizedOrders = (orders ?? []).map((order) => ({
    id: order.id,
    status: order.status,
    paymentStatus: order.payment_status,
    externalReference: order.external_reference,
    mercadopagoPreferenceId: order.mercadopago_preference_id,
    mercadopagoPaymentId: order.mercadopago_payment_id,
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    buyerPhone: order.buyer_phone,
    buyerDocumentType: order.buyer_document_type,
    buyerDocumentNumber: order.buyer_document_number,
    buyerAddress: order.buyer_address,
    subtotalAmount: order.subtotal_amount,
    shippingAmount: order.shipping_amount,
    totalAmount: order.total_amount,
    currencyId: order.currency_id,
    notes: order.notes,
    notasInternas: order.notas_internas,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: (itemsByOrderId.get(order.id) ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      title: item.title,
      quantity: item.quantity ?? 0,
      unitPrice: item.unit_price ?? 0,
      lineTotal: item.line_total ?? 0,
    })),
  }));

  return <AdminOrdersPanel orders={normalizedOrders} />;
}
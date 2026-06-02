import { NextResponse } from 'next/server';
import { createOpenPayOrder, hasOpenPayConfig } from '@/lib/openPayClient';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import type { CheckoutBuyerInput, CheckoutItemInput } from '@/types/mercadopago';
import type { Database, Json } from '@/types/supabase';
import { getShippingCost } from '@/lib/shipping';

interface CheckoutRequestBody {
  items?: CheckoutItemInput[];
  buyer?: CheckoutBuyerInput;
  shipping?: {
    tipo?: string;
    province?: string;
    city?: string;
    postalCode?: string;
    amount?: number;
  };
}

type WebOrderInsert = Database['public']['Tables']['web_orders']['Insert'];
type WebOrderItemInsert = Database['public']['Tables']['web_order_items']['Insert'];

interface PublishedProductForCheckout {
  id: string;
  hermes_id: number | null;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: string | null;
  imagen_url: string | null;
  activo: boolean | null;
  en_oferta: boolean | null;
  descuento_porcentaje: number | null;
}

class CheckoutValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function buildExternalReference() {
  return `pedido-web-op-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function calculateTotalAmount(items: CheckoutItemInput[]) {
  return items.reduce((total, item) => total + Number(item.unit_price) * Number(item.quantity), 0);
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function areAmountsEqual(left: number, right: number) {
  return Math.abs(left - right) < 0.000001;
}

function sanitizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseBuyerInput(buyer: CheckoutRequestBody['buyer'], requireAddress = true) {
  const parsedBuyer = {
    name: sanitizeText(buyer?.name),
    email: sanitizeText(buyer?.email).toLowerCase(),
    phone: sanitizeText(buyer?.phone),
    documentType: sanitizeText(buyer?.documentType),
    documentNumber: sanitizeText(buyer?.documentNumber),
    address: sanitizeText(buyer?.address),
    notes: sanitizeText(buyer?.notes),
  };

  if (!parsedBuyer.name) {
    throw new CheckoutValidationError('Ingresa el nombre y apellido del comprador.');
  }

  if (!isValidEmail(parsedBuyer.email)) {
    throw new CheckoutValidationError('Ingresa un email valido para el pedido.');
  }

  if (parsedBuyer.phone.length < 6) {
    throw new CheckoutValidationError('Ingresa un telefono valido para el pedido.');
  }

  if (!parsedBuyer.documentType) {
    throw new CheckoutValidationError('Selecciona el tipo de documento del comprador.');
  }

  if (parsedBuyer.documentNumber.length < 5) {
    throw new CheckoutValidationError('Ingresa un numero de documento valido.');
  }

  if (requireAddress && parsedBuyer.address.length < 8) {
    throw new CheckoutValidationError('Ingresa una direccion valida para el pedido.');
  }

  return parsedBuyer;
}

type SnapshotRow = Database['public']['Tables']['hermes_erp_snapshot']['Row'];

/** Lee stock y precio desde hermes_erp_snapshot (Supabase) solo para los IDs del carrito. */
async function loadSnapshotMap(products: PublishedProductForCheckout[]): Promise<Map<number, SnapshotRow>> {
  const ids = products
    .map((p) => p.hermes_id)
    .filter((id): id is number => id !== null && id !== undefined);

  if (ids.length === 0) return new Map();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('hermes_erp_snapshot')
    .select('hermes_id, nombre, descripcion, precio_base, stock_disponible, grupo, marca, activo_en_erp, last_sync_at, created_at, updated_at')
    .in('hermes_id', ids);

  if (error) throw new Error(`Error leyendo hermes_erp_snapshot: ${error.message}`);

  const map = new Map<number, SnapshotRow>();
  for (const row of data ?? []) map.set(row.hermes_id, row);
  return map;
}

async function revalidateCheckoutItems(items: CheckoutItemInput[]) {
  const requestedIds = [...new Set(items.map((item) => item.id))];
  const supabaseAdmin = getSupabaseAdmin();
  const { data: publishedProducts, error } = await supabaseAdmin
    .from('productos_publicados')
    .select('id, hermes_id, nombre, descripcion, precio, categoria_id, imagen_url, activo, en_oferta, descuento_porcentaje')
    .in('id', requestedIds)
    .eq('activo', true);

  if (error) {
    throw new Error(`No se pudieron revalidar los productos publicados: ${error.message}`);
  }

  const products = publishedProducts ?? [];

  if (products.length !== requestedIds.length) {
    throw new CheckoutValidationError('Hay productos que ya no estan disponibles para la venta.', 409);
  }

  const publishedProductsMap = new Map(products.map((p) => [p.id, p]));
  const snapshotMap = await loadSnapshotMap(products);

  return items.map((item) => {
    const publishedProduct = publishedProductsMap.get(item.id);

    if (!publishedProduct) {
      throw new CheckoutValidationError('Hay productos que ya no estan disponibles para la venta.', 409);
    }

    const snap =
      publishedProduct.hermes_id !== null && publishedProduct.hermes_id !== undefined
        ? snapshotMap.get(publishedProduct.hermes_id)
        : undefined;

    const liveName = snap?.nombre?.trim() ?? '';
    const livePrice = snap ? parseNumber(snap.precio_base) : null;
    const liveStock = snap ? parseNumber(snap.stock_disponible) : null;
    const basePrice = livePrice ?? Number(publishedProduct.precio);

    if (publishedProduct.hermes_id !== null && publishedProduct.hermes_id !== undefined) {
      if (!snap || liveStock === null) {
        throw new CheckoutValidationError(
          `No pudimos validar el stock de "${liveName || publishedProduct.nombre}". Intenta nuevamente en unos minutos.`,
          409,
        );
      }

      if (liveStock <= 0) {
        throw new CheckoutValidationError(
          `"${liveName || publishedProduct.nombre}" no tiene stock disponible.`,
          409,
        );
      }

      if (item.quantity > liveStock) {
        throw new CheckoutValidationError(
          `Solo hay ${Math.floor(liveStock)} unidades disponibles de "${liveName || publishedProduct.nombre}".`,
          409,
        );
      }
    }

    const enOferta = publishedProduct.en_oferta === true;
    const pct = publishedProduct.descuento_porcentaje;
    const validatedPrice =
      enOferta && pct !== null && pct > 0 && pct < 100
        ? Math.round(basePrice * (1 - pct / 100))
        : basePrice;

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new CheckoutValidationError('Hay cantidades invalidas en el pedido.');
    }

    if (!areAmountsEqual(Number(item.unit_price), validatedPrice)) {
      throw new CheckoutValidationError(
        `El precio de "${liveName || publishedProduct.nombre}" cambio. Actualiza el carrito antes de pagar.`,
        409,
      );
    }

    return {
      id: publishedProduct.id,
      hermes_id: publishedProduct.hermes_id ?? null,
      title: liveName || publishedProduct.nombre,
      description: publishedProduct.descripcion,
      quantity: item.quantity,
      unit_price: validatedPrice,
      currency_id: 'ARS' as const,
      picture_url: publishedProduct.imagen_url ?? undefined,
      category_id: publishedProduct.categoria_id ?? undefined,
    } satisfies CheckoutItemInput;
  });
}

function buildOrderItems(orderId: string, items: CheckoutItemInput[]): WebOrderItemInsert[] {
  return items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    hermes_id: item.hermes_id ?? null,
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

    if (!hasOpenPayConfig()) {
      throw new Error(
        'Falta configurar las variables de OpenPay: OPENPAY_CLIENT_ID, OPENPAY_CLIENT_SECRET, OPENPAY_AUTH_BASE_URL, OPENPAY_CHECKOUT_BASE_URL.',
      );
    }

    const body = (await request.json()) as CheckoutRequestBody;
    const items = Array.isArray(body.items) ? body.items : [];
    const buyer = parseBuyerInput(body.buyer, body.shipping?.tipo !== 'retiro');

    if (items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    const invalidItem = items.find(
      (item) =>
        !item.id ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unit_price) ||
        item.unit_price <= 0,
    );

    if (invalidItem) {
      return NextResponse.json({ error: 'Hay productos inválidos en el pedido.' }, { status: 400 });
    }

    const validatedItems = await revalidateCheckoutItems(items);
    const supabaseAdmin = getSupabaseAdmin();
    const productsTotal = calculateTotalAmount(validatedItems);

    // Validar envío
    const isRetiro = body.shipping?.tipo === 'retiro';
    const shippingProvince = sanitizeText(body.shipping?.province);
    const shippingCity = sanitizeText(body.shipping?.city);
    const shippingPostalCode = sanitizeText(body.shipping?.postalCode);
    if (!isRetiro && !shippingProvince) {
      return NextResponse.json({ error: 'Seleccioná una provincia de destino para el envío.' }, { status: 400 });
    }
    const shippingAmount = isRetiro ? 0 : (getShippingCost(shippingProvince!, productsTotal, shippingCity, shippingPostalCode) ?? 0);
    const totalAmount = productsTotal + shippingAmount;

    const externalReference = buildExternalReference();
    const origin = new URL(request.url).origin;

    const orderPayload: WebOrderInsert = {
      status: 'checkout_generado',
      payment_provider: 'openpay',
      external_reference: externalReference,
      buyer_name: buyer.name,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      buyer_document_type: buyer.documentType,
      buyer_document_number: buyer.documentNumber,
      buyer_address: buyer.address,
      subtotal_amount: productsTotal,
      shipping_amount: shippingAmount,
      shipping_provider: isRetiro ? 'retiro' : 'andreani',
      shipping_service: isRetiro ? 'retiro_en_local' : 'domicilio',
      shipping_payload: isRetiro
        ? { tipo: 'retiro', direccion: 'Pilmaiquén 292, Bahía Blanca', postalCode: '8000' } as Json
        : { province: shippingProvince, city: shippingCity, postalCode: shippingPostalCode } as Json,
      total_amount: totalAmount,
      currency_id: validatedItems[0]?.currency_id ?? 'ARS',
      raw_checkout_payload: toJsonValue({ requested: body, buyer, validatedItems }),
      notes: buyer.notes || null,
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('web_orders')
      .insert(orderPayload)
      .select('id')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'No se pudo crear el pedido web.');
    }

    const orderItemsPayload = buildOrderItems(order.id, validatedItems);
    const { error: orderItemsError } = await supabaseAdmin.from('web_order_items').insert(orderItemsPayload);

    if (orderItemsError) {
      await supabaseAdmin.from('web_orders').delete().eq('id', order.id);
      throw new Error(`No se pudieron guardar los items del pedido: ${orderItemsError.message}`);
    }

    // Construir y crear la orden en OpenPay
    const webhookSecret = process.env.OPENPAY_WEBHOOK_SECRET?.trim() ?? '';
    const webhookUrl = webhookSecret
      ? `${origin}/api/openpay/webhook?secret=${encodeURIComponent(webhookSecret)}`
      : `${origin}/api/openpay/webhook`;

    const openpayOrder = await createOpenPayOrder({
      items: [
        ...validatedItems.map((item, idx) => ({
          id: idx + 1,
          name: item.title,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
        })),
        ...(shippingAmount > 0 ? [{
          id: validatedItems.length + 1,
          name: `Envío a domicilio — ${shippingCity ? shippingCity + ', ' : ''}${shippingProvince}`,
          quantity: 1,
          unitPrice: shippingAmount,
        }] : []),
      ],
      redirectUrls: {
        success: `${origin}/pago/resultado?status=success&ref=${encodeURIComponent(externalReference)}`,
        failed: `${origin}/pago/resultado?status=failure`,
      },
      webhookUrl,
      expireLimitMinutes: 1440, // 24 horas
    });

    const orderUuid = openpayOrder.data.attributes.uuid;
    const checkoutUrl = openpayOrder.data.attributes.links.checkout;

    const { error: updateOrderError } = await supabaseAdmin
      .from('web_orders')
      .update({
        openpay_order_uuid: orderUuid,
        raw_checkout_payload: toJsonValue({ requested: body, buyer, validatedItems, openpayOrder }),
      })
      .eq('id', order.id);

    if (updateOrderError) {
      throw new Error(`Se creó la orden OpenPay pero no se pudo actualizar el pedido: ${updateOrderError.message}`);
    }

    return NextResponse.json({ checkoutUrl, orderUuid, orderId: order.id });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : 'No se pudo generar el checkout de OpenPay.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

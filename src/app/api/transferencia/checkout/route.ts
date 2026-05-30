import { NextResponse } from 'next/server';
import { getHermesProducts } from '@/lib/hermesClient';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import type { CheckoutBuyerInput, CheckoutItemInput } from '@/types/mercadopago';
import type { Database, Json } from '@/types/supabase';
import { getShippingCost } from '@/lib/shipping';
import { applyTransferDiscount, getBankInfo } from '@/lib/transferencia';
import { sendTransferPendingEmail } from '@/lib/orderEmail';

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
  return `pedido-web-tf-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function calculateProductsTotal(items: CheckoutItemInput[]) {
  return items.reduce((total, item) => total + Number(item.unit_price) * Number(item.quantity), 0);
}

function parseHermesId(value: unknown) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
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
  const parsed = {
    name: sanitizeText(buyer?.name),
    email: sanitizeText(buyer?.email).toLowerCase(),
    phone: sanitizeText(buyer?.phone),
    documentType: sanitizeText(buyer?.documentType),
    documentNumber: sanitizeText(buyer?.documentNumber),
    address: sanitizeText(buyer?.address),
    notes: sanitizeText(buyer?.notes),
  };

  if (!parsed.name) throw new CheckoutValidationError('Ingresá el nombre y apellido del comprador.');
  if (!isValidEmail(parsed.email)) throw new CheckoutValidationError('Ingresá un email válido para el pedido.');
  if (parsed.phone.length < 6) throw new CheckoutValidationError('Ingresá un teléfono válido para el pedido.');
  if (!parsed.documentType) throw new CheckoutValidationError('Seleccioná el tipo de documento del comprador.');
  if (parsed.documentNumber.length < 5) throw new CheckoutValidationError('Ingresá un número de documento válido.');
  if (requireAddress && parsed.address.length < 8) throw new CheckoutValidationError('Ingresá una dirección válida para el pedido.');

  return parsed;
}

async function loadLiveHermesProductsMap(products: PublishedProductForCheckout[]) {
  const hasHermesProducts = products.some((p) => p.hermes_id !== null && p.hermes_id !== undefined);
  if (!hasHermesProducts) return new Map<number, Record<string, unknown>>();

  try {
    const hermesProducts = await getHermesProducts();
    const hermesMap = new Map<number, Record<string, unknown>>();
    for (const product of Array.isArray(hermesProducts) ? hermesProducts : []) {
      const hermesId = parseHermesId((product as Record<string, unknown>).Codigo);
      if (hermesId === null) continue;
      hermesMap.set(hermesId, product as Record<string, unknown>);
    }
    return hermesMap;
  } catch {
    return new Map<number, Record<string, unknown>>();
  }
}

async function revalidateCheckoutItems(items: CheckoutItemInput[]) {
  const requestedIds = [...new Set(items.map((item) => item.id))];
  const supabaseAdmin = getSupabaseAdmin();
  const { data: publishedProducts, error } = await supabaseAdmin
    .from('productos_publicados')
    .select('id, hermes_id, nombre, descripcion, precio, categoria_id, imagen_url, activo, en_oferta, descuento_porcentaje')
    .in('id', requestedIds)
    .eq('activo', true);

  if (error) throw new Error(`No se pudieron revalidar los productos publicados: ${error.message}`);

  const products = publishedProducts ?? [];
  if (products.length !== requestedIds.length) {
    throw new CheckoutValidationError('Hay productos que ya no están disponibles para la venta.', 409);
  }

  const publishedProductsMap = new Map(products.map((p) => [p.id, p as PublishedProductForCheckout]));
  const hermesMap = await loadLiveHermesProductsMap(products as PublishedProductForCheckout[]);

  return items.map((item) => {
    const publishedProduct = publishedProductsMap.get(item.id);
    if (!publishedProduct) throw new CheckoutValidationError('Hay productos que ya no están disponibles para la venta.', 409);

    const liveProduct =
      publishedProduct.hermes_id !== null && publishedProduct.hermes_id !== undefined
        ? hermesMap.get(publishedProduct.hermes_id)
        : undefined;

    const liveName = typeof liveProduct?.Descripcion === 'string' ? liveProduct.Descripcion.trim() : '';
    const livePrice = parseNumber(liveProduct?.Precio);
    const liveStock = parseNumber(liveProduct?.Stock);
    const basePrice = livePrice ?? Number(publishedProduct.precio);

    if (publishedProduct.hermes_id !== null && publishedProduct.hermes_id !== undefined) {
      if (!liveProduct || liveStock === null) {
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
      throw new CheckoutValidationError('Hay cantidades inválidas en el pedido.');
    }

    if (!areAmountsEqual(Number(item.unit_price), validatedPrice)) {
      throw new CheckoutValidationError(
        `El precio de "${liveName || publishedProduct.nombre}" cambió. Actualizá el carrito antes de pagar.`,
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

    const body = (await request.json()) as CheckoutRequestBody;
    const items = Array.isArray(body.items) ? body.items : [];
    const isRetiro = body.shipping?.tipo === 'retiro';
    const buyer = parseBuyerInput(body.buyer, !isRetiro);

    if (items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    const invalidItem = items.find(
      (item) =>
        !item.id ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(Number(item.unit_price)) ||
        Number(item.unit_price) <= 0,
    );
    if (invalidItem) {
      return NextResponse.json({ error: 'Hay productos inválidos en el pedido.' }, { status: 400 });
    }

    const validatedItems = await revalidateCheckoutItems(items);
    const supabaseAdmin = getSupabaseAdmin();
    const productsTotal = calculateProductsTotal(validatedItems);

    // Calcular envío
    const shippingProvince = sanitizeText(body.shipping?.province);
    const shippingCity = sanitizeText(body.shipping?.city);
    const shippingPostalCode = sanitizeText(body.shipping?.postalCode);
    if (!isRetiro && !shippingProvince) {
      return NextResponse.json({ error: 'Seleccioná una provincia de destino para el envío.' }, { status: 400 });
    }
    const shippingAmount = isRetiro
      ? 0
      : (getShippingCost(shippingProvince!, productsTotal, shippingCity, shippingPostalCode) ?? 0);

    // Aplicar descuento de transferencia (solo sobre productos)
    const { discountAmount, discountedSubtotal } = applyTransferDiscount(productsTotal);
    const totalAmount = discountedSubtotal + shippingAmount;

    const externalReference = buildExternalReference();

    const orderPayload: WebOrderInsert = {
      status: 'pendiente_transferencia',
      payment_provider: 'transferencia',
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
        ? ({ tipo: 'retiro', direccion: 'Pilmaiquén 292, Bahía Blanca', postalCode: '8000' } as Json)
        : ({ tipo: 'envio', province: shippingProvince, city: shippingCity, postalCode: shippingPostalCode } as Json),
      total_amount: totalAmount,
      currency_id: validatedItems[0]?.currency_id ?? 'ARS',
      discount_amount: discountAmount,
      discount_type: 'transferencia_10',
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

    const { error: orderItemsError } = await supabaseAdmin
      .from('web_order_items')
      .insert(buildOrderItems(order.id, validatedItems));

    if (orderItemsError) {
      await supabaseAdmin.from('web_orders').delete().eq('id', order.id);
      throw new Error(orderItemsError.message);
    }

    // Notificación al admin (silenciosa si Resend no está configurado)
    void sendTransferPendingEmail({
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      externalReference,
      totalAmount,
      discountAmount,
      productsTotal,
      shippingAmount,
      currencyId: validatedItems[0]?.currency_id ?? 'ARS',
      items: validatedItems.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        lineTotal: Number(item.unit_price) * Number(item.quantity),
      })),
    }).catch(() => {
      // email no bloquea el checkout
    });

    return NextResponse.json({
      ok: true,
      externalReference,
      totalAmount,
      discountAmount,
      productsTotal,
      shippingAmount,
      bankInfo: getBankInfo(),
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[transferencia/checkout] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ocurrió un error interno al procesar el pedido.' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { createMercadoPagoCheckoutPreference } from '@/lib/mercadoPago';
import type { CheckoutItemInput } from '@/types/mercadopago';

interface CheckoutRequestBody {
  items?: CheckoutItemInput[];
}

export async function POST(request: Request) {
  try {
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

    const preference = await createMercadoPagoCheckoutPreference({
      items,
      origin: new URL(request.url).origin,
    });

    return NextResponse.json(preference);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo generar el checkout de Mercado Pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
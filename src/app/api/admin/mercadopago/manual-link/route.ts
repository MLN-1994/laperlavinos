import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { createMercadoPagoCheckoutPreference } from '@/lib/mercadoPago';

interface ManualLinkBody {
  title?: unknown;
  description?: unknown;
  amount?: unknown;
  quantity?: unknown;
}

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  try {
    const body = (await request.json()) as ManualLinkBody;

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const amount = Number(body.amount);
    const quantity = Number(body.quantity);

    if (!title) {
      return NextResponse.json({ error: 'Ingresá un título para el link de pago.' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Ingresá un monto válido mayor a 0.' }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Ingresá una cantidad válida mayor a 0.' }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const externalReference = `admin-manual-${Date.now()}`;

    const result = await createMercadoPagoCheckoutPreference({
      items: [
        {
          id: externalReference,
          title,
          description: description || undefined,
          quantity,
          unit_price: amount,
          currency_id: 'ARS',
          category_id: 'manual',
        },
      ],
      origin,
      externalReference,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo generar el link de pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

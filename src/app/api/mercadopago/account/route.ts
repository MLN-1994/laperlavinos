import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import {
  disconnectMercadoPagoAccount,
  getMercadoPagoAccountStatus,
  saveMercadoPagoManualCredentials,
} from '@/lib/mercadoPago';
import type { MercadoPagoManualCredentialsInput } from '@/types/mercadopago';

export async function GET() {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const status = await getMercadoPagoAccountStatus();
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo obtener el estado de Mercado Pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as MercadoPagoManualCredentialsInput;
    const account = await saveMercadoPagoManualCredentials(body);
    return NextResponse.json(account);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar la configuración manual de Mercado Pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    await disconnectMercadoPagoAccount();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo desvincular la cuenta de Mercado Pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
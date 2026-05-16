import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getBaseUrl, exchangeMercadoPagoOAuthCode } from '@/lib/mercadoPago';

/**
 * Verifica que el state sea un payload firmado con HMAC-SHA256 válido y no mayor a 15 minutos.
 */
function verifySignedState(state: string, secret: string): boolean {
  const dotIdx = state.lastIndexOf('.');
  if (dotIdx === -1) return false;
  const payload = state.slice(0, dotIdx);
  const sig = state.slice(dotIdx + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;
  } catch {
    return false;
  }
  // Verificar que no tenga más de 15 minutos
  const ts = parseInt(payload.split('-')[0], 10);
  return !isNaN(ts) && Date.now() - ts < 15 * 60 * 1000;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const adminUrl = `${getBaseUrl(origin)}/admin/mercadopago`;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const mpError = url.searchParams.get('error');

  // Usuario cancelo en Mercado Pago
  if (mpError) {
    return NextResponse.redirect(
      `${adminUrl}?oauth=cancelled`,
    );
  }

  // Verificar state firmado con HMAC (no requiere cookie)
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim();
  if (!state || !clientSecret || !verifySignedState(state, clientSecret)) {
    return NextResponse.redirect(
      `${adminUrl}?oauth=error&reason=${encodeURIComponent('Estado de seguridad invalido. Intenta de nuevo.')}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${adminUrl}?oauth=error&reason=${encodeURIComponent('No se recibio el codigo de autorizacion.')}`,
    );
  }

  try {
    const redirectUri = `${getBaseUrl(origin)}/api/mercadopago/oauth/callback`;
    await exchangeMercadoPagoOAuthCode(code, redirectUri);

    return NextResponse.redirect(`${adminUrl}?oauth=success`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error desconocido.';
    return NextResponse.redirect(
      `${adminUrl}?oauth=error&reason=${encodeURIComponent(reason)}`,
    );
  }
}

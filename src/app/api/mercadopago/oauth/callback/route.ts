import { NextResponse } from 'next/server';
import { getBaseUrl, exchangeMercadoPagoOAuthCode } from '@/lib/mercadoPago';

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

  // Verificar CSRF state
  const cookieHeader = request.headers.get('cookie') ?? '';
  const storedState = cookieHeader.match(/(?:^|;\s*)mp_oauth_state=([^;]+)/)?.[1];

  if (!state || !storedState || state !== storedState) {
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

    const response = NextResponse.redirect(`${adminUrl}?oauth=success`);
    response.cookies.delete('mp_oauth_state');
    return response;
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error desconocido.';
    return NextResponse.redirect(
      `${adminUrl}?oauth=error&reason=${encodeURIComponent(reason)}`,
    );
  }
}

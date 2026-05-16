import { NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';
import { getBaseUrl } from '@/lib/mercadoPago';

/**
 * Genera un state firmado con HMAC-SHA256 que no requiere almacenamiento en cookies.
 * Formato: "<timestamp>-<nonce>.<hmac>"
 */
function buildSignedState(secret: string): string {
  const payload = `${Date.now()}-${randomBytes(8).toString('hex')}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export async function GET(request: Request) {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID?.trim();
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    const reason = encodeURIComponent('Falta configurar las credenciales OAuth en el servidor. Contacta al administrador.');
    const adminUrl = `${getBaseUrl()}/admin/mercadopago?oauth=error&reason=${reason}`;
    return NextResponse.redirect(adminUrl);
  }

  const state = buildSignedState(clientSecret);
  const redirectUri = `${getBaseUrl(new URL(request.url).origin)}/api/mercadopago/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: redirectUri,
    state,
    prompt: 'login',
  });

  const authUrl = `https://auth.mercadopago.com/authorization?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}

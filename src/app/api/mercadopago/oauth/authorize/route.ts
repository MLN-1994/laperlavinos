import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getBaseUrl } from '@/lib/mercadoPago';

export async function GET(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  const clientId = process.env.MERCADOPAGO_CLIENT_ID?.trim();
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    const adminUrl = `${getBaseUrl()}/admin/mercadopago?oauth=error&reason=no_credentials`;
    return NextResponse.redirect(adminUrl);
  }

  const state = randomBytes(20).toString('hex');
  const redirectUri = `${getBaseUrl(new URL(request.url).origin)}/api/mercadopago/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: redirectUri,
    state,
  });

  const authUrl = `https://auth.mercadopago.com.ar/authorization?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('mp_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutos
    path: '/',
  });

  return response;
}

import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getOpenPayToken, hasOpenPayConfig } from '@/lib/openPayClient';

export async function GET() {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  if (!hasOpenPayConfig()) {
    return NextResponse.json({ connected: false, reason: 'no_config' });
  }

  const clientId = process.env.OPENPAY_CLIENT_ID?.trim() ?? '';
  // Mostramos solo los primeros y últimos 4 caracteres del client_id
  const maskedId = clientId.length > 8
    ? `${clientId.slice(0, 4)}...${clientId.slice(-4)}`
    : clientId;

  try {
    await getOpenPayToken();
    return NextResponse.json({
      connected: true,
      maskedClientId: maskedId,
      environment: 'Producción',
    });
  } catch {
    return NextResponse.json({
      connected: false,
      reason: 'auth_failed',
      maskedClientId: maskedId,
    });
  }
}

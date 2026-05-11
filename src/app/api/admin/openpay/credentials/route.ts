import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { saveOpenPayCredentials } from '@/lib/openPayClient';

export async function POST(request: Request) {
  const authError = await requireAdminApiUser();
  if (authError) return authError;

  let body: { clientId?: string; clientSecret?: string };
  try {
    body = (await request.json()) as { clientId?: string; clientSecret?: string };
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud invalido.' }, { status: 400 });
  }

  const clientId = body.clientId?.trim();
  const clientSecret = body.clientSecret?.trim();

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'El Client ID y el Client Secret son obligatorios.' },
      { status: 400 },
    );
  }

  try {
    await saveOpenPayCredentials(clientId, clientSecret);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo guardar la configuracion.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

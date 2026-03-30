import { NextResponse } from 'next/server';

function logWebhook(prefix: string, payload: unknown) {
  console.log(`[MercadoPago webhook] ${prefix}`);
  console.log(JSON.stringify(payload, null, 2));
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const rawBody = await request.text();
    let parsedBody: unknown = rawBody;

    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      parsedBody = rawBody;
    }

    logWebhook('POST recibido', {
      url: url.toString(),
      headers: Object.fromEntries(request.headers.entries()),
      body: parsedBody,
      query: Object.fromEntries(url.searchParams.entries()),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MercadoPago webhook] Error procesando POST', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    logWebhook('GET recibido', {
      url: url.toString(),
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(url.searchParams.entries()),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MercadoPago webhook] Error procesando GET', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
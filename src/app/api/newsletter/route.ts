import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const NEWSLETTER_FROM = process.env.RESEND_FROM_EMAIL?.trim() ?? 'La Perla Vinos <noreply@laperlavinos.com>';
const NEWSLETTER_TO = process.env.RESEND_NOTIFY_EMAIL?.trim() ?? 'laperlavinos@gmail.com';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'El servicio de email no está configurado.' },
      { status: 503 },
    );
  }

  let email: string;
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ingresá un email válido.' }, { status: 400 });
  }

  const resend = new Resend(RESEND_API_KEY);

  // 1. Email de bienvenida al suscriptor
  const welcomeResult = await resend.emails.send({
    from: NEWSLETTER_FROM,
    to: email,
    subject: '¡Bienvenido/a a La Perla Vinos! Tu 10% OFF te espera',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2a2a2a;max-width:600px;width:100%;">
              <!-- Header dorado -->
              <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#a68a5c,transparent);"></td></tr>
              <!-- Logo / Nombre -->
              <tr><td style="padding:36px 40px 20px;text-align:center;">
                <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#a68a5c;">La Perla Vinos</p>
                <h1 style="margin:12px 0 0;font-size:26px;font-weight:300;color:#f0ece6;letter-spacing:-0.5px;">
                  ¡Gracias por suscribirte!
                </h1>
              </td></tr>
              <!-- Cuerpo -->
              <tr><td style="padding:20px 40px 36px;">
                <p style="color:#9e9791;font-size:15px;line-height:1.7;margin:0 0 20px;">
                  A partir de ahora vas a recibir novedades, recomendaciones de sommelier y llegadas exclusivas antes que nadie.
                </p>
                <p style="color:#9e9791;font-size:15px;line-height:1.7;margin:0 0 32px;">
                  Explorá nuestro catálogo y encontrá el vino perfecto para cada ocasión.
                </p>
                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr><td style="background:#a68a5c;padding:0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://laperlavinos.com'}/productos"
                       style="display:block;padding:14px 32px;color:#1a1108;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">
                      Ver catálogo
                    </a>
                  </td></tr>
                </table>
              </td></tr>
              <!-- Footer email -->
              <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#a68a5c,transparent);"></td></tr>
              <tr><td style="padding:20px 40px;text-align:center;">
                <p style="margin:0;font-size:11px;color:#4a4642;">
                  Pilmaiquén 292, Bahía Blanca · <a href="mailto:laperlavinos@gmail.com" style="color:#6a6460;">laperlavinos@gmail.com</a>
                </p>
                <p style="margin:8px 0 0;font-size:10px;color:#3a3632;">
                  Bebé con moderación · Prohibida la venta a menores de 18 años
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  if (welcomeResult.error) {
    console.error('[newsletter] Error enviando email de bienvenida:', welcomeResult.error);
    return NextResponse.json(
      { error: 'No se pudo completar la suscripción. Intentá nuevamente.' },
      { status: 500 },
    );
  }

  // 2. Notificación interna al dueño
  await resend.emails.send({
    from: NEWSLETTER_FROM,
    to: NEWSLETTER_TO,
    subject: `[La Perla] Nueva suscripción al newsletter: ${email}`,
    html: `<p style="font-family:sans-serif;font-size:14px;">Nuevo suscriptor: <strong>${email}</strong></p>`,
  });

  return NextResponse.json({ ok: true });
}

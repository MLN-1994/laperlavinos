import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const FROM = process.env.RESEND_FROM_EMAIL?.trim() ?? 'La Perla Vinos <noreply@laperlavinos.com>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://laperlavinos.com';

export interface OrderConfirmationData {
  buyerName: string;
  buyerEmail: string;
  externalReference: string;
  mercadopagoPaymentId?: string | null;
  totalAmount: number;
  currencyId: string;
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

function formatARS(amount: number, currencyId = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currencyId,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendOrderConfirmationEmail(order: OrderConfirmationData) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY no configurada — email de confirmación omitido.');
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2725;color:#d6cdbf;font-size:14px;">${item.title}</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2725;color:#9e9791;font-size:14px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2725;color:#c9a96e;font-size:14px;text-align:right;">${formatARS(item.lineTotal, order.currencyId)}</td>
      </tr>`,
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2a2a2a;max-width:600px;width:100%;">
            <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#a68a5c,transparent);"></td></tr>

            <tr><td style="padding:36px 40px 20px;text-align:center;">
              <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#a68a5c;">La Perla Vinos</p>
              <h1 style="margin:12px 0 0;font-size:24px;font-weight:300;color:#f0ece6;">¡Tu pedido está confirmado!</h1>
            </td></tr>

            <tr><td style="padding:16px 40px;">
              <p style="color:#9e9791;font-size:15px;line-height:1.7;margin:0;">
                Hola <strong style="color:#f0ece6;">${order.buyerName}</strong>, recibimos tu pago correctamente.
                En breve nos ponemos en contacto para coordinar el envío.
              </p>
            </td></tr>

            <!-- Items -->
            <tr><td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6a6460;padding-bottom:8px;">Producto</th>
                    <th style="text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6a6460;padding-bottom:8px;">Cant.</th>
                    <th style="text-align:right;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6a6460;padding-bottom:8px;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding-top:14px;font-size:13px;color:#9e9791;text-transform:uppercase;letter-spacing:0.1em;">Total pagado</td>
                    <td style="padding-top:14px;font-size:18px;font-weight:700;color:#c9a96e;text-align:right;">${formatARS(order.totalAmount, order.currencyId)}</td>
                  </tr>
                </tfoot>
              </table>
            </td></tr>

            <!-- Referencia -->
            <tr><td style="padding:0 40px 28px;">
              <div style="background:#1a1a1a;border:1px solid #2a2725;border-radius:4px;padding:14px 18px;">
                <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#6a6460;">Referencia de pedido</p>
                <p style="margin:0;font-size:13px;color:#beb9b1;word-break:break-all;">${order.externalReference}</p>
                ${order.mercadopagoPaymentId ? `<p style="margin:6px 0 0;font-size:11px;color:#6a6460;">Pago MP: ${order.mercadopagoPaymentId}</p>` : ''}
              </div>
            </td></tr>

            <!-- CTA -->
            <tr><td style="padding:0 40px 36px;text-align:center;">
              <a href="${BASE_URL}/productos"
                 style="display:inline-block;padding:13px 32px;background:#a68a5c;color:#1a1108;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">
                Seguir comprando
              </a>
            </td></tr>

            <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#a68a5c,transparent);"></td></tr>
            <tr><td style="padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#4a4642;">
                ¿Consultas? Escribinos a <a href="mailto:laperlavinos@gmail.com" style="color:#6a6460;">laperlavinos@gmail.com</a>
                o por <a href="https://wa.me/5492915342403" style="color:#6a6460;">WhatsApp</a>
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#3a3632;">Pilmaiquén 292, Bahía Blanca · Bebé con moderación · Prohibida la venta a menores de 18 años</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const result = await resend.emails.send({
    from: FROM,
    to: order.buyerEmail,
    subject: `¡Tu pedido en La Perla Vinos está confirmado! · ${order.externalReference}`,
    html,
  });

  if (result.error) {
    console.error('[email] Error enviando confirmación de pedido:', result.error);
  } else {
    console.log(`[email] Confirmación enviada a ${order.buyerEmail} pedido=${order.externalReference}`);
  }
}

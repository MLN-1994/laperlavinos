/**
 * transferencia.ts
 * ─────────────────
 * Config y utilidades para pagos por transferencia bancaria.
 *
 * Variables de entorno (agregar en .env.local y en Vercel):
 *   TRANSFER_CBU      → CBU de la cuenta destino (ej: "0110422620042227441006")
 *   TRANSFER_ALIAS    → Alias de la cuenta (ej: "LAPERLA.VINOS")
 *   TRANSFER_TITULAR  → Nombre del titular (ej: "La Perla Vinos")
 *   TRANSFER_BANCO    → Banco (ej: "BBVA")
 *   TRANSFER_NOTIFY_EMAIL → Email del admin para recibir aviso (ej: "laperlavinos@gmail.com")
 */

/** Porcentaje de descuento por pagar con transferencia (solo sobre subtotal de productos) */
export const TRANSFER_DISCOUNT_PCT = 10;

export interface TransferBankInfo {
  cbu: string;
  alias: string;
  titular: string;
  banco: string;
  /** true si los datos mínimos (CBU + alias + titular) están configurados */
  configured: boolean;
}

export function getBankInfo(): TransferBankInfo {
  const cbu     = process.env.TRANSFER_CBU?.trim()     ?? '0150539902000107599755';
  const alias   = process.env.TRANSFER_ALIAS?.trim()   ?? 'gas.aloe.arco';
  const titular = process.env.TRANSFER_TITULAR?.trim() ?? 'Ultra Premium Drink SRL';
  const banco   = process.env.TRANSFER_BANCO?.trim()   ?? 'ICBC';
  return { cbu, alias, titular, banco, configured: !!(cbu && alias && titular) };
}

/**
 * Aplica el descuento de transferencia al subtotal de productos.
 * El descuento NO aplica sobre el costo de envío.
 */
export function applyTransferDiscount(subtotal: number): {
  discountAmount: number;
  discountedSubtotal: number;
} {
  const discountAmount = Math.round(subtotal * TRANSFER_DISCOUNT_PCT / 100);
  return { discountAmount, discountedSubtotal: subtotal - discountAmount };
}

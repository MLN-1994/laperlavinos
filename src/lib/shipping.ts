/**
 * Lógica de envío centralizada.
 * Modificar SOLO aquí cuando cambien los precios de Andreani o el umbral de envío gratis.
 */

export const PATAGONIA_PROVINCES = ['Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'];

/** Precio de envío a domicilio por zona (Andreani, caja 6 botellas ~10kg) */
export const SHIPPING_PATAGONIA = 20990;
export const SHIPPING_GENERAL = 24426;

/** Monto mínimo de subtotal de productos para acceder a envío gratis */
export const FREE_SHIPPING_THRESHOLD = 190000;

/**
 * Calcula el costo de envío según provincia y subtotal de productos.
 * Devuelve 0 si el subtotal supera el umbral de envío gratis.
 * Devuelve null si no se proporcionó provincia.
 */
export function getShippingCost(province: string, subtotal = 0): number | null {
  if (!province) return null;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return PATAGONIA_PROVINCES.includes(province) ? SHIPPING_PATAGONIA : SHIPPING_GENERAL;
}

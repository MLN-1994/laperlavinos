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

/** CP y alias de la ciudad donde está la tienda — envío sin cargo */
export const LOCAL_POSTAL_CODE = '8000';

/** Detecta si la dirección de entrega es local (Bahía Blanca) */
export function isLocalDelivery(city?: string, postalCode?: string): boolean {
  if (postalCode && postalCode.trim() === LOCAL_POSTAL_CODE) return true;
  if (city) {
    const normalized = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('bahia blanca') || normalized.includes('b. blanca')) return true;
  }
  return false;
}

/**
 * Calcula el costo de envío según provincia, subtotal, ciudad y CP.
 * Devuelve 0 si:
 *   - el subtotal supera el umbral de envío gratis, o
 *   - la dirección es en Bahía Blanca (entrega local sin cargo).
 * Devuelve null si no se proporcionó provincia.
 */
export function getShippingCost(province: string, subtotal = 0, city?: string, postalCode?: string): number | null {
  if (!province) return null;
  if (isLocalDelivery(city, postalCode)) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return PATAGONIA_PROVINCES.includes(province) ? SHIPPING_PATAGONIA : SHIPPING_GENERAL;
}

/**
 * Cliente OpenPay (BBVA Argentina) — autenticación y creación de órdenes de pago.
 *
 * Credenciales: se leen primero de la tabla openpay_config en Supabase (configurable
 * desde el panel admin). Si no hay fila en DB, se usan las variables de entorno:
 *   OPENPAY_CLIENT_ID, OPENPAY_CLIENT_SECRET
 *
 * Variables de entorno de infraestructura (siempre requeridas):
 *   OPENPAY_AUTH_BASE_URL       — URL base del Auth Server
 *   OPENPAY_CHECKOUT_BASE_URL   — URL base del Checkout API
 */

import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface OpenPayOrderItem {
  id: number | string;
  name: string;
  quantity: number;
  /** Monto en pesos ARS enteros. Ej: $1500 ARS → 1500. Se multiplica por 100 internamente para enviar en centavos. */
  unitPrice: number;
}

export interface OpenPayShipping {
  name: string;
  /** Monto en pesos ARS enteros. Se multiplica por 100 internamente para enviar en centavos. */
  price: number;
}

export interface OpenPayCreateOrderParams {
  items: OpenPayOrderItem[];
  shipping?: OpenPayShipping;
  redirectUrls?: {
    success: string;
    failed: string;
  };
  webhookUrl?: string;
  /** Tiempo de expiración en minutos (default: 1440 = 24hs) */
  expireLimitMinutes?: number;
}

export interface OpenPayOrderLinks {
  checkout: string;
  redirect_url: {
    success: string | null;
    failed: string | null;
  };
}

export interface OpenPayOrderPayment {
  id: number;
  authorizationCode: string;
  refNumber: string;
  status: string;
}

export interface OpenPayOrder {
  data: {
    id: string;
    type: string;
    attributes: {
      uuid: string;
      orderNumber: string;
      status: string;
      price: { currency: string; amount: number };
      items: Array<{
        name: string;
        quantity: number;
        unitPrice: { currency: string; amount: number };
        itemId: string | null;
      }>;
      links: OpenPayOrderLinks;
      hasPendingPayment: boolean;
      payment: OpenPayOrderPayment | null;
      payments: OpenPayOrderPayment[];
    };
    links: OpenPayOrderLinks[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Caché de token en memoria (scope del proceso serverless)
// ─────────────────────────────────────────────────────────────────────────────

interface TokenCache {
  token: string;
  expiresAt: number; // ms epoch
  clientId: string;  // para invalidar si cambian las credenciales
}

let tokenCache: TokenCache | null = null;

// Renovamos el token 5 minutos antes de que expire para evitar 401 en vuelo
const TOKEN_MARGIN_MS = 5 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de entorno
// ─────────────────────────────────────────────────────────────────────────────

function getEnvOrThrow(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${key}`);
  }
  return value;
}

async function getOpenPayConfig() {
  const authBaseUrl = getEnvOrThrow('OPENPAY_AUTH_BASE_URL').replace(/\/$/, '');
  const checkoutBaseUrl = getEnvOrThrow('OPENPAY_CHECKOUT_BASE_URL').replace(/\/$/, '');

  // Intentar leer credenciales desde Supabase (panel admin)
  if (hasSupabaseAdminConfig()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('openpay_config')
        .select('client_id, client_secret')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.client_id && data?.client_secret) {
        return {
          clientId: data.client_id as string,
          clientSecret: data.client_secret as string,
          authBaseUrl,
          checkoutBaseUrl,
        };
      }
    } catch {
      // Si falla la lectura de DB, usamos env vars
    }
  }

  // Fallback a variables de entorno
  return {
    clientId: getEnvOrThrow('OPENPAY_CLIENT_ID'),
    clientSecret: getEnvOrThrow('OPENPAY_CLIENT_SECRET'),
    authBaseUrl,
    checkoutBaseUrl,
  };
}

export async function saveOpenPayCredentials(clientId: string, clientSecret: string): Promise<void> {
  if (!hasSupabaseAdminConfig()) {
    throw new Error('Supabase no esta configurado.');
  }
  const supabase = getSupabaseAdmin();
  // Eliminar fila existente e insertar nueva (tabla de una sola fila)
  await supabase.from('openpay_config').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase.from('openpay_config').insert({
    client_id: clientId,
    client_secret: clientSecret,
    environment: 'production',
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  // Invalidar cache de token al cambiar credenciales
  tokenCache = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Autenticación — obtener JWT con client_credentials
// ─────────────────────────────────────────────────────────────────────────────

type OpenPayConfigResolved = Awaited<ReturnType<typeof getOpenPayConfig>>;

async function fetchNewToken(config: OpenPayConfigResolved): Promise<TokenCache> {
  const url = `${config.authBaseUrl}/oauth/token`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: '*',
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`OpenPay auth error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: string | number;
  };

  if (!data.access_token) {
    throw new Error('OpenPay no devolvió access_token');
  }

  // La API puede devolver expires_in como Unix timestamp epoch (ej: 1625231197)
  // o como segundos de duración (ej: 3600). Si el valor supera el año 2100 como
  // segundos (año 2100 ~ 4102444800), asumimos que es epoch en segundos.
  const raw = Number(data.expires_in);
  const YEAR_2020_EPOCH = 1577836800; // heurística: cualquier valor >= este es epoch
  const expiresAt = raw >= YEAR_2020_EPOCH
    ? raw * 1000 - TOKEN_MARGIN_MS                   // era epoch en segundos
    : Date.now() + raw * 1000 - TOKEN_MARGIN_MS;     // era duración en segundos

  return { token: data.access_token, expiresAt, clientId: config.clientId };
}

/**
 * Devuelve un token JWT válido, renovándolo automáticamente cuando está por vencer.
 */
export async function getOpenPayToken(): Promise<string> {
  const config = await getOpenPayConfig();

  // Invalidar cache si cambiaron las credenciales
  if (tokenCache && tokenCache.clientId !== config.clientId) {
    tokenCache = null;
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  tokenCache = await fetchNewToken(config);
  return tokenCache.token;
}

// ─────────────────────────────────────────────────────────────────────────────
// Crear orden de pago (intención de pago)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea una intención de pago en OpenPay.
 * Devuelve el objeto Order con el UUID y el link de checkout.
 */
export async function createOpenPayOrder(params: OpenPayCreateOrderParams): Promise<OpenPayOrder> {
  const config = await getOpenPayConfig();
  const token = await getOpenPayToken();
  const url = `${config.checkoutBaseUrl}/api/v2/orders`;

  const body: Record<string, unknown> = {
    data: {
      attributes: {
        currency: '032', // ARS
        items: params.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: {
            currency: '032',
            amount: Math.round(item.unitPrice * 100), // centavos (OpenPay espera unidad mínima)
          },
        })),
        ...(params.shipping && {
          shipping: {
            name: params.shipping.name,
            price: {
              currency: '032',
              amount: Math.round(params.shipping.price * 100), // centavos (OpenPay espera unidad mínima)
            },
          },
        }),
        ...(params.redirectUrls && {
          redirect_urls: {
            success: params.redirectUrls.success,
            failed: params.redirectUrls.failed,
          },
        }),
        ...(params.webhookUrl && { webhookUrl: params.webhookUrl }),
        ...(params.expireLimitMinutes !== undefined && {
          expireLimitMinutes: params.expireLimitMinutes,
        }),
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`OpenPay create order error ${response.status}: ${text}`);
  }

  return (await response.json()) as OpenPayOrder;
}

// ─────────────────────────────────────────────────────────────────────────────
// Consultar estado de una orden
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Consulta el estado de una intención de pago por UUID.
 */
export async function getOpenPayOrder(uuid: string): Promise<OpenPayOrder> {
  const config = await getOpenPayConfig();
  const token = await getOpenPayToken();
  const url = `${config.checkoutBaseUrl}/api/v2/orders/${encodeURIComponent(uuid)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`OpenPay get order error ${response.status}: ${text}`);
  }

  return (await response.json()) as OpenPayOrder;
}

// ─────────────────────────────────────────────────────────────────────────────
// Verificar configuración disponible
// ─────────────────────────────────────────────────────────────────────────────

export function hasOpenPayConfig(): boolean {
  // La config de credenciales puede venir de DB (no verificable aqui sin async).
  // Solo verificamos que las URLs de infraestructura esten configuradas.
  return !!(
    process.env.OPENPAY_AUTH_BASE_URL?.trim() &&
    process.env.OPENPAY_CHECKOUT_BASE_URL?.trim()
  );
}

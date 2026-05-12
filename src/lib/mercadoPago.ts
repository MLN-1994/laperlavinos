import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getSupabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabaseAdmin';
import type {
  CheckoutItemInput,
  MercadoPagoAccountRecord,
  MercadoPagoAccountStatus,
  MercadoPagoManualCredentialsInput,
} from '@/types/mercadopago';

const ACCOUNT_TABLE = 'mercado_pago_accounts';

interface MercadoPagoUserInfo {
  id: string | number;
  nickname?: string;
  email?: string;
  country_id?: string;
}

export interface MercadoPagoPaymentInfo {
  id: string | number;
  status?: string | null;
  status_detail?: string | null;
  external_reference?: string | null;
  transaction_amount?: number | null;
  currency_id?: string | null;
  date_created?: string | null;
  date_approved?: string | null;
  payer?: {
    email?: string | null;
    identification?: {
      type?: string | null;
      number?: string | null;
    } | null;
  } | null;
}

function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || null;
}

function getConfiguredDirectAccessToken() {
  return getOptionalEnv('MERCADOPAGO_ACCESS_TOKEN');
}

function getConfiguredDirectPublicKey() {
  return getOptionalEnv('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY');
}

export function getBaseUrl(origin?: string) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (origin) {
    return origin.replace(/\/$/, '');
  }

  throw new Error('No se pudo determinar la URL base de la aplicación.');
}

async function fetchMercadoPagoUser(accessToken: string) {
  const response = await fetch('https://api.mercadopago.com/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mercado Pago users/me error: ${errorText}`);
  }

  return response.json() as Promise<MercadoPagoUserInfo>;
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = await getValidAccessToken();
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mercado Pago payments/${paymentId} error: ${errorText}`);
  }

  return response.json() as Promise<MercadoPagoPaymentInfo>;
}

interface OAuthTokenData {
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  liveMode?: boolean | null;
  expiresIn?: number | null;
  expiresAt?: string | null;
}

async function upsertMercadoPagoAccount(params: {
  accessToken: string;
  publicKey?: string | null;
  userInfo: MercadoPagoUserInfo;
  oauth?: OAuthTokenData;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const accountsTable = supabaseAdmin.from(ACCOUNT_TABLE);
  const sellerId = String(params.userInfo.id ?? '');

  if (!sellerId) {
    throw new Error('No se pudo obtener el identificador de la cuenta de Mercado Pago.');
  }

  const payload = {
    seller_id: sellerId,
    user_id: typeof params.userInfo.id === 'number' ? params.userInfo.id : null,
    nickname: params.userInfo.nickname ?? null,
    email: params.userInfo.email ?? null,
    country_id: params.userInfo.country_id ?? null,
    public_key: params.publicKey ?? null,
    access_token: params.accessToken,
    refresh_token: params.oauth?.refreshToken ?? null,
    token_type: params.oauth?.tokenType ?? 'Bearer',
    scope: params.oauth?.scope ?? null,
    live_mode: params.oauth?.liveMode ?? null,
    expires_in: params.oauth?.expiresIn ?? null,
    expires_at: params.oauth?.expiresAt ?? null,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await accountsTable.upsert(payload, {
    onConflict: 'seller_id',
  });

  if (error) {
    throw new Error(`Error guardando la cuenta de Mercado Pago: ${error.message}`);
  }
}

export async function saveMercadoPagoManualCredentials(
  credentials: MercadoPagoManualCredentialsInput,
) {
  if (!hasSupabaseAdminConfig()) {
    throw new Error('Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para guardar la cuenta manualmente.');
  }

  const accessToken = credentials.accessToken.trim();

  if (!accessToken) {
    throw new Error('El access token es obligatorio.');
  }

  const userInfo = await fetchMercadoPagoUser(accessToken);

  await upsertMercadoPagoAccount({
    accessToken,
    publicKey: credentials.publicKey?.trim() || null,
    userInfo,
  });

  return {
    sellerId: String(userInfo.id ?? ''),
    nickname: userInfo.nickname ?? null,
  };
}

async function getStoredAccount() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const accountsTable = supabaseAdmin.from(ACCOUNT_TABLE);
  const { data, error } = await accountsTable
    .select('*')
    .order('connected_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error leyendo la cuenta de Mercado Pago: ${error.message}`);
  }

  return (data ?? null) as MercadoPagoAccountRecord | null;
}

export async function getMercadoPagoAccountStatus(): Promise<MercadoPagoAccountStatus> {
  const account = await getStoredAccount();

  if (account) {
    return {
      connected: true,
      mode: 'manual',
      sellerId: account.seller_id,
      nickname: account.nickname,
      email: account.email,
      countryId: account.country_id,
      publicKey: account.public_key,
      liveMode: account.live_mode,
      connectedAt: account.connected_at,
      updatedAt: account.updated_at,
    };
  }

  const directAccessToken = getConfiguredDirectAccessToken();

  if (!directAccessToken) {
    return { connected: false };
  }

  const userInfo = await fetchMercadoPagoUser(directAccessToken);

  return {
    connected: true,
    mode: 'direct',
    sellerId: String(userInfo.id ?? ''),
    nickname: userInfo.nickname ?? 'Cuenta configurada por token',
    email: userInfo.email ?? null,
    countryId: userInfo.country_id ?? null,
    publicKey: getConfiguredDirectPublicKey(),
    liveMode: null,
  };
}

export async function disconnectMercadoPagoAccount() {
  if (hasSupabaseAdminConfig()) {
    const supabaseAdmin = getSupabaseAdmin();
    const accountsTable = supabaseAdmin.from(ACCOUNT_TABLE);
    const { error } = await accountsTable.delete().neq('seller_id', '');

    if (error) {
      throw new Error(`Error eliminando la configuración manual de Mercado Pago: ${error.message}`);
    }

    return;
  }

  throw new Error('La cuenta está configurada por access token en el entorno. Eliminá MERCADOPAGO_ACCESS_TOKEN para desvincularla.');
}

async function getValidAccessToken() {
  const account = await getStoredAccount();

  if (!account) {
    const directAccessToken = getConfiguredDirectAccessToken();

    if (directAccessToken) {
      return directAccessToken;
    }

    throw new Error('No hay ninguna cuenta de Mercado Pago conectada.');
  }

  return account.access_token;
}

export async function createMercadoPagoCheckoutPreference(params: {
  items: CheckoutItemInput[];
  origin?: string;
  externalReference?: string;
}) {
  const accessToken = await getValidAccessToken();
  const baseUrl = getBaseUrl(params.origin);
  const mercadopagoClient = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(mercadopagoClient);
  const externalReference = params.externalReference ?? `pedido-${Date.now()}`;

  const response = await preference.create({
    body: {
      items: params.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: item.currency_id ?? 'ARS',
        picture_url: item.picture_url || undefined,
        category_id: item.category_id || undefined,
      })),
      statement_descriptor: 'LAPERLA VINOS',
      external_reference: externalReference,
      back_urls: {
        success: `${baseUrl}/pago/resultado`,
        failure: `${baseUrl}/pago/resultado`,
        pending: `${baseUrl}/pago/resultado`,
      },
      notification_url: `${baseUrl}/api/mercadopago/webhook?source_news=webhooks`,
      auto_return: 'approved',
    },
  });

  return {
    id: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
    externalReference,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OAuth — intercambio de código y guardado de tokens
// ─────────────────────────────────────────────────────────────────────────────

interface MPOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
  public_key: string;
  live_mode: boolean;
}

export async function exchangeMercadoPagoOAuthCode(
  code: string,
  redirectUri: string,
): Promise<void> {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID?.trim();
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      'Faltan las credenciales OAuth de Mercado Pago en el servidor (CLIENT_ID / CLIENT_SECRET).',
    );
  }

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: tokenBody.toString(),
    cache: 'no-store',
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => '');
    console.error('[MP OAuth] token exchange failed', tokenRes.status, text, { redirectUri, clientId });
    throw new Error(`Mercado Pago OAuth error ${tokenRes.status}: ${text}`);
  }

  const data = (await tokenRes.json()) as MPOAuthTokenResponse;

  if (!data.access_token) {
    throw new Error('Mercado Pago no devolvio access_token.');
  }

  const userInfo = await fetchMercadoPagoUser(data.access_token);
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 0) * 1000).toISOString();

  await upsertMercadoPagoAccount({
    accessToken: data.access_token,
    publicKey: data.public_key ?? null,
    userInfo,
    oauth: {
      refreshToken: data.refresh_token ?? null,
      tokenType: data.token_type ?? 'Bearer',
      scope: data.scope ?? null,
      liveMode: data.live_mode ?? null,
      expiresIn: data.expires_in ?? null,
      expiresAt,
    },
  });
}
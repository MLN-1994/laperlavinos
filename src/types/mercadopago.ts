export interface MercadoPagoAccountRecord {
  id: string;
  seller_id: string;
  user_id: number | null;
  nickname: string | null;
  email: string | null;
  country_id: string | null;
  public_key: string | null;
  access_token: string;
  refresh_token: string | null;
  token_type: string | null;
  scope: string | null;
  live_mode: boolean | null;
  expires_in: number | null;
  expires_at: string | null;
  connected_at: string | null;
  updated_at: string | null;
}

export interface MercadoPagoAccountStatus {
  connected: boolean;
  mode?: 'manual' | 'direct';
  sellerId?: string;
  nickname?: string | null;
  email?: string | null;
  countryId?: string | null;
  publicKey?: string | null;
  liveMode?: boolean | null;
  connectedAt?: string | null;
  updatedAt?: string | null;
}

export interface MercadoPagoManualCredentialsInput {
  accessToken: string;
  publicKey?: string;
}

export interface CheckoutItemInput {
  id: string;
  hermes_id?: number | null;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: 'ARS';
  picture_url?: string;
  category_id?: string;
}

export interface CheckoutBuyerInput {
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  notes?: string;
}
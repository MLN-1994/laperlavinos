import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { PublicityBenefit, PublicityConfig, PublicityIconName } from '@/types/publicity';
import type { Database, Json } from '@/types/supabase';

export const publicityIconOptions: Array<{ value: PublicityIconName; label: string }> = [
  { value: 'truck', label: 'Envio' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'banknotes', label: 'Transferencia' },
];

const defaultBenefits: PublicityBenefit[] = [
  {
    title: 'Envio gratis',
    description: 'CABA y AMBA desde 200.000',
    icon: 'truck',
  },
  {
    title: '3 cuotas sin interés',
    description: 'Tarjetas bancarias Amex, Visa y Master.',
    icon: 'card',
  },
  {
    title: '15% pagando con transferencia',
    description: 'No incluye regalos y cajas navideñas.',
    icon: 'banknotes',
  },
];

export const defaultPublicityConfig: PublicityConfig = {
  id: 'home',
  promo_active: true,
  promo_title: '12 Cuotas Sin Interés + 10% Off Pagando con American Express',
  promo_subtitle: 'Válido para todos los productos con código RG2026',
  promo_heading: 'Catálogo de Regalos 2026',
  promo_cta_label: 'Descargar PDF',
  promo_cta_href: '',
  benefits_active: true,
  benefit_items: defaultBenefits,
};

type PublicityConfigInput = {
  id?: string | null;
  promo_active?: boolean | null;
  promo_title?: string | null;
  promo_subtitle?: string | null;
  promo_heading?: string | null;
  promo_cta_label?: string | null;
  promo_cta_href?: string | null;
  benefits_active?: boolean | null;
  benefit_items?: unknown;
  updated_at?: string | null;
};

function sanitizeVisibility(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function isPublicityIcon(value: unknown): value is PublicityIconName {
  return value === 'truck' || value === 'card' || value === 'banknotes';
}

function sanitizeBenefit(input: unknown, index: number): PublicityBenefit {
  const fallback = defaultBenefits[index] ?? defaultBenefits[0];

  if (!input || typeof input !== 'object') {
    return fallback;
  }

  const value = input as Partial<PublicityBenefit>;

  return {
    title: value.title?.trim() || fallback.title,
    description: value.description?.trim() || fallback.description,
    icon: isPublicityIcon(value.icon) ? value.icon : fallback.icon,
  };
}

export function normalizeBenefitItems(input: unknown): PublicityBenefit[] {
  const items = Array.isArray(input) ? input : [];
  const normalized = [0, 1, 2].map((index) => sanitizeBenefit(items[index], index));
  return normalized;
}

export function normalizePublicityConfig(input: PublicityConfigInput | null | undefined): PublicityConfig {
  return {
    id: input?.id || defaultPublicityConfig.id,
    promo_active: sanitizeVisibility(input?.promo_active, defaultPublicityConfig.promo_active),
    promo_title: input?.promo_title?.trim() || defaultPublicityConfig.promo_title,
    promo_subtitle: input?.promo_subtitle?.trim() || defaultPublicityConfig.promo_subtitle,
    promo_heading: input?.promo_heading?.trim() || defaultPublicityConfig.promo_heading,
    promo_cta_label: input?.promo_cta_label?.trim() || defaultPublicityConfig.promo_cta_label,
    promo_cta_href: input?.promo_cta_href?.trim() || defaultPublicityConfig.promo_cta_href,
    benefits_active: sanitizeVisibility(input?.benefits_active, defaultPublicityConfig.benefits_active),
    benefit_items: normalizeBenefitItems(input?.benefit_items),
    updated_at: input?.updated_at ?? undefined,
  };
}

export async function getHomePublicityConfig(): Promise<PublicityConfig> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('home_publicity')
      .select('*')
      .eq('id', 'home')
      .maybeSingle();

    if (error) {
      return defaultPublicityConfig;
    }

    return normalizePublicityConfig(data);
  } catch {
    return defaultPublicityConfig;
  }
}

export function buildPublicityPayload(
  input: Partial<PublicityConfig>,
): Database['public']['Tables']['home_publicity']['Insert'] {
  const config = normalizePublicityConfig(input);
  const benefitItemsJson: Json = config.benefit_items.map((item) => ({
    title: item.title,
    description: item.description,
    icon: item.icon,
  }));

  return {
    id: 'home',
    promo_active: config.promo_active,
    promo_title: config.promo_title,
    promo_subtitle: config.promo_subtitle,
    promo_heading: config.promo_heading,
    promo_cta_label: config.promo_cta_label,
    promo_cta_href: config.promo_cta_href || null,
    benefits_active: config.benefits_active,
    benefit_items: benefitItemsJson,
  };
}
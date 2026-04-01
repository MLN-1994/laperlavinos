export type PublicityIconName = 'truck' | 'card' | 'banknotes';

export interface PublicityBenefit {
  title: string;
  description: string;
  icon: PublicityIconName;
}

export interface PublicityConfig {
  id: string;
  promo_active: boolean;
  promo_title: string;
  promo_subtitle: string;
  promo_heading: string;
  promo_cta_label: string;
  promo_cta_href?: string;
  benefits_active: boolean;
  benefit_items: PublicityBenefit[];
  updated_at?: string;
}
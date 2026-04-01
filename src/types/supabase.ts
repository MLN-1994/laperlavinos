export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      banners: {
        Row: {
          id: string;
          titulo: string;
          imagen_url: string;
          link: string | null;
          activo: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          titulo: string;
          imagen_url: string;
          link?: string | null;
          activo?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          titulo?: string;
          imagen_url?: string;
          link?: string | null;
          activo?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      home_publicity: {
        Row: {
          id: string;
          promo_active: boolean;
          promo_title: string;
          promo_subtitle: string;
          promo_heading: string;
          promo_cta_label: string;
          promo_cta_href: string | null;
          benefits_active: boolean;
          benefit_items: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          promo_active?: boolean;
          promo_title: string;
          promo_subtitle: string;
          promo_heading: string;
          promo_cta_label: string;
          promo_cta_href?: string | null;
          benefits_active?: boolean;
          benefit_items?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          promo_active?: boolean;
          promo_title?: string;
          promo_subtitle?: string;
          promo_heading?: string;
          promo_cta_label?: string;
          promo_cta_href?: string | null;
          benefits_active?: boolean;
          benefit_items?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mercado_pago_accounts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          seller_id: string;
          user_id?: number | null;
          nickname?: string | null;
          email?: string | null;
          country_id?: string | null;
          public_key?: string | null;
          access_token: string;
          refresh_token?: string | null;
          token_type?: string | null;
          scope?: string | null;
          live_mode?: boolean | null;
          expires_in?: number | null;
          expires_at?: string | null;
          connected_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          seller_id?: string;
          user_id?: number | null;
          nickname?: string | null;
          email?: string | null;
          country_id?: string | null;
          public_key?: string | null;
          access_token?: string;
          refresh_token?: string | null;
          token_type?: string | null;
          scope?: string | null;
          live_mode?: boolean | null;
          expires_in?: number | null;
          expires_at?: string | null;
          connected_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      products_publicados_placeholder: {
        Row: never;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      productos_publicados: {
        Row: {
          id: string;
          hermes_id: number | null;
          nombre: string;
          descripcion: string;
          precio: number;
          categoria_id: string | null;
          imagen_url: string | null;
          destacado: boolean | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          hermes_id?: number | null;
          nombre: string;
          descripcion: string;
          precio: number;
          categoria_id?: string | null;
          imagen_url?: string | null;
          destacado?: boolean | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          hermes_id?: number | null;
          nombre?: string;
          descripcion?: string;
          precio?: number;
          categoria_id?: string | null;
          imagen_url?: string | null;
          destacado?: boolean | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          is_admin: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          is_admin?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          is_admin?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
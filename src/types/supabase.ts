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
          strip_active: boolean;
          strip_text: string;
          strip_link: string | null;
          strip_bg_color: string;
          strip_text_color: string;
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
          strip_active?: boolean;
          strip_text?: string;
          strip_link?: string | null;
          strip_bg_color?: string;
          strip_text_color?: string;
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
          strip_active?: boolean;
          strip_text?: string;
          strip_link?: string | null;
          strip_bg_color?: string;
          strip_text_color?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      home_sections: {
        Row: {
          tipo: string;
          producto_id: string | null;
          producto_nombre: string | null;
          imagen_url: string | null;
          titulo: string | null;
          subtitulo: string | null;
          cita: string | null;
          cta_label: string | null;
          cta_href: string | null;
          activo: boolean;
          updated_at: string | null;
        };
        Insert: {
          tipo: string;
          producto_id?: string | null;
          producto_nombre?: string | null;
          imagen_url?: string | null;
          titulo?: string | null;
          subtitulo?: string | null;
          cita?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          activo?: boolean;
          updated_at?: string | null;
        };
        Update: {
          tipo?: string;
          producto_id?: string | null;
          producto_nombre?: string | null;
          imagen_url?: string | null;
          titulo?: string | null;
          subtitulo?: string | null;
          cita?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          activo?: boolean;
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
      openpay_config: {
        Row: {
          id: string;
          client_id: string;
          client_secret: string;
          environment: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_secret: string;
          environment?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          client_secret?: string;
          environment?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products_publicados_placeholder: {
        Row: never;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      producto_imagenes: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          orden: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          orden?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          orden?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
      hermes_erp_snapshot: {
        Row: {
          hermes_id: number; // BIGINT en Postgres; JS number es seguro hasta 2^53
          nombre: string;
          descripcion: string;
          precio_base: number;
          stock_disponible: number;
          grupo: string | null;
          marca: string | null;
          activo_en_erp: boolean;
          last_sync_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          hermes_id: number;
          nombre: string;
          descripcion: string;
          precio_base: number;
          stock_disponible: number;
          grupo?: string | null;
          marca?: string | null;
          activo_en_erp?: boolean;
          last_sync_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          hermes_id?: number;
          nombre?: string;
          descripcion?: string;
          precio_base?: number;
          stock_disponible?: number;
          grupo?: string | null;
          marca?: string | null;
          activo_en_erp?: boolean;
          last_sync_at?: string;
          created_at?: string;
          updated_at?: string;
        };
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
          en_oferta: boolean | null;
          descuento_porcentaje: number | null;
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
          en_oferta?: boolean | null;
          descuento_porcentaje?: number | null;
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
          en_oferta?: boolean | null;
          descuento_porcentaje?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      web_order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          hermes_id: number | null;
          title: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          product_snapshot: Json;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          hermes_id?: number | null;
          title: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          product_snapshot?: Json;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          hermes_id?: number | null;
          title?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          product_snapshot?: Json;
          created_at?: string | null;
        };
        Relationships: [];
      };
      web_orders: {
        Row: {
          id: string;
          status: string;
          payment_status: string | null;
          external_reference: string;
          mercadopago_preference_id: string | null;
          mercadopago_payment_id: string | null;
          payment_provider: string | null;
          buyer_name: string;
          buyer_email: string | null;
          buyer_phone: string | null;
          buyer_document_type: string | null;
          buyer_document_number: string | null;
          buyer_address: string | null;
          subtotal_amount: number | null;
          shipping_amount: number | null;
          shipping_provider: string | null;
          shipping_service: string | null;
          shipping_payload: Json;
          total_amount: number;
          currency_id: string;
          discount_amount: number;
          discount_type: string | null;
          raw_checkout_payload: Json;
          raw_webhook_payload: Json;
          notes: string | null;
          notas_internas: string | null;
          openpay_order_uuid: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          status?: string;
          payment_status?: string | null;
          external_reference: string;
          mercadopago_preference_id?: string | null;
          mercadopago_payment_id?: string | null;
          payment_provider?: string | null;
          buyer_name: string;
          buyer_email?: string | null;
          buyer_phone?: string | null;
          buyer_document_type?: string | null;
          buyer_document_number?: string | null;
          buyer_address?: string | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          shipping_provider?: string | null;
          shipping_service?: string | null;
          shipping_payload?: Json;
          total_amount: number;
          currency_id?: string;
          discount_amount?: number;
          discount_type?: string | null;
          raw_checkout_payload?: Json;
          raw_webhook_payload?: Json;
          notes?: string | null;
          notas_internas?: string | null;
          openpay_order_uuid?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          status?: string;
          payment_status?: string | null;
          external_reference?: string;
          mercadopago_preference_id?: string | null;
          mercadopago_payment_id?: string | null;
          payment_provider?: string | null;
          buyer_name?: string;
          buyer_email?: string | null;
          buyer_phone?: string | null;
          buyer_document_type?: string | null;
          buyer_document_number?: string | null;
          buyer_address?: string | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          shipping_provider?: string | null;
          shipping_service?: string | null;
          shipping_payload?: Json;
          total_amount?: number;
          currency_id?: string;
          discount_amount?: number;
          discount_type?: string | null;
          raw_checkout_payload?: Json;
          raw_webhook_payload?: Json;
          notes?: string | null;
          notas_internas?: string | null;
          openpay_order_uuid?: string | null;
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
// src/types/banner.ts
export interface Banner {
  id: string;
  titulo: string;
  imagen_url: string;
  link?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

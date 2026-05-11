// Tipos globales para el proyecto laperlavinos

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ProductoPublicado {
  id: string;
  hermes_id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number | null;
  categoria_id?: string;
  imagen_url?: string;
  destacado?: boolean;
  activo?: boolean;
  grupo?: string | null;
  marca?: string | null;
  en_oferta?: boolean | null;
  descuento_porcentaje?: number | null;
}

export interface Banner {
  id: string;
  titulo: string;
  imagen_url: string;
  link?: string;
  activo?: boolean;
}

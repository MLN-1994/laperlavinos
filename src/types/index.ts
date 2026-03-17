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
  categoria_id?: string;
  imagen_url?: string;
  destacado?: boolean;
  activo?: boolean;
}

export interface Banner {
  id: string;
  titulo: string;
  imagen_url: string;
  link?: string;
  activo?: boolean;
}

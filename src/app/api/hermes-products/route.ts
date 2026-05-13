import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getHermesProducts } from '@/lib/hermesClient';
import type { HermesProduct } from '@/hooks/useHermesProducts';

interface HermesRawProduct {
  Codigo?: number | string | null;
  Descripcion?: string | null;
  Precio?: number | string | null;
  Stock?: number | string | null;
  Grupo?: string | null;
  Marca?: string | null;
}

export async function GET() {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    let products: unknown;
    try {
      products = await getHermesProducts();
    } catch {
      return NextResponse.json({ error: 'Hermes no disponible. Verificá la conexión.' }, { status: 503 });
    }
    const safeProducts = Array.isArray(products) ? (products as HermesRawProduct[]) : [];
    const mapped: HermesProduct[] = safeProducts.map((product) => ({
      hermes_id: product.Codigo !== undefined && product.Codigo !== null ? parseInt(String(product.Codigo), 10) : 0,
      nombre: product.Descripcion?.trim() || 'Sin nombre',
      descripcion: product.Descripcion?.trim() || 'Sin descripcion',
      precio: Number(product.Precio) || 0,
      stock: product.Stock !== undefined && product.Stock !== null ? Number(product.Stock) : null,
      grupo: product.Grupo ?? null,
      marca: product.Marca ?? null,
    }));
    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}
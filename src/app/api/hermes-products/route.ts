import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/adminAuth';
import { getHermesProducts } from '@/lib/hermesClient';

export async function GET() {
  const authError = await requireAdminApiUser();

  if (authError) {
    return authError;
  }

  try {
    const products = await getHermesProducts();
    const safeProducts = Array.isArray(products) ? products : [];
    const mapped = safeProducts.map((p: any) => ({
      hermes_id: p.Codigo !== undefined && p.Codigo !== null ? parseInt(p.Codigo, 10) : undefined,
      nombre: p.Descripcion,
      descripcion: p.Descripcion,
      precio: p.Precio,
      stock: p.Stock,
      grupo: p.Grupo,
      marca: p.Marca,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}
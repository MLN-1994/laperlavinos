import { NextResponse } from 'next/server';
import { getHermesProducts } from '@/lib/hermesClient';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function parseHermesId(value: unknown) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  try {
    const { data: publishedProducts, error } = await getSupabaseAdmin()
      .from('productos_publicados')
      .select('id, hermes_id, nombre, descripcion, precio, categoria_id, imagen_url, destacado, activo, en_oferta, descuento_porcentaje')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!publishedProducts || publishedProducts.length === 0) {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    const hermesProducts = await getHermesProducts();
    const hermesMap = new Map<number, Record<string, unknown>>();

    for (const product of Array.isArray(hermesProducts) ? hermesProducts : []) {
      const hermesId = parseHermesId((product as Record<string, unknown>).Codigo);
      if (hermesId === null) {
        continue;
      }
      hermesMap.set(hermesId, product as Record<string, unknown>);
    }

    const mergedProducts = publishedProducts.map((product) => {
      const liveProduct = product.hermes_id !== null && product.hermes_id !== undefined
        ? hermesMap.get(product.hermes_id)
        : undefined;

      const liveName = typeof liveProduct?.Descripcion === 'string' ? liveProduct.Descripcion.trim() : '';
      const livePrice = parseNumber(liveProduct?.Precio);
      const liveStock = parseNumber(liveProduct?.Stock);
      const liveGroup = typeof liveProduct?.Grupo === 'string' ? liveProduct.Grupo : null;
      const liveBrand = typeof liveProduct?.Marca === 'string' ? liveProduct.Marca : null;

      return {
        ...product,
        nombre: liveName || product.nombre,
        descripcion: product.descripcion || liveName,
        precio: livePrice ?? product.precio,
        stock: liveStock,
        grupo: liveGroup,
        marca: liveBrand,
        en_oferta: product.en_oferta ?? false,
        descuento_porcentaje: product.descuento_porcentaje ?? null,
      };
    });

    return NextResponse.json(mergedProducts, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron obtener los productos publicados.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
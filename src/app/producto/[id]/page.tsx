import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getHermesProducts } from '@/lib/hermesClient';
import Header from '@/app/components/Header';
import ProductDetail from '@/app/components/ProductDetail';
import Footer from '@/app/components/Footer';
import Newsletter from '@/app/components/Newsletter';
import { ProductoPublicado, ProductImage } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

function parseHermesId(value: unknown) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStock(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from('productos_publicados')
    .select('id, hermes_id, nombre, descripcion, precio, categoria_id, imagen_url, destacado, activo, en_oferta, descuento_porcentaje')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Traer imágenes adicionales
  const { data: imageRows } = await getSupabaseAdmin()
    .from('producto_imagenes')
    .select('*')
    .eq('product_id', id)
    .order('orden', { ascending: true });

  const images: ProductImage[] = (imageRows ?? []).map((row) => ({
    id: row.id,
    product_id: row.product_id,
    url: row.url,
    orden: row.orden,
    created_at: row.created_at,
  }));

  const product: ProductoPublicado = {
    ...data,
    hermes_id: data.hermes_id ?? undefined,
    categoria_id: data.categoria_id ?? undefined,
    imagen_url: data.imagen_url ?? undefined,
    destacado: data.destacado ?? undefined,
    activo: data.activo ?? undefined,
    en_oferta: data.en_oferta ?? undefined,
    descuento_porcentaje: data.descuento_porcentaje ?? undefined,
  };

  if (data.hermes_id !== null && data.hermes_id !== undefined) {
    try {
      const hermesProducts = await getHermesProducts();
      const liveProduct = Array.isArray(hermesProducts)
        ? hermesProducts.find((entry) => parseHermesId((entry as Record<string, unknown>).Codigo) === data.hermes_id)
        : undefined;

      const liveStock = parseStock((liveProduct as Record<string, unknown> | undefined)?.Stock);
      if (liveStock !== null) {
        product.stock = liveStock;
      }
    } catch {
      // Si Hermes no responde, se mantiene la vista sin stock en vivo.
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#1A120B]">
      <Header />

      <main>
        <ProductDetail product={product} images={images} />
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
}


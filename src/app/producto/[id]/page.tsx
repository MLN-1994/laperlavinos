import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import Header from '@/app/components/Header';
import BannerList from '@/app/components/BannerList';
import ProductDetail from '@/app/components/ProductDetail';
import Footer from '@/app/components/Footer';
import Newsletter from '@/app/components/Newsletter';
import { ProductoPublicado } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getSupabaseAdmin()
    .from('productos_publicados')
    .select('nombre, descripcion, imagen_url, categoria_id')
    .eq('id', id)
    .single();

  if (!data) {
    return { title: 'Producto no encontrado' };
  }

  const title = `${data.nombre}`;
  const description = data.descripcion
    ? data.descripcion.slice(0, 155)
    : `Comprá ${data.nombre} en La Perla Vinos. Vinos de alta gama con envío a todo el país.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.imagen_url ? [{ url: data.imagen_url, alt: data.nombre }] : [],
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getSupabaseAdmin()
    .from('productos_publicados')
    .select('nombre, descripcion, imagen_url, categoria_id')
    .eq('id', id)
    .single();

  if (!data) {
    return { title: 'Producto no encontrado' };
  }

  const title = `${data.nombre} — La Perla Vinos`;
  const description = data.descripcion
    ? data.descripcion.slice(0, 155)
    : `Comprá ${data.nombre} en La Perla Vinos. Vinos de alta gama con envío a todo el país.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.imagen_url ? [{ url: data.imagen_url, alt: data.nombre }] : [],
    },
  };
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <Header />
      <div className="px-3 pt-4 sm:px-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <BannerList />
        </div>
      </div>
      <main>
        <ProductDetail product={product} />
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
}


import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import Header from '@/app/components/Header';
import BannerList from '@/app/components/BannerList';
import ProductDetail from '@/app/components/ProductDetail';
import Footer from '@/app/components/Footer';
import { ProductoPublicado } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from('productos_publicados')
    .select('id, hermes_id, nombre, descripcion, precio, categoria_id, imagen_url, destacado, activo')
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
  };

  return (
    <div className="min-h-screen bg-[#1c1a17] text-[#beb9b1]">
      <Header />
      <div className="px-3 pt-4 sm:px-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <BannerList />
        </div>
      </div>
      <main>
        <ProductDetail product={product} />
      </main>
      <Footer />
    </div>
  );
}


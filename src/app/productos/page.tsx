import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '../components/Header';
import ProductList from '../components/ProductList';
import PromoStrip from '../components/PromoStrip';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Catálogo de vinos',
  description:
    'Explorá nuestra selección completa de vinos de alta gama, espumantes y regalos corporativos. Envíos a todo el país desde Bahía Blanca.',
};

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <PromoStrip />
      <Header />
      <main className="pb-20">
        <section className="mt-10 px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <Suspense fallback={<div className="py-20 text-center text-sm text-[#9E8B7A]">Cargando productos...</div>}>
              <ProductList />
            </Suspense>
          </div>
        </section>
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
}

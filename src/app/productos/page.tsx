import type { Metadata } from 'next';
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
    <div className="relative z-10 min-h-screen text-[#beb9b1]">
      <PromoStrip />
      <Header />
      <main className="relative z-10 pb-20">
        <section className="relative z-10 mt-10 px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <ProductList />
          </div>
        </section>
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
}

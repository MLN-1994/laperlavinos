import Header from './components/Header';
import ProductList from './components/ProductList';
import BannerList from './components/BannerList';
import PublicityHighlights from './components/PublicityHighlights';
import Footer from './components/Footer';
import PromoStrip from './components/PromoStrip';
import Newsletter from './components/Newsletter';

export default function Home() {
  return (
    <div className="relative z-10 min-h-screen text-[#beb9b1]">
      <PromoStrip />
      <Header />
      <main className="relative z-10 pb-20">
        <section className="px-3 pt-4 sm:px-5 md:px-8 lg:px-10 lg:pt-6">
          <div className="mx-auto max-w-[1440px]">
            <BannerList />
          </div>
        </section>

        <PublicityHighlights />

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
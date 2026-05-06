import Header from './components/Header';
import ProductList from './components/ProductList';
import BannerList from './components/BannerList';
import PublicityHighlights from './components/PublicityHighlights';
import HomeBrandOrnaments from './components/HomeBrandOrnaments';
import Footer from './components/Footer';
import PromoStrip from './components/PromoStrip';

export default function Home() {
  return (
    <div className="relative z-10 min-h-screen bg-[radial-gradient(circle_at_top,_rgba(222,153,6,0.08),_transparent_24%),linear-gradient(180deg,_#322f2d_0%,_#3c3c3b_18%,_#2c2c2b_100%)] text-[#beb9b1]">
      <HomeBrandOrnaments />
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
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,_rgba(166,138,92,0.08),_transparent)]" />
          <div className="mx-auto max-w-[1440px]">
            <ProductList />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
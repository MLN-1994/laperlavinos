import Header from './components/Header';
import BannerList from './components/BannerList';
import TrustBar from './components/TrustBar';
import CategoryTiles from './components/CategoryTiles';
import MasVendidos from './components/MasVendidos';
import ElElegido from './components/ElElegido';
import PorQueLaPerla from './components/PorQueLaPerla';
import VinoDelMes from './components/VinoDelMes';
import Resenas from './components/Resenas';
import Footer from './components/Footer';
import PromoStrip from './components/PromoStrip';
import Newsletter from './components/Newsletter';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <PromoStrip />
      <Header />
      <main>
        {/* Hero banner — gestionado desde Admin › Banners */}
        <BannerList />

        {/* Barra de confianza */}
        <TrustBar />

        {/* Tiles de categorías */}
        <CategoryTiles />

        {/* Los más vendidos */}
        <MasVendidos />

        {/* El elegido del mes */}
        <ElElegido />

        {/* Por qué La Perla */}
        <PorQueLaPerla />

        {/* Vino del mes por bodega */}
        <VinoDelMes />

        {/* Reseñas */}
        <Resenas />

        {/* Newsletter */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
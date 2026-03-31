"use client";
import { useBanners } from '../../hooks/useBanners';
import BannerCarrousel from './BannerCarrousel';

export default function BannerList() {
  const { banners, loading, error } = useBanners();

  if (loading) {
    return (
      <div className="rounded-[28px] border border-[#beb9b1]/10 bg-black/20 px-6 py-16 text-center text-sm text-[#beb9b1]/70 backdrop-blur-sm">
        Cargando banners...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-[#d97b70]/20 bg-[#4a2522]/35 px-6 py-16 text-center text-sm text-[#f0b7ae] backdrop-blur-sm">
        Error: {error}
      </div>
    );
  }

  return <BannerCarrousel banners={banners} />;
}
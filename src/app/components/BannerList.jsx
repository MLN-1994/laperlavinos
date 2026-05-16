"use client";
import { useBanners } from '../../hooks/useBanners';
import BannerCarrousel from './BannerCarrousel';

export default function BannerList() {
  const { banners, loading, error } = useBanners();

  if (loading) {
    return (
      <div className="h-[320px] animate-pulse bg-[#E8DFD0] md:h-[420px]" />
    );
  }

  if (error) {
    return (
      <div className="px-6 py-16 text-center text-sm text-[#9E8B7A]">
        Error al cargar banners.
      </div>
    );
  }

  return <BannerCarrousel banners={banners} />;
}
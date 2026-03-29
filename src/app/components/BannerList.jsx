"use client";
import { useBanners } from '../../hooks/useBanners';
import BannerCarrousel from './BannerCarrousel';

export default function BannerList() {
  const { banners, loading, error } = useBanners();

  console.log("BANNERS:", banners);

  if (loading) return <p>Cargando banners...</p>;
  if (error) return <p>Error: {error}</p>;

  return <BannerCarrousel banners={banners} />;
}
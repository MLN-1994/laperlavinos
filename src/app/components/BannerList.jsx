"use client";
import { useBanners } from '../../hooks/useBanners';
import BannerComponent from './Banner';

export default function BannerList() {
  const { banners, loading, error } = useBanners();

  console.log("BANNERS:", banners);

  if (loading) return <p>Cargando banners...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {banners.map(banner => (
        <BannerComponent key={banner.id} banner={banner} />
      ))}
    </div>
  );
}
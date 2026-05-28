"use client";
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'; // Añadimos EffectFade para más elegancia
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade'; // Opcional: si quieres un cambio suave
import { Banner } from '../../types/banner';
import BannerComponent from './Banner';

interface BannerCarrouselProps {
    banners: Banner[];
}

const BannerCarrousel: React.FC<BannerCarrouselProps> = ({ banners }) => {
    if (!banners || banners.length === 0) return null;

    return (
        <div className="w-full mb-4 px-0 md:px-4 lg:px-6">
            <div className="mx-auto w-full lg:max-w-[1080px] xl:max-w-[1180px] 2xl:max-w-[1260px]">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={banners.length > 1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    className="overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.28)] rounded-sm"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <BannerComponent banner={banner} isCarousel={true} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <style jsx global>{`
                .swiper-pagination { bottom: 20px !important; }
                .swiper-pagination-bullet { background: #fff !important; opacity: 0.5; }
                .swiper-pagination-bullet-active { background: #a68a5c !important; opacity: 1; width: 25px; border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default BannerCarrousel;
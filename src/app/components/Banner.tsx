'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Banner } from '../../types/banner';

interface BannerProps {
  banner: Banner;
  isCarousel?: boolean; // <-- Nueva prop
}

const BannerComponent: React.FC<BannerProps> = ({ banner, isCarousel = false }) => {
  const [isVisible, setIsVisible] = useState(isCarousel);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCarousel) {
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [isCarousel]);

  if (!banner.activo) return null;

  const Content = (
    <div className="relative group w-full overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]">
      {/* Overlay de gradiente */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      
      <img
        src={banner.imagen_url}
        alt={banner.titulo}
        className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] object-cover transition-transform duration-[3000ms] group-hover:scale-110"
      />
      
      {/* Título elegante */}
      {banner.titulo && (
        <div className="absolute bottom-10 left-10 z-20">
          <h2 className="text-[#beb9b1] text-2xl md:text-3xl font-serif tracking-[0.2em] uppercase drop-shadow-lg">
            {banner.titulo}
          </h2>
          <div className="w-12 h-[2px] bg-[#a68a5c] mt-4 transition-all duration-1000 group-hover:w-32" />
        </div>
      )}
    </div>
  );

  // Si es carrusel, devolvemos el contenido limpio sin márgenes extras ni containers
  if (isCarousel) {
    return (
      <div 
        ref={domRef}
        className={`w-full transition-all duration-[1200ms] ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {banner.link ? (
          <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block outline-none">
            {Content}
          </a>
        ) : Content}
      </div>
    );
  }

  // Diseño original para cuando se usa solo (fuera del carrusel)
  return (
    <div 
      ref={domRef}
      className={`container mx-auto px-4 my-6 transition-all duration-[1200ms] ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {banner.link ? (
        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block outline-none">
          {Content}
        </a>
      ) : Content}
    </div>
  );
};

export default BannerComponent;
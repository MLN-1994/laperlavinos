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
    <div className="relative group w-full overflow-hidden rounded-sm bg-transparent">
      <img
        src={banner.imagen_url}
        alt={banner.titulo ?? ''}
        className="block w-full h-auto transition-transform duration-[3000ms] group-hover:scale-[1.02]"
      />
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
        {Content}
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
      {Content}
    </div>
  );
};

export default BannerComponent;
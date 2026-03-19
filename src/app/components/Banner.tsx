'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Banner } from '../../types/banner';

interface BannerProps {
  banner: Banner;
}

const BannerComponent: React.FC<BannerProps> = ({ banner }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  // Lógica para detectar el scroll y activar la animación
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 }); // Se activa cuando el 10% del banner es visible

    if (domRef.current) observer.observe(domRef.current);
    
    return () => observer.disconnect();
  }, []);

  if (!banner.activo) return null;

  const Content = (
    <div className="relative group w-full overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]">
      {/* Overlay de gradiente sutil */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#3c3c3b]/60 to-transparent pointer-events-none" />
      
      <img
        src={banner.imagen_url}
        alt={banner.titulo}
        className="w-full h-auto max-h-[400px] object-cover transition-transform duration-[2000ms] group-hover:scale-105"
      />
      
      {/* Título elegante con línea animada */}
      {banner.titulo && (
        <div className="absolute bottom-6 left-6 z-20">
          <h2 className="text-[#beb9b1] text-xl font-serif tracking-widest uppercase opacity-90">
            {banner.titulo}
          </h2>
          <div className="w-8 h-[1px] bg-[#a68a5c] mt-2 transition-all duration-700 group-hover:w-20" />
        </div>
      )}
    </div>
  );

  return (
    /* Ajustamos el margen (my-6) para que no quede tan separado de los productos */
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
      ) : (
        Content
      )}
    </div>
  );
};

export default BannerComponent;
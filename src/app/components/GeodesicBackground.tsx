'use client'
import { useEffect, useState } from 'react';

export default function GeodesicBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Solo activamos el scroll si la ventana existe (Next.js client-side)
    const handleScroll = () => {
      // Opcional: podrías desactivar el cálculo en móviles muy pequeños para ahorrar batería
      // if (window.innerWidth > 768) 
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#3c3c3b] pointer-events-none">
      
      {/* 1. ESFERA PRINCIPAL (Gris Arena) - Reducida en móvil */}
      <div 
        className="absolute -top-10 -left-10 md:-top-20 md:-left-20 w-[300px] md:w-[500px] opacity-15 md:opacity-20 transition-transform duration-75 ease-out"
        style={{ 
          transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.02}deg)`,
          filter: 'sepia(0.2) brightness(1.2)' 
        }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* 2. ESFERA DORADA - Ajustada para no tapar el centro en móviles */}
      <div 
        className="absolute top-[15%] -right-16 md:-right-32 w-[350px] md:w-[600px] opacity-10 transition-transform duration-100 ease-out"
        style={{ 
          transform: `translateY(${scrollY * -0.15}px) rotate(${scrollY * -0.01}deg)`,
          filter: 'invert(65%) sepia(21%) saturate(651%) hue-rotate(3deg) brightness(92%) contrast(88%)'
        }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* 3. ESFERA ROJA - Oculta en móviles para mayor limpieza visual */}
      <div 
        className="hidden md:block absolute top-[60%] left-[15%] w-[180px] opacity-[0.08] transition-transform duration-150 ease-out"
        style={{ 
          transform: `translateY(${scrollY * 0.5}px)`,
          filter: 'invert(22%) sepia(87%) saturate(3736%) hue-rotate(354deg) brightness(89%) contrast(92%)'
        }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* 4. ESFERA OCRE - Oculta en móviles */}
      <div 
        className="hidden md:block absolute bottom-[-10%] right-[20%] w-[300px] opacity-[0.05] transition-transform duration-150 ease-out"
        style={{ 
          transform: `translateY(${scrollY * -0.05}px) rotate(${scrollY * 0.03}deg)`,
          filter: 'invert(62%) sepia(94%) saturate(1915%) hue-rotate(13deg) brightness(94%) contrast(96%)'
        }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

      {/* 5. ESFERA GRIS CLARO - Difuminada (Solo Desktop) */}
      <div 
        className="hidden md:block absolute top-[10%] left-[40%] w-[250px] opacity-[0.07] blur-[2px] transition-transform duration-150 ease-out"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <img src="/assets/diamanteo.svg" alt="" className="w-full h-auto" />
      </div>

    </div>
  );
}
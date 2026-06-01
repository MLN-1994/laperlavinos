'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Banner } from '../../types/banner';

interface BannerProps {
  banner: Banner;
  isCarousel?: boolean; // <-- Nueva prop
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
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

  const hasLink = !!banner.link?.trim();
  const ctaLabel = banner.titulo?.trim() || 'Ver mas';

  const MobileOverlay = hasLink ? (
    <>
      <div className="pointer-events-none absolute right-3 top-3 z-20 sm:hidden">
        <span className="inline-flex items-center gap-1 rounded-sm border border-white/35 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-[5px]">
          {ctaLabel}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
      <span className="sr-only">{ctaLabel}</span>
    </>
  ) : null;

  const Content = (
    <div className="relative group w-full overflow-hidden rounded-sm bg-transparent">
      {hasLink ? (
        <>
          <a
            href={banner.link!}
            aria-label={ctaLabel}
            className="block sm:hidden"
            target={isExternalUrl(banner.link!) ? '_blank' : undefined}
            rel={isExternalUrl(banner.link!) ? 'noopener noreferrer' : undefined}
          >
            <img
              src={banner.imagen_url}
              alt={banner.titulo ? `Banner: ${banner.titulo}` : 'Banner principal'}
              className="block w-full h-auto transition-transform duration-[3000ms] active:scale-[0.995]"
            />
            {MobileOverlay}
          </a>

          <img
            src={banner.imagen_url}
            alt={banner.titulo ? `Banner: ${banner.titulo}` : 'Banner principal'}
            className="hidden w-full h-auto transition-transform duration-[3000ms] group-hover:scale-[1.02] sm:block"
          />
        </>
      ) : (
        <img
          src={banner.imagen_url}
          alt={banner.titulo ? `Banner: ${banner.titulo}` : 'Banner principal'}
          className="block w-full h-auto transition-transform duration-[3000ms] group-hover:scale-[1.02]"
        />
      )}

      {banner.titulo?.trim() && banner.link?.trim() && (
        <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 hidden justify-center px-4 sm:flex md:bottom-16">
          <a
            href={banner.link}
            className="pointer-events-auto inline-flex min-h-[40px] items-center justify-center rounded-sm border border-white/30 bg-white/16 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(0,0,0,0.20)] backdrop-blur-[7px] transition hover:bg-white/24"
            target={isExternalUrl(banner.link) ? '_blank' : undefined}
            rel={isExternalUrl(banner.link) ? 'noopener noreferrer' : undefined}
          >
            <span className="truncate leading-none">{banner.titulo}</span>
          </a>
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
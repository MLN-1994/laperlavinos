'use client';

import Link from 'next/link';
import { useHomeSection } from '@/hooks/useHomeSections';

export default function VinoDelMes() {
  const { section, loading } = useHomeSection('vino_del_mes');

  if (loading) {
    return <section className="h-[280px] animate-pulse bg-[#E8DFD0]" />;
  }

  if (!section || !section.activo) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Texto editorial */}
          <div className="flex flex-col justify-center bg-[#F5EFE6] px-8 py-10 md:px-12 md:py-14">
            {section.subtitulo && (
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C9A96E]">
                {section.subtitulo}
              </p>
            )}
            {section.titulo && (
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight text-[#1A120B] md:text-4xl">
                {section.titulo}
              </h2>
            )}
            {section.cita && (
              <p className="mt-4 text-sm leading-relaxed text-[#6B5744]">{section.cita}</p>
            )}
            <Link
              href={section.cta_href ?? '/productos'}
              className="mt-7 inline-block w-fit border border-[#1A120B] px-7 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#1A120B] transition-colors hover:bg-[#1A120B] hover:text-white"
            >
              {section.cta_label ?? 'Conocer la historia'}
            </Link>
          </div>

          {/* Imagen */}
          <div className="relative flex min-h-[240px] items-center justify-center bg-[#1A120B] md:min-h-[280px] overflow-hidden">
            <img
              src="/assets/diamanteo.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-[0.05]"
            />
            {section.imagen_url ? (
              <img
                src={section.imagen_url}
                alt={section.titulo ?? ''}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />
            ) : (
              <p className="relative text-[10px] uppercase tracking-[0.35em] text-white/25">
                foto del producto
              </p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}


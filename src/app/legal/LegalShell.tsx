import type { ReactNode } from 'react';
import PromoStrip from '@/app/components/PromoStrip';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalShell({ title, lastUpdated, children }: LegalShellProps) {
  return (
    <div className="relative z-10 min-h-screen text-[#beb9b1]">
      <PromoStrip />
      <Header />
      <main className="px-4 py-14 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-3xl">

          {/* Encabezado */}
          <div className="mb-10 border-b border-neutral-800 pb-8">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#a68a5c]">
              La Perla Vinos
            </p>
            <h1 className="font-serif text-3xl font-light tracking-tight text-neutral-100 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-xs text-neutral-600">
              Última actualización: {lastUpdated}
            </p>
          </div>

          {/* Contenido */}
          <div className="prose prose-sm prose-invert max-w-none
            prose-headings:font-serif prose-headings:font-light prose-headings:tracking-tight prose-headings:text-neutral-200
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-neutral-800 prose-h2:pb-2
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-[#c9a96e]
            prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:my-3
            prose-li:text-neutral-400 prose-li:leading-relaxed
            prose-a:text-[#c9a96e] prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-neutral-200
            prose-strong:text-neutral-300 prose-strong:font-semibold">
            {children}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

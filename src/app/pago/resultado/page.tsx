import { Suspense } from 'react';
import type { Metadata } from 'next';
import PromoStrip from '@/app/components/PromoStrip';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ResultadoPago from './ResultadoPago';

export const metadata: Metadata = {
  title: 'Resultado del pago — La Perla Vinos',
  robots: { index: false, follow: false },
};

function LoadingCard() {
  return (
    <div className="w-full max-w-md mx-auto rounded-sm border border-neutral-800 bg-neutral-900/80 px-8 py-16 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-[#a68a5c]" />
      <p className="mt-4 text-sm text-neutral-500">Verificando el estado del pago…</p>
    </div>
  );
}

export default function ResultadoPagoPage() {
  return (
    <div className="relative z-10 min-h-screen text-[#beb9b1]">
      <PromoStrip />
      <Header />
      <main className="flex min-h-[65vh] items-center justify-center px-4 py-16 sm:py-20">
        <Suspense fallback={<LoadingCard />}>
          <ResultadoPago />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

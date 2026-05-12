import Link from 'next/link';
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative z-10 min-h-screen text-[#beb9b1]">
      <Header />
      <main className="flex min-h-[65vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">

          {/* Número 404 decorativo */}
          <p className="font-serif text-[7rem] font-light leading-none tracking-tight text-neutral-800 select-none">
            404
          </p>

          {/* Línea dorada */}
          <div className="mx-auto my-6 h-px w-16 bg-[#a68a5c]" />

          <h1 className="font-serif text-2xl font-light tracking-tight text-neutral-200">
            Página no encontrada
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            El contenido que buscás no existe o fue movido.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-sm bg-[#a68a5c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-[#c9a96e]"
            >
              Ir al inicio
            </Link>
            <Link
              href="/productos"
              className="rounded-sm border border-neutral-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-500"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

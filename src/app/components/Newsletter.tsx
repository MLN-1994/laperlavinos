'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrar con Resend / proveedor de email
  }

  return (
    <section className="relative w-full border-y border-neutral-800 bg-neutral-900/90 backdrop-blur-sm">
      {/* Línea dorada superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a68a5c]/60 to-transparent" />

      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:py-14 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-12">

          {/* Texto */}
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a68a5c]">
              Newsletter
            </p>
            <h2 className="font-serif text-2xl font-light tracking-tight text-neutral-200 sm:text-3xl">
              10% OFF en tu primera compra
            </h2>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-neutral-400">
              Suscribite y recibí novedades, recomendaciones y descuentos exclusivos.
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu mail..."
              className="flex-1 rounded-l-[4px] rounded-r-none border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-[#a68a5c]/70 focus:ring-1 focus:ring-[#a68a5c]/30 sm:rounded-r-none"
            />
            <button
              type="submit"
              className="rounded-r-[4px] rounded-l-none border border-l-0 border-neutral-700 bg-neutral-800 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition-colors duration-200 hover:bg-[#a68a5c] hover:border-[#a68a5c] hover:text-neutral-900 sm:rounded-l-none"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>

      {/* Línea dorada inferior */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#a68a5c]/60 to-transparent" />
    </section>
  );
}

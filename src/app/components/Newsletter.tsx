'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'No se pudo suscribir. Intentá nuevamente.');
        setStatus('error');
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch {
      setErrorMsg('Error de conexión. Intentá nuevamente.');
      setStatus('error');
    }
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
              Novedades y recomendaciones
            </h2>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-neutral-400">
              Suscribite y enterate primero de nuevos vinos, llegadas exclusivas y eventos.
            </p>
          </div>

          {/* Formulario */}
          {status === 'success' ? (
            <div className="flex w-full max-w-md items-center justify-center rounded-[4px] border border-[#a68a5c]/40 bg-[#a68a5c]/10 px-6 py-4">
              <p className="text-sm text-[#c9a96e]">
                ¡Listo! Ya estás suscripto/a. Pronto vas a recibir novedades.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:gap-0"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                placeholder="tu mail..."
                className="flex-1 rounded-l-[4px] rounded-r-none border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-[#a68a5c]/70 focus:ring-1 focus:ring-[#a68a5c]/30 sm:rounded-r-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-r-[4px] rounded-l-none border border-l-0 border-neutral-700 bg-neutral-800 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition-colors duration-200 hover:bg-[#a68a5c] hover:border-[#a68a5c] hover:text-neutral-900 sm:rounded-l-none disabled:opacity-60"
              >
                {status === 'loading' ? '...' : 'Enviar'}
              </button>
              {status === 'error' && (
                <p className="w-full text-xs text-red-400 sm:absolute sm:bottom-3">
                  {errorMsg}
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Línea dorada inferior */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#a68a5c]/60 to-transparent" />
    </section>
  );
}

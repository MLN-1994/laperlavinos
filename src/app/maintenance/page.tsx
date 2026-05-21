import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Próximamente — La Perla Vinos',
  description: 'Estamos preparando algo especial para vos.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main
      style={{ backgroundColor: 'var(--lp-bg)', color: 'var(--lp-text)' }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="flex flex-col items-center gap-8 max-w-md">
        <Image
          src="/img/logo_Gris.png"
          alt="La Perla Vinos"
          width={180}
          height={90}
          priority
        />

        <div className="flex flex-col gap-3">
          <h1
            className="text-3xl sm:text-4xl"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--lp-text)' }}
          >
            Estamos por abrir
          </h1>
          <p style={{ color: 'var(--lp-text-muted)' }} className="text-base leading-relaxed">
            Nuestra tienda online está en sus últimos detalles.<br />
            Pronto vas a poder explorar y comprar nuestros vinos.
          </p>
        </div>

        <div
          style={{ borderColor: 'var(--lp-gold)', color: 'var(--lp-gold)' }}
          className="border-t pt-6 w-full text-sm"
        >
          <p>Consultas por WhatsApp o redes sociales.</p>
        </div>
      </div>
    </main>
  );
}

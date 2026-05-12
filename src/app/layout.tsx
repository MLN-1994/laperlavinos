import type { Metadata } from "next";
import "./globals.css";
import GeodesicBackground from "./components/GeodesicBackground";
import WhatsAppButton from "./components/WhatsAppButton";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://laperlavinos.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'La Perla Vinos — Vinos de alta gama | Bahía Blanca',
    template: '%s — La Perla Vinos',
  },
  description:
    'Tienda online de vinos de alta gama y regalos corporativos. Envíos a todo el país. Pilmaiquén 292, Bahía Blanca.',
  keywords: ['vinos', 'alta gama', 'vinos online', 'regalos corporativos', 'Bahía Blanca', 'La Perla Vinos'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: APP_URL,
    siteName: 'La Perla Vinos',
    title: 'La Perla Vinos — Vinos de alta gama | Bahía Blanca',
    description:
      'Tienda online de vinos de alta gama y regalos corporativos. Envíos a todo el país.',
    images: [{ url: '/img/logo_Gris.png', width: 400, height: 200, alt: 'La Perla Vinos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Perla Vinos — Vinos de alta gama | Bahía Blanca',
    description: 'Tienda online de vinos de alta gama y regalos corporativos.',
    images: ['/img/logo_Gris.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <GeodesicBackground />
        <div className="relative z-10">
          {children}
        </div>
        <WhatsAppButton />
      </body>
    </html>
  );
}
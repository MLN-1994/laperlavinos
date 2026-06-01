import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon-32x32.png',
    apple: '/favicon/favicon-32x32.png',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <div className="relative">
          {children}
        </div>
        <WhatsAppButton />
      </body>
    </html>
  );
}
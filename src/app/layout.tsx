// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // ¡Importante para que Tailwind funcione!
import GeodesicBackground from "./components/GeodesicBackground";

export const metadata: Metadata = {
  title: "Mi Ecommerce",
  description: "Venta de productos con stock en tiempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <GeodesicBackground />
        {children}
      </body>
    </html>
  );
}
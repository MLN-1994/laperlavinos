'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../../store/useCartStore';
import { useEffect, useState } from 'react';
import CartDrawer from './CartDrawer';

export default function Header() {
  const cart = useCartStore((state) => state.cart);
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Cambiamos bg-white/80 por el oscuro de la marca con blur */}
      <header className="sticky top-0 z-50 w-full border-b border-[#beb9b1]/10 bg-[#3c3c3b]/60 backdrop-blur-md transition-all">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          
          {/* Logo - Quitamos el text-blue y hover:opacity */}
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            {/* Si tu logo tiene letras negras, quizás debas usar una versión blanca o el filtro invert */}
            <Image 
              src="/img/logo_Gris.png" 
              alt="Logo La Perla" 
              width={100} 
              height={50} 
              className="brightness-150" // Para que resalte sobre el fondo oscuro
            />
          </Link>

          {/* Navegación - Colores de la paleta */}
          <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-[0.2em]">
            <Link href="/" className="text-[#beb9b1] hover:text-[#a68a5c] transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="text-[#beb9b1] hover:text-[#a68a5c] transition-colors">
              Productos
            </Link>
          </nav>

          {/* Icono Carrito */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-[#beb9b1]/10 rounded-full transition-all group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" // Más fino se ve más premium
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-[#beb9b1] group-hover:text-[#a68a5c] transition-colors"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#de9906] text-[9px] font-bold text-[#3c3c3b] shadow-sm border border-[#3c3c3b]">
  {totalItems}
</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}
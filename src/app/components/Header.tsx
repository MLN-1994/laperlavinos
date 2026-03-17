'use client'; 

import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore'; // Ajustado a tu ruta
import { useEffect, useState } from 'react';
import CartDrawer from './CartDrawer'; // Importamos el componente pro que creamos

export default function Header() {
  const cart = useCartStore((state) => state.cart);
  const [mounted, setMounted] = useState(false);
  
  // Nuevo estado para abrir/cerrar el carrito lateral
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition">
            La <br />Perla Vinos
          </Link>

          {/* Navegación Simple */}
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-blue-500 transition text-gray-600">Inicio</Link>
            <Link href="/productos" className="hover:text-blue-500 transition text-gray-600">Productos</Link>
          </nav>

          {/* Icono Carrito Dinámico */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)} // Al hacer clic se abre el modal
              className="relative p-2 hover:bg-gray-100 rounded-full transition group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-gray-700 group-hover:text-blue-600"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white animate-in zoom-in shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Renderizamos el CartDrawer aquí abajo */}
      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}
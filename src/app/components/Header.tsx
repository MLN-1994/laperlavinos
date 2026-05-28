'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../../store/useCartStore';
import { useState, useRef } from 'react';
import CartDrawer from './CartDrawer';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type SubItem = { label: string; href: string };
type NavItem  = { label: string; href: string; sub?: SubItem[] };

const NAV_ITEMS: NavItem[] = [
  {
    label: 'VINOS',
    href: '/productos',
    sub: [
      { label: 'Vinos tintos',   href: '/productos?categoria=VINOS+TINTOS'   },
      { label: 'Vinos blancos',  href: '/productos?categoria=VINOS+BLANCOS'  },
      { label: 'Vinos rosados',  href: '/productos?categoria=VINOS+ROSADOS'  },
      { label: 'Vinos naranjos', href: '/productos?categoria=VINOS+NARANJOS' },
      { label: 'Cava',           href: '/productos?categoria=CAVA'           },
    ],
  },
  { label: 'ESPUMANTES',   href: '/productos?categoria=ESPUMANTES'                },
  { label: 'WHISKYS',      href: '/productos?categoria=WHISKY'                    },
  { label: 'GIN',          href: '/productos?categoria=GIN'                       },
  { label: 'PARA REGALAR', href: '/productos?categoria=PARA+REGALAR' },
  { label: 'CRISTALERÍA',  href: '/productos?categoria=CRISTALERIA'               },
  {
    label: 'OTROS',
    href: '/productos',
    sub: [
      { label: 'Vodka',                   href: '/productos?categoria=VODKA'                       },
      { label: 'Coñac y brandys',         href: '/productos?categoria=COGNAC+Y+BRANDYS'            },
      { label: 'Aperitivos',              href: '/productos?categoria=APERITIVOS'                  },
      { label: 'Tequila',                 href: '/productos?categoria=TEQUILA'                     },
      { label: 'Ron',                     href: '/productos?categoria=RON'                         },
      { label: 'Licores',                 href: '/productos?categoria=LICORES'                     },
      { label: 'Spirits',                 href: '/productos?categoria=SPIRITS'                     },
      { label: 'Cervezas importadas',     href: '/productos?categoria=CERVEZAS+IMPORTADAS'         },
      { label: 'Gaseosas, jugos y aguas', href: '/productos?categoria=GASEOSAS%2C+JUGOS+Y+AGUAS'   },
      { label: 'Almacén',                 href: '/productos?categoria=ALMACEN'                     },
      { label: 'Regalería / Accesorios',  href: '/productos?categoria=REGALERIA+%2F+ACCESORIOS'    },
    ],
  },
];

export default function Header() {
  const cart = useCartStore((state) => state.cart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#E8DFD0] bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-75">
            <Image
              src="/img/LOGOLaPerla.png"
              alt="La Perla Vinos"
              width={90}
              height={45}
              className="h-auto w-[80px] md:w-[90px]"
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) =>
              item.sub ? (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A120B] hover:text-[#C9A96E] transition-colors"
                  >
                    {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-px transition-transform duration-150 group-hover:rotate-180">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-lg border border-[#E8DFD0] bg-white py-1 shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150">
                    {item.sub.map((sub) => (
                      <Link key={sub.href} href={sub.href} className="block px-4 py-2 text-xs text-[#1A120B] hover:bg-[#F5EFE6] hover:text-[#C9A96E] transition-colors">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A120B] hover:text-[#C9A96E] transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Acciones: búsqueda + carrito + hamburger */}
          <div className="flex items-center gap-1">

            {/* Botón buscar */}
            <button
              onClick={isSearchOpen ? closeSearch : openSearch}
              className="p-2 rounded-full hover:bg-[#F5EFE6] transition-colors group"
              aria-label={isSearchOpen ? 'Cerrar búsqueda' : 'Buscar productos'}
            >
              {isSearchOpen
                ? <XMarkIcon className="h-5 w-5 text-[#1A120B] group-hover:text-[#C9A96E] transition-colors" />
                : <MagnifyingGlassIcon className="h-5 w-5 text-[#1A120B] group-hover:text-[#C9A96E] transition-colors" />
              }
            </button>

            {/* Botón carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-[#F5EFE6] transition-colors group"
              aria-label="Abrir carrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#1A120B] group-hover:text-[#C9A96E] transition-colors"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A120B] text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Hamburger — visible bajo lg */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-[#F5EFE6] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1A120B" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1A120B" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* Barra de búsqueda expandible */}
        {isSearchOpen && (
          <div className="border-t border-[#E8DFD0] bg-white px-6 py-3">
            <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-2xl items-center gap-3">
              <MagnifyingGlassIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                placeholder="Buscá vinos, whiskys, gin, regalos..."
                className="flex-1 bg-transparent py-1 text-sm text-[#1A120B] placeholder:text-neutral-400 outline-none"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="rounded-sm bg-[#1A120B] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#C9A96E] transition-colors"
                >
                  Buscar
                </button>
              )}
            </form>
          </div>
        )}

        {/* Menú mobile desplegable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8DFD0] bg-white px-6 py-4">
            {/* Buscador mobile */}
            <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center gap-2 rounded-sm border border-[#E8DFD0] bg-[#F5EFE6] px-3 py-2">
              <MagnifyingGlassIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent text-sm text-[#1A120B] placeholder:text-neutral-400 outline-none"
                autoComplete="off"
              />
            </form>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) =>
                item.sub ? (
                  <div key={item.label}>
                    <button
                      onClick={() => setMobileExpandedItem(mobileExpandedItem === item.label ? null : item.label)}
                      className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#1A120B]"
                    >
                      {item.label}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${mobileExpandedItem === item.label ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                    {mobileExpandedItem === item.label && (
                      <div className="ml-3 flex flex-col border-l border-[#E8DFD0] pl-3 pb-2">
                        {item.sub.map((sub) => (
                          <Link key={sub.href} href={sub.href} onClick={() => { setIsMobileMenuOpen(false); setMobileExpandedItem(null); }} className="py-1.5 text-sm text-[#6B5744] hover:text-[#C9A96E] transition-colors">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setIsMobileMenuOpen(false); setMobileExpandedItem(null); }}
                    className="py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#1A120B] hover:text-[#C9A96E] transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}

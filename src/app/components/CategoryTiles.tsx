import Link from 'next/link';

const TILES = [
  {
    label: 'VINOS',
    sub: 'Tintos · Blancos · Rosados · Naranjos',
    href: '/productos',
  },
  {
    label: 'WHISKY',
    sub: 'Single Malt · Blended · Bourbon',
    href: '/productos?categoria=WHISKY',
  },
  {
    label: 'PARA REGALAR',
    sub: 'Cajas · Sets · Accesorios',
    href: '/productos?categoria=PARA+REGALAR',
  },
];

export default function CategoryTiles() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group relative flex h-[140px] items-center justify-center overflow-hidden bg-[#1A120B]"
          >
            {/* Diamante decorativo de fondo */}
            <img
              src="/assets/diamanteo.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-[0.07] transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay dorado en hover */}
            <div className="absolute inset-0 bg-[#C9A96E]/0 transition-colors duration-300 group-hover:bg-[#C9A96E]/10" />
            {/* Texto */}
            <div className="relative z-10 text-center">
              <p className="font-display text-xl font-bold uppercase tracking-[0.28em] text-white">
                {tile.label}
              </p>
              <p className="mt-1.5 text-[11px] font-light tracking-[0.12em] text-white/50">
                {tile.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

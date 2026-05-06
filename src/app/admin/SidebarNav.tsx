"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/publicidad", label: "Publicidad" },
  { href: "/admin/mercadopago", label: "Mercado Pago" },
];

interface SidebarNavProps {
  onNavClick?: () => void;
}

export default function SidebarNav({ onNavClick }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2.5">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-2xl px-4 py-3 text-sm font-medium tracking-[0.02em] transition-all md:px-4 md:py-3 ${
            pathname === item.href
              ? "border border-[#a68a5c]/30 bg-[#a68a5c]/15 text-[#c9a96e]"
              : "border border-transparent bg-white/0 text-[#beb9b1]/60 hover:border-white/8 hover:bg-white/5 hover:text-[#beb9b1]"
          }`}
          onClick={onNavClick}
        >
          <span className="block">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

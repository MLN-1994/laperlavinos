"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/publicidad", label: "Publicidad" },
];

interface SidebarNavProps {
  onNavClick?: () => void;
}

export default function SidebarNav({ onNavClick }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded transition-colors ${
            pathname === item.href
              ? "bg-blue-600 text-white font-semibold"
              : "hover:bg-blue-100 text-gray-800"
          }`}
          onClick={onNavClick}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

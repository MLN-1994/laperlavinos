"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/publicidad", label: "Publicidad" },
];

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2 p-4 border-r min-h-screen bg-gray-50">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded transition-colors ${
            pathname === item.href
              ? "bg-blue-600 text-white font-semibold"
              : "hover:bg-blue-100 text-gray-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

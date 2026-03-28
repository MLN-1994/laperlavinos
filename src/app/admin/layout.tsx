"use client";
import React, { useState } from "react";
import SidebarNav from "./SidebarNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handler para cerrar el sidebar al hacer click en un link (solo mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-white relative z-10" style={{ background: 'white' }}>
      {/* Botón menú hamburguesa solo en mobile, FUERA del panel */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white border border-slate-200 rounded-lg p-2 shadow"
        aria-label="Abrir menú"
        onClick={() => setSidebarOpen(true)}
        style={{ top: 20, left: 16 }}
      >
        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col py-8 px-4 z-50
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-56 md:z-20
        `}
        style={{ minWidth: "14rem" }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-indigo-700">Panel Admin</h1>
          {/* Botón cerrar solo en mobile */}
          <button
            className="md:hidden p-2 rounded hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Pasar handler para cerrar al hacer click en un link */}
        <SidebarNav onNavClick={handleNavClick} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 z-20">{children}</main>
    </div>
  );
}

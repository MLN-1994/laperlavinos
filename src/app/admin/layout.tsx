"use client";
import React, { useState } from "react";
import SidebarNav from "./SidebarNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavClick = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-white relative"> {/* Quitamos z-10 innecesario */}
      
      {/* BOTÓN: Subimos z-index a 50 y quitamos styles en línea */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white border border-slate-200 rounded-lg p-2 shadow-lg active:scale-95 transition-transform"
        aria-label="Abrir menú"
        onClick={() => setSidebarOpen(true)}
      >
        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* OVERLAY: z-40 está bien */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Subimos z-index a 50 para que cubra el botón al abrirse */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col py-8 px-4 z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-56
        `}
        style={{ minWidth: "14rem" }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-indigo-700">Panel Admin</h1>
          <button
            className="md:hidden p-2 rounded hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarNav onNavClick={handleNavClick} />
      </aside>

      {/* MAIN: Añadimos pt-20 para que el contenido no quede debajo del botón en mobile */}
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
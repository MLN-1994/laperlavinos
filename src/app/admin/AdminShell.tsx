'use client';

import React, { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import AdminSignOutButton from './AdminSignOutButton';

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export default function AdminShell({ children, userEmail }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-neutral-50 text-neutral-800">
      <button
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2.5 shadow-lg shadow-neutral-200/60 transition-transform active:scale-95 md:hidden"
        aria-label="Abrir menu"
        onClick={() => setSidebarOpen(true)}
      >
        <svg className="h-6 w-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">Menu</span>
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[86vw] max-w-[20rem] flex-col border-r border-neutral-700 bg-neutral-900 px-5 py-6 text-neutral-100 shadow-2xl shadow-black/20 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:w-64 md:translate-x-0`}
        style={{ minWidth: '16rem' }}
      >
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-neutral-700 pb-5 md:mb-8 md:border-b-0 md:pb-0">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-[#a68a5c]/40 bg-[#a68a5c]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9a96e]">
              La Perla Vinos
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">Panel Admin</h1>
              <p className="mt-1 max-w-[14rem] text-sm leading-5 text-neutral-400">
                Gestión de catálogo, contenido y configuración comercial.
              </p>
            </div>
            {userEmail && <p className="max-w-[15rem] truncate text-xs text-neutral-500">Sesión: {userEmail}</p>}
          </div>
          <button
            className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-6 overflow-y-auto pb-2">
          <div className="space-y-4">
            <div className="md:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Navegación</p>
            </div>
            <SidebarNav onNavClick={handleNavClick} />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-neutral-700 bg-neutral-800 p-3">
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-neutral-400">Cuenta</p>
              <AdminSignOutButton className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700" />
            </div>

            <p className="px-1 text-[11px] leading-5 text-neutral-500 md:hidden">
              Administrá contenido, catálogo y cobros desde un solo panel.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-4 pt-20 md:p-8 md:pt-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
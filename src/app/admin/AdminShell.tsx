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
    <div className="relative flex min-h-screen bg-[linear-gradient(180deg,_#f4efe7_0%,_#efe8dd_52%,_#ebe3d7_100%)] text-slate-900">
      <button
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-[#4d443b]/15 bg-[#2f2b28] px-3 py-2.5 shadow-lg shadow-black/15 transition-transform active:scale-95 md:hidden"
        aria-label="Abrir menu"
        onClick={() => setSidebarOpen(true)}
      >
        <svg className="h-6 w-6 text-[#f7f0e2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f7f0e2]">Menu</span>
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#181412]/45 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[86vw] max-w-[20rem] flex-col border-r border-white/5 bg-[#2c2825] px-5 py-6 text-[#f4ede0] shadow-2xl shadow-black/20 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:w-64 md:translate-x-0`}
        style={{ minWidth: '16rem' }}
      >
        <div className="mb-6 flex items-start justify-between gap-3 border-b border-white/8 pb-5 md:mb-8 md:border-b-0 md:pb-0">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cab89d]">
              La Perla Vinos
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#f7f0e2]">Panel Admin</h1>
              <p className="mt-1 max-w-[14rem] text-sm leading-5 text-[#c8bdaa]">
                Gestión de catálogo, contenido y configuración comercial.
              </p>
            </div>
            {userEmail && <p className="max-w-[15rem] truncate text-xs text-[#a89f91]">Sesión: {userEmail}</p>}
          </div>
          <button
            className="rounded-lg p-2 text-[#f7f0e2] hover:bg-white/10 md:hidden"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f8578]">Navegación</p>
            </div>
            <SidebarNav onNavClick={handleNavClick} />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#a89f91]">Cuenta</p>
              <AdminSignOutButton className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-[#f7f0e2] transition-colors hover:bg-white/10" />
            </div>

            <p className="px-1 text-[11px] leading-5 text-[#8f8578] md:hidden">
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
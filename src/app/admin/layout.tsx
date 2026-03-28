import React from "react";
import SidebarNav from "./SidebarNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white relative z-10" style={{ background: 'white' }}>
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col py-8 px-4 z-20">
        <h1 className="text-xl font-bold mb-8 text-indigo-700">Panel Admin</h1>
        <SidebarNav />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8 z-20">{children}</main>
    </div>
  );
}

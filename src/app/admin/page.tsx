"use client";
import HermesProductList from "./components/HermesProductList";

export default function AdminPage() {
  return (
    <main
      className="min-h-screen text-slate-900 pb-20"
      style={{ background: 'white', position: 'relative', zIndex: 10 }}
    >
      <header className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold  text-slate-800">Panel de Administración</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión profesional de catálogo de productos.</p>
        </div>
      </header>
      <div className="container mx-auto px-4 max-w-4xl">
        <HermesProductList />
      </div>
    </main>
  );
}
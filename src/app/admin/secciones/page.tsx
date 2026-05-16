"use client";

import { useEffect, useState } from 'react';
import { usePublishedProducts } from '@/hooks/usePublishedProducts';
import type { ProductoPublicado } from '@/types';
import type { HomeSection } from '@/hooks/useHomeSections';
import AdminNotification from '../components/AdminNotification';

interface ApiErrorResponse {
  error?: string;
}

const emptySection = (tipo: string): HomeSection => ({
  tipo,
  producto_id: null,
  producto_nombre: null,
  imagen_url: null,
  titulo: null,
  subtitulo: null,
  cita: null,
  cta_label: 'Ver más',
  cta_href: '/productos',
  activo: true,
});

const inputClass =
  'w-full rounded-sm border border-neutral-700 bg-neutral-800/60 px-3 py-2.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-[#c9a96e]/50 focus:bg-neutral-800';
const labelClass =
  'flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400';

interface SectionFormProps {
  tipo: string;
  label: string;
  initial: HomeSection;
  productos: ProductoPublicado[];
  onSaved: (s: HomeSection) => void;
}

function SectionForm({ tipo, label, initial, productos, onSaved }: SectionFormProps) {
  const [form, setForm] = useState<HomeSection>(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setForm((f) => ({ ...f, producto_id: null, producto_nombre: null, imagen_url: null }));
      return;
    }
    const product = productos.find((p) => p.id === selectedId);
    if (product) {
      setForm((f) => ({
        ...f,
        producto_id: product.id,
        producto_nombre: product.nombre,
        imagen_url: product.imagen_url ?? null,
        cta_href: `/producto/${product.id}`,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/home-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as HomeSection & ApiErrorResponse;
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');
      setToast({ id: Date.now(), message: 'Sección guardada correctamente.', type: 'success' });
      onSaved(data as HomeSection);
    } catch (err) {
      setToast({
        id: Date.now(),
        message: err instanceof Error ? err.message : 'Error al guardar',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5"
    >
      {toast && (
        <AdminNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header: nombre + toggle activo */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-neutral-100">{label}</h2>
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">Activo</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.activo ? 'bg-[#c9a96e]' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                form.activo ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Selector de producto */}
      <label className={labelClass}>
        Producto de la sección
        <select
          value={form.producto_id ?? ''}
          onChange={handleProductChange}
          className={inputClass}
        >
          <option value="">— Seleccionar producto —</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
              {p.grupo ? ` · ${p.grupo}` : ''}
            </option>
          ))}
        </select>
        {/* Preview de imagen al seleccionar */}
        {form.imagen_url ? (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={form.imagen_url}
              alt=""
              className="h-16 w-12 rounded-sm border border-neutral-700 object-cover"
            />
            <span className="text-[10px] text-neutral-400 break-all">{form.producto_nombre}</span>
          </div>
        ) : form.producto_id ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Este producto no tiene imagen cargada. Andá a Productos para subírsela.
          </p>
        ) : null}
      </label>

      {/* Subtítulo */}
      <label className={labelClass}>
        Subtítulo
        <span className="normal-case font-normal tracking-normal text-neutral-500">
          Línea pequeña sobre el título — ej: &ldquo;EL ELEGIDO · MAYO 2026&rdquo;
        </span>
        <input
          type="text"
          value={form.subtitulo ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, subtitulo: e.target.value }))}
          className={inputClass}
          placeholder="EL ELEGIDO · MAYO 2026"
        />
      </label>

      {/* Título principal */}
      <label className={labelClass}>
        Título principal
        <input
          type="text"
          value={form.titulo ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          className={inputClass}
          placeholder="Malbec de altura, Valle de Uco"
        />
      </label>

      {/* Descripción / cita */}
      <label className={labelClass}>
        Descripción / cita
        <textarea
          rows={3}
          value={form.cita ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, cita: e.target.value }))}
          className={`${inputClass} resize-none`}
          placeholder='"Una uva con tensión, mineral, perfecta para asado de fin de semana."'
        />
      </label>

      {/* CTA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Texto del botón
          <input
            type="text"
            value={form.cta_label ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
            className={inputClass}
            placeholder="Ver más"
          />
        </label>
        <label className={labelClass}>
          Link del botón
          <input
            type="text"
            value={form.cta_href ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, cta_href: e.target.value }))}
            className={inputClass}
            placeholder="/productos?categoria=VINOS+TINTOS"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-sm bg-[#c9a96e] py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#1a1806] transition hover:bg-[#b8955a] disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}

export default function SeccionesPage() {
  const { productos, loading: loadingProducts } = usePublishedProducts();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/home-sections', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: HomeSection[]) => {
        setSections(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar las secciones.');
        setLoading(false);
      });
  }, []);

  const getSectionOrDefault = (tipo: string): HomeSection =>
    sections.find((s) => s.tipo === tipo) ?? emptySection(tipo);

  const handleSaved = (updated: HomeSection) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.tipo === updated.tipo);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  };

  if (loading || loadingProducts) {
    return (
      <div className="p-8 text-sm text-neutral-400 animate-pulse">Cargando secciones...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-sm text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Home
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
          Secciones editoriales
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-neutral-600">
          Elegí el producto y editá el texto para cada sección destacada de la home. La imagen se
          toma automáticamente del producto seleccionado.
        </p>
      </div>

      {/* Aviso sobre imágenes */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3.5">
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="text-xs leading-relaxed text-amber-900">
          <span className="font-semibold">Importante:</span> el vino que quieran destacar debe tener imagen cargada en{' '}
          <a href="/admin/productos" className="font-semibold underline underline-offset-2 hover:text-amber-700 transition-colors">Admin → Productos</a>{' '}
          primero. Si el producto no tiene imagen, la sección mostrará el fondo oscuro con el patrón diamanteo en lugar de la foto.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SectionForm
          tipo="el_elegido"
          label="El Elegido"
          initial={getSectionOrDefault('el_elegido')}
          productos={productos}
          onSaved={handleSaved}
        />
        <SectionForm
          tipo="vino_del_mes"
          label="Vino del Mes"
          initial={getSectionOrDefault('vino_del_mes')}
          productos={productos}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { publicityIconOptions, defaultPublicityConfig } from '@/lib/publicity';
import type { PublicityConfig } from '@/types/publicity';

interface ApiResponse {
  error?: string;
}

export default function PublicidadPage() {
  const [form, setForm] = useState<PublicityConfig>(defaultPublicityConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicity() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/publicity', { cache: 'no-store' });
        const data = (await response.json()) as PublicityConfig & ApiResponse;

        if (!response.ok) {
          throw new Error(data.error ?? 'No se pudo cargar la publicidad.');
        }

        setForm(data as PublicityConfig);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'No se pudo cargar la publicidad.');
      } finally {
        setLoading(false);
      }
    }

    void fetchPublicity();
  }, []);

  const updateField = (field: keyof PublicityConfig, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateVisibility = (field: 'promo_active' | 'benefits_active', value: boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateBenefit = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    setForm((current) => ({
      ...current,
      benefit_items: current.benefit_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/publicity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as PublicityConfig & ApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo guardar la publicidad.');
      }

      setForm(data as PublicityConfig);
      setSuccess('Publicidad guardada correctamente.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la publicidad.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-7">
      <div className="overflow-hidden rounded-[28px] border border-[#dbd0c2] bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 sm:p-8 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cbbca3]">
            Campañas y promociones
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Publicidad</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#d6cdbf] sm:text-[15px]">
            Editá la promo principal y los beneficios que aparecen entre el banner y los productos en la home.
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ddd2c0] bg-[rgba(252,249,244,0.92)] p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        {loading ? (
          <div className="rounded-[24px] border border-[#e4d9c9] bg-white p-6 text-sm text-slate-600 shadow-sm">Cargando publicidad...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[24px] border border-[#e4d9c9] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bloque principal</p>
              <label className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.promo_active}
                  onChange={(event) => updateVisibility('promo_active', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#7c6c54] focus:ring-[#c6b08a]"
                />
                <span>Mostrar bloque verde en la home</span>
              </label>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-medium">Título principal</span>
                  <input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={form.promo_title} onChange={(event) => updateField('promo_title', event.target.value)} />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-medium">Subtítulo</span>
                  <input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={form.promo_subtitle} onChange={(event) => updateField('promo_subtitle', event.target.value)} />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-700">
                  <span className="font-medium">Título secundario</span>
                  <input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={form.promo_heading} onChange={(event) => updateField('promo_heading', event.target.value)} />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-700">
                  <span className="font-medium">Texto del botón</span>
                  <input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={form.promo_cta_label} onChange={(event) => updateField('promo_cta_label', event.target.value)} />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-medium">URL del botón</span>
                  <input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={form.promo_cta_href ?? ''} onChange={(event) => updateField('promo_cta_href', event.target.value)} placeholder="https://..." />
                </label>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e4d9c9] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Beneficios</p>
              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.benefits_active}
                    onChange={(event) => updateVisibility('benefits_active', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#7c6c54] focus:ring-[#c6b08a]"
                  />
                  <span>Mostrar bloque blanco en la home</span>
                </label>
                <p className="text-sm text-slate-500">Los tres beneficios se mantienen fijos y solo cambia la visibilidad del bloque.</p>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                {form.benefit_items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] p-4">
                    <p className="text-sm font-semibold text-slate-900">Beneficio {index + 1}</p>

                    <div className="mt-4 space-y-4">
                      <label className="flex flex-col gap-2 text-sm text-slate-700">
                        <span className="font-medium">Título</span>
                        <input className="w-full rounded-2xl border border-[#d7ccbc] bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={item.title} onChange={(event) => updateBenefit(index, 'title', event.target.value)} />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-slate-700">
                        <span className="font-medium">Descripción</span>
                        <textarea className="min-h-28 w-full rounded-2xl border border-[#d7ccbc] bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={item.description} onChange={(event) => updateBenefit(index, 'description', event.target.value)} />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-slate-700">
                        <span className="font-medium">Ícono</span>
                        <select className="w-full rounded-2xl border border-[#d7ccbc] bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={item.icon} onChange={(event) => updateBenefit(index, 'icon', event.target.value)}>
                          {publicityIconOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="rounded-2xl border border-[#e2c5c1] bg-[#fbf0ef] px-4 py-3 text-sm text-[#8b4b43]">{error}</div>}
            {success && <div className="rounded-2xl border border-[#d4d0c6] bg-[#f4f2ec] px-4 py-3 text-sm text-[#485046]">{success}</div>}

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-2xl bg-[#312c28] px-5 py-3 text-sm font-semibold text-[#f7f0e2] transition hover:bg-[#403932] disabled:cursor-not-allowed disabled:bg-slate-300">
                {saving ? 'Guardando...' : 'Guardar publicidad'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

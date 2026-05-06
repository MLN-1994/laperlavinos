"use client";

import { useEffect, useState } from 'react';
import { publicityIconOptions, defaultPublicityConfig } from '@/lib/publicity';
import type { PublicityConfig } from '@/types/publicity';
import AdminNotification from '../components/AdminNotification';

interface ApiResponse {
  error?: string;
}

export default function PublicidadPage() {
  const [form, setForm] = useState<PublicityConfig>(defaultPublicityConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error'; title?: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error', title?: string) => {
    setToast({ id: Date.now(), message, type, title });
  };

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

  const updateVisibility = (field: 'promo_active' | 'benefits_active' | 'strip_active', value: boolean) => {
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
      showToast('Los cambios de publicidad fueron guardados.', 'success', 'Publicidad actualizada');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'No se pudo guardar la publicidad.';
      setError(message);
      showToast(message, 'error', 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-7">
      <div className="overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 sm:p-8 text-[#f7f0e2] shadow-xl shadow-[#2f2b28]/10">
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

      <div className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-6 sm:p-8">
        {loading ? (
          <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 px-4 py-3 text-sm text-[#beb9b1]/50">Cargando publicidad...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">Barra de anuncio (sobre el header)</p>
              <label className="mt-5 inline-flex items-center gap-3 rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] px-4 py-3 text-sm text-[#beb9b1]/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.strip_active}
                  onChange={(event) => updateVisibility('strip_active', event.target.checked)}
                  className="h-4 w-4 rounded accent-[#a68a5c]"
                />
                <span>Mostrar barra de anuncio en la web</span>
              </label>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 md:col-span-2">
                  <span>Texto del anuncio</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.strip_text} onChange={(event) => updateField('strip_text', event.target.value)} placeholder="Ej: Envío gratis en CABA desde $200.000" />
                </label>
                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 md:col-span-2">
                  <span>URL (opcional — si quiere que sea un link)</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.strip_link ?? ''} onChange={(event) => updateField('strip_link', event.target.value)} placeholder="https://..." />
                </label>
                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                  <span>Color de fondo</span>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.strip_bg_color} onChange={(event) => updateField('strip_bg_color', event.target.value)} className="h-9 w-12 cursor-pointer rounded-sm border border-[#beb9b1]/15 bg-transparent p-0.5" />
                    <input className="flex-1 rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.strip_bg_color} onChange={(event) => updateField('strip_bg_color', event.target.value)} placeholder="#a68a5c" />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                  <span>Color del texto</span>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.strip_text_color} onChange={(event) => updateField('strip_text_color', event.target.value)} className="h-9 w-12 cursor-pointer rounded-sm border border-[#beb9b1]/15 bg-transparent p-0.5" />
                    <input className="flex-1 rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.strip_text_color} onChange={(event) => updateField('strip_text_color', event.target.value)} placeholder="#1a1806" />
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">Bloque principal</p>
              <label className="mt-5 inline-flex items-center gap-3 rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] px-4 py-3 text-sm text-[#beb9b1]/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.promo_active}
                  onChange={(event) => updateVisibility('promo_active', event.target.checked)}
                  className="h-4 w-4 rounded accent-[#a68a5c]"
                />
                <span>Mostrar bloque superior en la home</span>
              </label>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 md:col-span-2">
                  <span>Título principal</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.promo_title} onChange={(event) => updateField('promo_title', event.target.value)} />
                </label>

                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 md:col-span-2">
                  <span>Subtítulo</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.promo_subtitle} onChange={(event) => updateField('promo_subtitle', event.target.value)} />
                </label>

                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                  <span>Título secundario</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.promo_heading} onChange={(event) => updateField('promo_heading', event.target.value)} />
                </label>

                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                  <span>Texto del botón</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.promo_cta_label} onChange={(event) => updateField('promo_cta_label', event.target.value)} />
                </label>

                <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55 md:col-span-2">
                  <span>URL del botón</span>
                  <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={form.promo_cta_href ?? ''} onChange={(event) => updateField('promo_cta_href', event.target.value)} placeholder="https://..." />
                </label>
              </div>
            </div>

            <div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">Beneficios</p>
              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <label className="inline-flex items-center gap-3 rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] px-4 py-3 text-sm text-[#beb9b1]/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.benefits_active}
                    onChange={(event) => updateVisibility('benefits_active', event.target.checked)}
                    className="h-4 w-4 rounded accent-[#a68a5c]"
                  />
                  <span>Mostrar bloque inferior en la home</span>
                </label>
                <p className="text-sm text-[#beb9b1]/40">Los tres beneficios se mantienen fijos y solo cambia la visibilidad del bloque.</p>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                {form.benefit_items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">Beneficio {index + 1}</p>

                    <div className="mt-4 space-y-4">
                      <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                        <span>Título</span>
                        <input className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={item.title} onChange={(event) => updateBenefit(index, 'title', event.target.value)} />
                      </label>

                      <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                        <span>Descripción</span>
                        <textarea className="min-h-24 w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c] resize-none" value={item.description} onChange={(event) => updateBenefit(index, 'description', event.target.value)} />
                      </label>

                      <label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#beb9b1]/55">
                        <span>Ícono</span>
                        <select className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm normal-case tracking-normal text-[#f5efe3] outline-none transition focus:border-[#a68a5c]" value={item.icon} onChange={(event) => updateBenefit(index, 'icon', event.target.value)}>
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

            {error && <div className="rounded-sm border border-[#d03416]/30 bg-[#d03416]/10 px-3 py-2 text-xs text-[#f3c3ba]">{error}</div>}
            {success && <div className="rounded-sm border border-[#a68a5c]/30 bg-[#a68a5c]/10 px-3 py-2 text-xs text-[#c9a96e]">{success}</div>}

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-300 translate-y-full group-hover:translate-y-0" />
                <span className="relative z-10">{saving ? 'Guardando...' : 'Guardar publicidad'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {toast && (
        <AdminNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}

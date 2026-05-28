"use client";
import React, { useState } from 'react';
import AdminBannerList from '../components/AdminBannerList';
import AdminBannerForm from '../components/AdminBannerForm';
import { Banner } from '../../../types/banner';
import AdminNotification from '../components/AdminNotification';

interface ApiErrorResponse {
  error?: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error'; title?: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error', title?: string) => {
    setToast({ id: Date.now(), message, type, title });
  };

  // Fetch banners (activos e inactivos para admin)
  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/banners', { cache: 'no-store' });
      const data = (await response.json()) as Banner[] & ApiErrorResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudieron cargar los banners.');
      }

      setBanners(data as Banner[]);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'No se pudieron cargar los banners.');
      setBanners([]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  // Editar
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este banner?')) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo eliminar el banner.');
      }
    } catch (deleteError) {
      showToast(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el banner.', 'error', 'Error al eliminar');
      setActionLoading(false);
      return;
    }
    await fetchBanners();
    setActionLoading(false);
    showToast('El banner fue eliminado correctamente.', 'success', 'Banner eliminado');
  };

  // Activar/desactivar
  const handleToggleActive = async (id: string, active: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, activo: active }),
      });
      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudo actualizar el banner.');
      }
    } catch (updateError) {
      showToast(updateError instanceof Error ? updateError.message : 'No se pudo actualizar el banner.', 'error', 'Error al actualizar');
      setActionLoading(false);
      return;
    }
    await fetchBanners();
    setActionLoading(false);
    showToast(active ? 'El banner quedó activo en la tienda.' : 'El banner quedó inactivo en la tienda.', 'success', active ? 'Banner activado' : 'Banner desactivado');
  };

  // Crear o editar
  const handleFormSubmit = async (banner: Partial<Banner>) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/banners', {
        method: banner.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: banner.id,
          imagen_url: banner.imagen_url,
          activo: banner.activo,
        }),
      });
      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(data.error ?? (banner.id ? 'No se pudo editar el banner.' : 'No se pudo crear el banner.'));
      }

      setShowForm(false);
      setEditingBanner(null);
      showToast(
        banner.id ? 'Los cambios del banner fueron guardados.' : 'El banner fue creado correctamente.',
        'success',
        banner.id ? 'Banner actualizado' : 'Banner creado',
      );
    } catch (submitError) {
      showToast(submitError instanceof Error ? submitError.message : 'No se pudo guardar el banner.', 'error', 'Error al guardar');
      setActionLoading(false);
      return;
    }
    await fetchBanners();
    setActionLoading(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  return (
    <section className="space-y-7">
      <div className="overflow-hidden rounded-sm border border-neutral-200 bg-[linear-gradient(135deg,_rgba(49,44,40,0.98),_rgba(63,56,51,0.94))] p-6 sm:p-8 text-neutral-800 shadow-xl shadow-[#2f2b28]/10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex rounded-full border border-[#a68a5c]/20 bg-[#a68a5c]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Contenido principal
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">Banners</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500 sm:text-[15px]">
              Administrá piezas visuales activas e inactivas, ordená el contenido promocional y prepará el material visible en la tienda.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-[15px]">
              Para mantener una altura consistente en el home, subí siempre banners horizontales con la misma proporción.
              Base recomendada: mínimo 1920x800 px, en WebP o JPG.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a89f91]">Total</p>
              <p className="mt-2 text-3xl font-semibold text-white">{banners.length}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a89f91]">Activos</p>
              <p className="mt-2 text-3xl font-semibold text-white">{banners.filter((banner) => banner.activo).length}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a89f91]">Estado</p>
              <p className="mt-2 text-sm font-medium text-white">{actionLoading ? 'Procesando cambios' : loading ? 'Cargando' : 'Listo para editar'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-neutral-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Gestión visual</p>
            <h2 className="mt-1 text-2xl font-serif tracking-wide text-neutral-700 sm:text-[2rem]">
              {showForm ? (editingBanner ? 'Editar banner' : 'Nuevo banner') : 'Biblioteca de banners'}
            </h2>
          </div>

          {!showForm && (
            <button
              className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => { setShowForm(true); setEditingBanner(null); }}
              disabled={actionLoading}
            >
              <span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-300 translate-y-full group-hover:translate-y-0" />
              <span className="relative z-10">Nuevo banner</span>
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {!showForm && !loading && !error && (
            <div className="rounded-sm border border-[#a68a5c]/20 bg-[#a68a5c]/8 px-4 py-3 text-sm leading-6 text-neutral-600">
              Recomendación: usá siempre el mismo formato de banner, con un mínimo de 1920x800 px en horizontal, preferentemente en WebP o JPG. Peso máximo 800 KB, ideal menos de 500 KB.
            </div>
          )}
          {loading && <div className="rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-400">Cargando banners...</div>}
          {error && <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Error: {error}</div>}
          {actionLoading && <div className="rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-400">Procesando cambios...</div>}

          {!showForm && (
            <AdminBannerList
              banners={banners}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          )}

          {showForm && (
            <AdminBannerForm
              initialBanner={editingBanner || {}}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          )}
        </div>
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

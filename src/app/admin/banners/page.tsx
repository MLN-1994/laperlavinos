"use client";
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminBannerList from '../components/AdminBannerList';
import AdminBannerForm from '../components/AdminBannerForm';
import { Banner } from '../../../types/banner';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch banners (activos e inactivos para admin)
  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setBanners(data as Banner[]);
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
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    await fetchBanners();
    setActionLoading(false);
  };

  // Activar/desactivar
  const handleToggleActive = async (id: string, active: boolean) => {
    setActionLoading(true);
    const { error } = await supabase.from('banners').update({ activo: active }).eq('id', id);
    if (error) alert('Error al actualizar: ' + error.message);
    await fetchBanners();
    setActionLoading(false);
  };

  // Crear o editar
  const handleFormSubmit = async (banner: Partial<Banner>) => {
    setActionLoading(true);
    if (banner.id) {
      // Editar
      const { error } = await supabase
        .from('banners')
        .update({
          titulo: banner.titulo,
          imagen_url: banner.imagen_url,
          link: banner.link,
          activo: banner.activo,
        })
        .eq('id', banner.id);
      if (error) alert('Error al editar: ' + error.message);
    } else {
      // Crear
      const { error } = await supabase
        .from('banners')
        .insert([{
          titulo: banner.titulo,
          imagen_url: banner.imagen_url,
          link: banner.link,
          activo: banner.activo,
        }]);
      if (error) alert('Error al crear: ' + error.message);
    }
    setShowForm(false);
    setEditingBanner(null);
    await fetchBanners();
    setActionLoading(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Banners</h1>
      {loading && <p>Cargando banners...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {actionLoading && <p className="text-blue-600">Procesando...</p>}
      {!showForm && (
        <>
          <button
            className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={() => { setShowForm(true); setEditingBanner(null); }}
            disabled={actionLoading}
          >
            Nuevo banner
          </button>
          <AdminBannerList
            banners={banners}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </>
      )}
      {showForm && (
        <AdminBannerForm
          initialBanner={editingBanner || {}}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

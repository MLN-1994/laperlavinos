// Componente select de grupo
function GroupSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="mb-4">
      <select
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Todos los grupos</option>
        {options.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  );
}
import React, { useState, ChangeEvent } from "react";
// Componente profesional de buscador
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Buscar por descripción, código o marca..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
import { useHermesProducts } from "../../hooks/useHermesProducts";
import { usePublishedProducts } from "../../hooks/usePublishedProducts";
import { useProductPublication } from "../../hooks/useProductPublication";

export default function HermesProductList() {
  const { productos: hermesProducts, loading: loadingHermes, error: errorHermes } = useHermesProducts();
  const { productos: publishedProducts, refetch: refetchPublished } = usePublishedProducts();
  const { publishProduct, unpublishProduct, loading, error, success } = useProductPublication();
  const [selectedImage, setSelectedImage] = useState<{ [hermes_id: number]: File | null }>({});
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");

  // Obtener grupos únicos ordenados alfabéticamente
  const groupOptions = Array.from(new Set(hermesProducts.map(p => p.grupo).filter(Boolean))).sort();

  // Para saber si un producto de Hermes ya está publicado
  const isPublished = (hermes_id: number) => publishedProducts.some(p => p.hermes_id === hermes_id);

  // Handlers
  const handlePublish = async (product: any) => {
    await publishProduct({
      hermes_id: product.hermes_id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      imagen: selectedImage[product.hermes_id] || null,
    });
    setSelectedImage(prev => ({ ...prev, [product.hermes_id]: null }));
    refetchPublished();
  };

  const handleUnpublish = async (hermes_id: number) => {
    await unpublishProduct(hermes_id);
    refetchPublished();
  };

  if (loadingHermes) return <div>Cargando productos de Hermes...</div>;
  if (errorHermes) return <div>Error: {errorHermes}</div>;

  // Debug: mostrar hermes_id de todos los productos
  const hermesIds = hermesProducts.map(p => p.hermes_id);
  const productosSinId = hermesProducts.filter(p => !p.hermes_id);

  // Filtrado profesional por descripción, código y grupo (con select)
  const filteredProducts = hermesProducts.filter((p) => {
    const q = search.toLowerCase();
    const matchText =
      p.nombre?.toLowerCase().includes(q) ||
      String(p.hermes_id).toLowerCase().includes(q) ||
      p.grupo?.toLowerCase().includes(q);
    const matchGroup = group ? p.grupo === group : true;
    return matchText && matchGroup;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Productos de Hermes</h2>
      <SearchBar value={search} onChange={setSearch} />
      <GroupSelect value={group} onChange={setGroup} options={groupOptions} />
      {productosSinId.length > 0 && (
        <div className="text-red-500 text-sm mb-2">Alerta: Hay productos sin <b>hermes_id</b> único. Revisa la vista SQL o la API.</div>
      )}
      {hermesProducts.length === 0 && <div>No hay productos disponibles. (¿La API responde bien?)</div>}
      <ul className="divide-y divide-slate-100">
        {filteredProducts.map((product, idx) => (
          <li key={product.hermes_id || `sinid-${idx}`} className="py-4 flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex-1">
              <div className="font-medium text-slate-800">{product.nombre}</div>
              <div className="text-slate-500 text-sm">{product.descripcion}</div>
              <div className="text-slate-600 text-xs mt-1">Precio: ${product.precio}</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
              {!isPublished(product.hermes_id) ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setSelectedImage(prev => ({ ...prev, [product.hermes_id]: e.target.files?.[0] || null }))}
                  />
                  <button
                    className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    onClick={() => handlePublish(product)}
                    disabled={loading}
                  >
                    Publicar
                  </button>
                </>
              ) : (
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleUnpublish(product.hermes_id)}
                  disabled={loading}
                >
                  Despublicar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </div>
  );
}

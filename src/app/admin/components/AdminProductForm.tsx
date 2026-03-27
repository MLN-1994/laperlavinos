import { useState } from "react";
import { GoUpload } from "react-icons/go";

type Props = {
  onSubmit: (data: { nombre: string; descripcion: string; precio: string; imagen: File | null }) => void;
  subiendo: boolean;
  mensaje: string;
};

export default function AdminProductForm({ onSubmit, subiendo, mensaje }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, descripcion, precio, imagen });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border px-8 py-8 space-y-6 animate-fade-in"
    >
      <div className="mb-2 text-center">
        <h2 className="text-2xl font-extrabold text-main mb-1">Nuevo Producto</h2>
        <p className="text-main text-opacity-70 text-sm">Completá los datos para publicar un producto en la tienda</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-main mb-1" htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          type="text"
          placeholder="Ej: Malbec Reserva"
          className="w-full bg-main border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-base text-main"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-main mb-1" htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          placeholder="Breve descripción del producto"
          className="w-full bg-main border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 h-24 resize-none transition text-base text-main"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-main mb-1" htmlFor="precio">Precio</label>
        <input
          id="precio"
          type="number"
          placeholder="Ej: 2500"
          className="w-full bg-main border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-base text-main"
          value={precio}
          onChange={e => setPrecio(e.target.value)}
          required
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-main mb-1">Imagen</label>
        <div className="relative">
          <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full bg-main hover:bg-card-alt text-main font-bold py-3 px-4 rounded-lg cursor-pointer transition text-base border">
            <GoUpload /> {imagen ? "Imagen seleccionada" : "Cargar Imagen"}
          </label>
          <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={e => setImagen(e.target.files ? e.target.files[0] : null)} />
          {imagen && <p className="text-xs text-indigo-600 mt-2 text-center truncate">{imagen.name}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={subiendo}
        className="w-full bg-[#3c3c3b] text-white py-3 rounded-xl font-bold hover:bg-[#2c2c2b] active:scale-95 transition shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
      >
        {subiendo && (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {subiendo ? "Guardando..." : "Guardar Producto"}
      </button>

      {mensaje && (
        <p className="text-base text-center text-[#3c3c3b] bg-[#e0e0e0] py-2 rounded-lg font-medium mt-2 animate-fade-in">
          {mensaje}
        </p>
      )}
    </form>
  );
}

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
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Nombre" className="w-full bg-slate-50 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition" value={nombre} onChange={e => setNombre(e.target.value)} required />
      <textarea placeholder="Descripción" className="w-full bg-slate-50 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none transition" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      <input type="number" placeholder="Precio" className="w-full bg-slate-50 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition" value={precio} onChange={e => setPrecio(e.target.value)} required step="0.01" />
      
      {/* INPUT IMAGEN ESTILIZADO */}
      <div className="relative">
        <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-lg cursor-pointer transition text-sm">
          <GoUpload /> {imagen ? "Imagen seleccionada" : "Cargar Imagen"}
        </label>
        <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={e => setImagen(e.target.files ? e.target.files[0] : null)} />
        {imagen && <p className="text-[10px] text-indigo-600 mt-1 text-center truncate">{imagen.name}</p>}
      </div>

      <button type="submit" disabled={subiendo} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2">
        {subiendo && (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {subiendo ? "Guardando..." : "Guardar Producto"}
      </button>
      {mensaje && <p className="text-sm text-center text-indigo-700 bg-indigo-50 py-2 rounded-lg font-medium">{mensaje}</p>}
    </form>
  );
}
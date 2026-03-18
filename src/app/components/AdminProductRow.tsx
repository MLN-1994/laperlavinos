import React from "react";
import { GoPencil, GoXCircle, GoUpload } from "react-icons/go";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
};

type Props = {
  producto: Producto;
  editId: string | null;
  editNombre: string;
  editDescripcion: string;
  editPrecio: string;
  editImagen: File | null;
  editMensaje: string;
  borrandoId: string | null;
  startEdit: (producto: Producto) => void;
  cancelEdit: () => void;
  handleEditSave: (e: React.FormEvent) => void;
  setEditNombre: (v: string) => void;
  setEditDescripcion: (v: string) => void;
  setEditPrecio: (v: string) => void;
  setEditImagen: (f: File | null) => void;
  handleDelete: (id: string) => void;
  modo: "mobile" | "desktop";
};

export default function AdminProductRow(props: Props) {
  const {
    producto, editId, editNombre, editDescripcion, editPrecio, editImagen, editMensaje,
    borrandoId, startEdit, cancelEdit, handleEditSave, setEditNombre, setEditDescripcion, setEditPrecio, setEditImagen, handleDelete, modo
  } = props;

  if (modo === "mobile") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        {editId === producto.id ? (
          <form onSubmit={handleEditSave} className="space-y-3">
            <input className="w-full border p-2 rounded-lg text-sm" value={editNombre} onChange={e => setEditNombre(e.target.value)} required />
            <textarea className="w-full border p-2 rounded-lg text-sm h-20" value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} required />
            <input className="w-full border p-2 rounded-lg text-sm" type="number" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} required />
            {/* BOTÓN IMAGEN MOBILE */}
            <label className="flex items-center justify-center gap-2 w-full bg-slate-100 py-2 rounded-lg cursor-pointer text-xs font-bold text-slate-600">
              <GoUpload /> {editImagen ? "Imagen lista" : "Cambiar Foto"}
              <input type="file" accept="image/*" className="hidden" onChange={e => setEditImagen(e.target.files ? e.target.files[0] : null)} />
            </label>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={editMensaje === 'Guardando...'} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-xs uppercase transition active:scale-95 flex items-center justify-center gap-2">
                {editMensaje === 'Guardando...' && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {editMensaje === 'Guardando...' ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={cancelEdit} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold text-xs uppercase text-slate-500">Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="flex gap-4 items-center">
            <img src={producto.imagen_url || "/placeholder.png"} className="w-16 h-16 object-cover rounded-lg border border-slate-100" alt="" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{producto.nombre}</h3>
              <p className="text-indigo-600 font-bold text-sm">${producto.precio}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(producto)} className="text-slate-400 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition"><GoPencil size={20}/></button>
              <button onClick={() => handleDelete(producto.id)} disabled={borrandoId === producto.id} className="text-slate-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition flex items-center justify-center">
                {borrandoId === producto.id ? (
                  <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <GoXCircle size={20}/>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (modo === "desktop") {
    return (
      <tr className="hover:bg-slate-50/50 group h-20 transition-colors">
        {editId === producto.id ? (
          <td colSpan={4} className="px-6 py-4 bg-indigo-50/30">
            <form onSubmit={handleEditSave} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3">
                <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" value={editNombre} onChange={e => setEditNombre(e.target.value)} required />
              </div>
              <div className="col-span-3">
                <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} required />
              </div>
              <div className="col-span-2">
                <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" type="number" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} required />
              </div>
              <div className="col-span-2">
                {/* BOTÓN IMAGEN DESKTOP DENTRO DE TABLA */}
                <label className="flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-2 rounded-lg cursor-pointer text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition">
                  <GoUpload size={14}/> {editImagen ? "OK" : "Imagen"}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setEditImagen(e.target.files ? e.target.files[0] : null)} />
                </label>
              </div>
              <div className="col-span-2 flex justify-end gap-3 text-xs font-bold uppercase">
                <button type="submit" disabled={editMensaje === 'Guardando...'} className="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-2">
                  {editMensaje === 'Guardando...' && (
                    <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                  {editMensaje === 'Guardando...' ? 'Guardando...' : (editMensaje || 'Guardar')}
                </button>
                <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 transition">X</button>
              </div>
            </form>
          </td>
        ) : (
          <>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={producto.imagen_url || "/placeholder.png"} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm" alt="" />
                <span className="font-semibold text-slate-700">{producto.nombre}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-slate-500 text-sm">{producto.descripcion}</td>
            <td className="px-6 py-4 font-bold text-slate-700 text-sm">${producto.precio}</td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(producto)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar"><GoPencil size={18}/></button>
                <button onClick={() => handleDelete(producto.id)} disabled={borrandoId === producto.id} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex items-center justify-center" title="Borrar">
                  {borrandoId === producto.id ? (
                    <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <GoXCircle size={18}/>
                  )}
                </button>
              </div>
            </td>
          </>
        )}
      </tr>
    );
  }

  return null;
}
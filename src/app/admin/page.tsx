"use client";
import { GoPencil, GoXCircle, GoPlus, GoUpload } from "react-icons/go";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useProductos } from "../../hooks/useProductos";

export default function AdminPage() {
  const { productos, loading, error, refetch } = useProductos();

  // Estados Formulario Alta
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);


  // Estados Edición
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [editImagen, setEditImagen] = useState<File | null>(null);
  const [editMensaje, setEditMensaje] = useState("");
  // Estado para feedback visual de borrado
  const [borrandoId, setBorrandoId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas borrar este producto?")) return;
    setBorrandoId(id);
    const { error } = await supabase.from("productos_publicados").delete().eq("id", id);
    setBorrandoId(null);
    if (error) alert("Error: " + error.message);
    else refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setSubiendo(true);
    let imagenUrl = "";
    if (imagen) {
      const nombreArchivo = `${Date.now()}_${imagen.name}`;
      const { error } = await supabase.storage.from("productos").upload(nombreArchivo, imagen);
      if (error) { setMensaje("Error al subir imagen"); setSubiendo(false); return; }
      imagenUrl = supabase.storage.from("productos").getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const { error: dbError } = await supabase.from("productos_publicados").insert([{
      nombre, descripcion, precio: parseFloat(precio), imagen_url: imagenUrl, activo: true,
    }]);
    if (dbError) setMensaje("Error al guardar");
    else { 
      setMensaje("¡Producto guardado!"); 
      setNombre(""); setDescripcion(""); setPrecio(""); setImagen(null); 
      refetch(); 
      setTimeout(() => setMensaje(""), 3000);
    }
    setSubiendo(false);
  };

  const startEdit = (producto: any) => {
    setEditId(producto.id);
    setEditNombre(producto.nombre);
    setEditDescripcion(producto.descripcion);
    setEditPrecio(producto.precio.toString());
    setEditActivo(producto.activo);
    setEditImagen(null);
    setEditMensaje("");
  };

  const cancelEdit = () => { setEditId(null); setEditMensaje(""); };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditMensaje("Guardando...");
    let imagenUrl = undefined;
    if (editImagen) {
      const nombreArchivo = `${Date.now()}_${editImagen.name}`;
      const { error: imgError } = await supabase.storage.from("productos").upload(nombreArchivo, editImagen);
      if (imgError) { setEditMensaje("Error imagen"); return; }
      imagenUrl = supabase.storage.from("productos").getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const updateData: any = { nombre: editNombre, descripcion: editDescripcion, precio: parseFloat(editPrecio) };
    if (imagenUrl) updateData.imagen_url = imagenUrl;
    const { error } = await supabase.from("productos_publicados").update(updateData).eq("id", editId);
    if (error) setEditMensaje("Error al guardar");
    else { setEditMensaje("¡Listo!"); refetch(); setTimeout(cancelEdit, 800); }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión profesional de catálogo de productos.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULARIO ALTA */}
        <section className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <GoPlus className="text-indigo-600" /> Añadir Producto
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="text" placeholder="Nombre" className="w-full bg-slate-50 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition" value={nombre} onChange={e => setNombre(e.target.value)} required />
              <textarea placeholder="Descripción" className="w-full bg-slate-50 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none transition" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
              <input type="number" placeholder="Precio" className="w-full bg-slate-50 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition" value={precio} onChange={e => setPrecio(e.target.value)} required step="0.01" />
              
              {/* INPUT IMAGEN ESTILIZADO (ALTA) */}
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
          </div>
        </section>

        {/* LISTADO */}
        <section className="lg:col-span-8">
          <h2 className="text-lg font-semibold mb-6 text-slate-700">Productos Publicados</h2>

          {/* VISTA MOBILE */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {productos.map((producto) => (
              <div key={producto.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
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
            ))}
          </div>

          {/* VISTA DESKTOP */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4 w-[25%]">Producto</th>
                  <th className="px-6 py-4 w-[30%]">Descripción</th>
                  <th className="px-6 py-4 w-[15%]">Precio</th>
                  <th className="px-6 py-4 w-[30%] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-slate-50/50 group h-20 transition-colors">
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
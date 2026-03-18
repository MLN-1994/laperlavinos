import { GoPencil, GoXCircle, GoUpload } from "react-icons/go";
import React from "react";
import AdminProductRow from "./AdminProductRow";


type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
};

type Props = {
  productos: Producto[];
  loading: boolean;
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
};

export default function AdminProductList({
  productos, loading, editId, editNombre, editDescripcion, editPrecio, editImagen, editMensaje, borrandoId,
  startEdit, cancelEdit, handleEditSave, setEditNombre, setEditDescripcion, setEditPrecio, setEditImagen, handleDelete
}: Props) {
  return (
    // LISTADO
    <section className="lg:col-span-8">
      <h2 className="text-lg font-semibold mb-6 text-slate-700">Productos Publicados</h2>

      {/* VISTA MOBILE */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {productos.map((producto) => (
          <AdminProductRow
            key={producto.id}
            producto={producto}
            editId={editId}
            editNombre={editNombre}
            editDescripcion={editDescripcion}
            editPrecio={editPrecio}
            editImagen={editImagen}
            editMensaje={editMensaje}
            borrandoId={borrandoId}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            handleEditSave={handleEditSave}
            setEditNombre={setEditNombre}
            setEditDescripcion={setEditDescripcion}
            setEditPrecio={setEditPrecio}
            setEditImagen={setEditImagen}
            handleDelete={handleDelete}
            modo="mobile"
          />
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
              <AdminProductRow
                key={producto.id}
                producto={producto}
                editId={editId}
                editNombre={editNombre}
                editDescripcion={editDescripcion}
                editPrecio={editPrecio}
                editImagen={editImagen}
                editMensaje={editMensaje}
                borrandoId={borrandoId}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                handleEditSave={handleEditSave}
                setEditNombre={setEditNombre}
                setEditDescripcion={setEditDescripcion}
                setEditPrecio={setEditPrecio}
                setEditImagen={setEditImagen}
                handleDelete={handleDelete}
                modo="desktop"
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}



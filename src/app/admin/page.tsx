"use client";
import AdminProductList from "../components/AdminProductList";
import { useAdminProductos } from "../../hooks/useAdminProductos";
import { GoPlus } from "react-icons/go";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminProductForm from "../components/AdminProductForm";

export default function AdminPage() {
  const { productos, loading, error, subiendo, mensaje, handleAltaProducto, editId, editNombre, setEditNombre, editDescripcion, setEditDescripcion, editPrecio, setEditPrecio, editImagen, setEditImagen, editMensaje, handleDelete, borrandoId, startEdit, cancelEdit, handleEditSave } = useAdminProductos();

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
            <AdminProductForm onSubmit={handleAltaProducto} subiendo={subiendo} mensaje={mensaje} />
          </div>
        </section>

        {/* LISTADO */}
        <AdminProductList
          productos={productos}
          loading={loading}
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
        />
      </div>
    </main>
  );
}
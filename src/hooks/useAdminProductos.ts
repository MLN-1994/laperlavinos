import { useState, useEffect } from "react";
import { supabase } from "../../src/lib/supabaseClient"; // Ajusta el path si es necesario

export function useAdminProductos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   // Estados para alta producto
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

  
  // Handler para alta producto
  const handleAltaProducto = async ({ nombre, descripcion, precio, imagen }: { nombre: string; descripcion: string; precio: string; imagen: File | null }) => {
    setSubiendo(true);
    setMensaje("");
    let imagenUrl = undefined;
    if (imagen) {
      const nombreArchivo = `${Date.now()}_${imagen.name}`;
      const { error: imgError } = await supabase.storage.from("productos").upload(nombreArchivo, imagen);
      if (imgError) {
        setMensaje("Error al subir imagen");
        setSubiendo(false);
        return;
      }
      imagenUrl = supabase.storage.from("productos").getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const { error } = await supabase.from("productos_publicados").insert({ nombre, descripcion, precio: parseFloat(precio), imagen_url: imagenUrl });
    if (error) setMensaje("Error al guardar producto");
    else {
      setMensaje("¡Producto guardado!");
      fetchProductos();
    }
    setSubiendo(false);
  };

  const handleDelete = async (id: string) => {
  if (!window.confirm("¿Seguro que deseas borrar este producto?")) return;
  setBorrandoId(id);
  const { error } = await supabase.from("productos_publicados").delete().eq("id", id);
  setBorrandoId(null);
  if (error) alert("Error: " + error.message);
  else fetchProductos();
};

const startEdit = (producto: any) => {
  setEditId(producto.id);
  setEditNombre(producto.nombre);
  setEditDescripcion(producto.descripcion);
  setEditPrecio(producto.precio.toString());
  setEditImagen(null);
  setEditMensaje("");
};

const cancelEdit = () => {
  setEditId(null);
  setEditMensaje("");
};

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
  else {
    setEditMensaje("¡Listo!");
    fetchProductos();
    setTimeout(cancelEdit, 800);
  }
};

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("productos_publicados").select("*").order("nombre");
    if (error) setError(error.message);
    else setProductos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, loading, error, refetch: fetchProductos, subiendo, mensaje, handleAltaProducto, editId, editNombre, setEditNombre, editDescripcion, setEditDescripcion, editPrecio, setEditPrecio, editImagen, setEditImagen, editMensaje, handleDelete, borrandoId, startEdit, cancelEdit, handleEditSave };
}
"use client";

import React, { useRef, useState } from "react";
import Spinner from "../../components/Spinner";
import type { ProductImage } from "../../../types";

interface AdminProductImagesProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (updated: ProductImage[]) => void;
}

export default function AdminProductImages({
  productId,
  images,
  onImagesChange,
}: AdminProductImagesProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      for (const file of Array.from(files)) {
        formData.append("imagenes", file);
      }

      const res = await fetch("/api/admin/product-images", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as ProductImage[] | { error: string };

      if (!res.ok || "error" in data) {
        throw new Error(("error" in data ? data.error : null) ?? "Error al subir.");
      }

      onImagesChange([...images, ...(data as ProductImage[])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (image: ProductImage) => {
    setDeletingId(image.id);
    setError(null);

    try {
      const res = await fetch("/api/admin/product-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Error al eliminar.");
      }

      onImagesChange(images.filter((img) => img.id !== image.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar imagen.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/50">
        Imágenes del producto
      </label>

      {/* Grid de imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((img, idx) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/30"
              >
                <img
                  src={img.url}
                  alt={`Imagen ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 rounded-sm bg-[#a68a5c] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-white">
                    Principal
                  </span>
                )}
                <button
                  onClick={() => handleDelete(img)}
                  disabled={deletingId === img.id}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar imagen"
                >
                  {deletingId === img.id ? (
                    <Spinner size={16} colorClass="border-white" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                      Eliminar
                    </span>
                  )}
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Botón agregar */}
      <label
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-[#beb9b1]/20 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 transition hover:border-[#a68a5c]/40 hover:text-[#c9a96e] ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        {uploading ? (
          <>
            <Spinner size={12} colorClass="border-current" />
            Subiendo...
          </>
        ) : (
          <>+ Agregar imágenes</>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          disabled={uploading}
        />
      </label>

      {error && (
        <p className="text-[11px] text-[#d03416]">{error}</p>
      )}
    </div>
  );
}

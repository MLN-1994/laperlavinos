import React, { useRef, useState } from 'react';
import { Banner } from '../../../types/banner';

interface AdminBannerFormProps {
	initialBanner?: Partial<Banner>;
	onSubmit: (banner: Partial<Banner>) => void;
	onCancel: () => void;
}

const AdminBannerForm: React.FC<AdminBannerFormProps> = ({ initialBanner = {}, onSubmit, onCancel }) => {
	const [imagenUrl, setImagenUrl] = useState(initialBanner.imagen_url || '');
	const [activo, setActivo] = useState(initialBanner.activo ?? true);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		setUploadError(null);
		const formData = new FormData();
		formData.append('file', file);
		try {
			const res = await fetch('/api/admin/banners/upload', { method: 'POST', body: formData });
			const data = await res.json() as { url?: string; error?: string };
			if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
			setImagenUrl(data.url ?? '');
		} catch (err) {
			setUploadError(err instanceof Error ? err.message : 'Error al subir imagen');
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!imagenUrl) return;
		onSubmit({ id: initialBanner.id, imagen_url: imagenUrl, activo });
	};

	return (
		<form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-sm border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
			<div>
				<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Detalle del banner</p>
				<h2 className="mt-1 text-xl font-serif tracking-wide text-neutral-700">{initialBanner.id ? 'Editar banner' : 'Nuevo banner'}</h2>
				<p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
					Subi siempre banners horizontales con la misma proporcion para mantener el carrusel parejo.
					 Minimo recomendado: 1920x800 px, en WebP o JPG.
				</p>
			</div>
			<div className="grid gap-5">
				<div className="flex flex-col gap-1.5">
					<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Imagen</span>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/webp"
						className="hidden"
						onChange={handleFileChange}
					/>
					{imagenUrl ? (
						<div className="relative overflow-hidden rounded-sm border border-neutral-200">
							<img src={imagenUrl} alt="Preview" className="h-40 w-full object-cover opacity-90" />
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-bold uppercase tracking-[0.18em] text-white opacity-0 transition hover:opacity-100"
							>
								Cambiar imagen
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
							className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition hover:border-[#a68a5c] hover:text-[#a68a5c] disabled:opacity-50"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
							<span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Subir imagen</span>
							<span className="text-[10px] normal-case tracking-normal">JPG o WebP - max. 800 KB - ideal menos de 500 KB - minimo 1920x800</span>
						</button>
					)}
					{uploading && <p className="text-[11px] text-[#a68a5c]">Subiendo imagen...</p>}
					{uploadError && <p className="text-[11px] text-red-500">{uploadError}</p>}
					<p className="text-[11px] leading-5 text-neutral-400">
						Si subis una imagen con otra proporcion, el carrusel puede verse desparejo frente a los otros banners.
					</p>
				</div>
			</div>
			<label className="inline-flex items-center gap-3 rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 cursor-pointer">
				<input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} id="activo" className="h-4 w-4 rounded accent-[#a68a5c]" />
				<span>Banner activo</span>
			</label>
			<div className="flex flex-col gap-3 pt-2 md:flex-row">
				<button type="submit" disabled={uploading || !imagenUrl} className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#a68a5c] transition-all hover:text-[#3c3c3b] disabled:opacity-40 disabled:cursor-not-allowed">
					<span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-300 translate-y-full group-hover:translate-y-0" />
					<span className="relative z-10">Guardar</span>
				</button>
				<button type="button" className="border border-neutral-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 transition hover:text-neutral-700" onClick={onCancel}>Cancelar</button>
			</div>
		</form>
	);
};

export default AdminBannerForm;

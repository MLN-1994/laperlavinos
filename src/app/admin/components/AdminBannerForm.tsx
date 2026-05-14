import React, { useState } from 'react';
import { Banner } from '../../../types/banner';

interface AdminBannerFormProps {
	initialBanner?: Partial<Banner>;
	onSubmit: (banner: Partial<Banner>) => void;
	onCancel: () => void;
}

const AdminBannerForm: React.FC<AdminBannerFormProps> = ({ initialBanner = {}, onSubmit, onCancel }) => {
	const [titulo, setTitulo] = useState(initialBanner.titulo || '');
	const [imagen_url, setImagenUrl] = useState(initialBanner.imagen_url || '');
	const [link, setLink] = useState(initialBanner.link || '');
	const [activo, setActivo] = useState(initialBanner.activo ?? true);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ ...initialBanner, titulo, imagen_url, link, activo });
	};

	return (
		<form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-sm border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
			<div>
				<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Detalle del banner</p>
				<h2 className="mt-1 text-xl font-serif tracking-wide text-neutral-700">{initialBanner.id ? 'Editar banner' : 'Nuevo banner'}</h2>
			</div>
			<div className="grid gap-5">
				<label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
					Título
					<input className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-[#a68a5c]" value={titulo} onChange={e => setTitulo(e.target.value)} required />
				</label>
				<label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
					Imagen URL
					<input className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-[#a68a5c]" value={imagen_url} onChange={e => setImagenUrl(e.target.value)} required />
				</label>
				<label className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
					Link <span className="normal-case tracking-normal text-neutral-300">(opcional)</span>
					<input className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm normal-case tracking-normal text-neutral-800 outline-none transition focus:border-[#a68a5c]" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
				</label>
			</div>
			<label className="inline-flex items-center gap-3 rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 cursor-pointer">
				<input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} id="activo" className="h-4 w-4 rounded accent-[#a68a5c]" />
				<span>Banner activo</span>
			</label>
			<div className="flex flex-col gap-3 pt-2 md:flex-row">
				<button type="submit" className="group relative flex items-center justify-center overflow-hidden border border-[#a68a5c] bg-transparent px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#a68a5c] transition-all hover:text-[#3c3c3b]">
					<span className="absolute inset-0 z-0 bg-[#a68a5c] transition-transform duration-300 translate-y-full group-hover:translate-y-0" />
					<span className="relative z-10">Guardar</span>
				</button>
				<button type="button" className="border border-neutral-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 transition hover:text-neutral-700" onClick={onCancel}>Cancelar</button>
			</div>
		</form>
	);
};

export default AdminBannerForm;

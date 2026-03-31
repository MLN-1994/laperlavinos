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
		<form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-[24px] border border-[#e4d9c9] bg-white p-6 sm:p-7 shadow-sm">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Detalle del banner</p>
				<h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{initialBanner.id ? 'Editar banner' : 'Nuevo banner'}</h2>
			</div>
			<div className="grid gap-5">
				<label className="flex flex-col gap-2 text-sm text-slate-700">
					<span className="font-medium">Título</span>
					<input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={titulo} onChange={e => setTitulo(e.target.value)} required />
				</label>
				<label className="flex flex-col gap-2 text-sm text-slate-700">
					<span className="font-medium">Imagen URL</span>
					<input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={imagen_url} onChange={e => setImagenUrl(e.target.value)} required />
				</label>
				<label className="flex flex-col gap-2 text-sm text-slate-700">
					<span className="font-medium">Link</span>
					<input className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20" value={link} onChange={e => setLink(e.target.value)} placeholder="Opcional" />
				</label>
			</div>
			<label className="inline-flex items-center gap-3 rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-3 text-sm text-slate-700">
				<input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} id="activo" className="h-4 w-4 rounded border-slate-300 text-[#7c6c54] focus:ring-[#c6b08a]" />
				<span>Banner activo</span>
			</label>
			<div className="flex flex-col gap-3 pt-2 md:flex-row">
				<button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-[#312c28] px-5 py-3 text-sm font-semibold text-[#f7f0e2] transition hover:bg-[#403932]">Guardar</button>
				<button type="button" className="inline-flex items-center justify-center rounded-2xl border border-[#d6c9b7] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f5eee4]" onClick={onCancel}>Cancelar</button>
			</div>
		</form>
	);
};

export default AdminBannerForm;

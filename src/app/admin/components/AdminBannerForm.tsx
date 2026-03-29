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
		<form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white max-w-lg mx-auto">
			<h2 className="text-lg font-bold">{initialBanner.id ? 'Editar banner' : 'Nuevo banner'}</h2>
			<div>
				<label className="block mb-1">Título</label>
				<input className="w-full border p-2 rounded" value={titulo} onChange={e => setTitulo(e.target.value)} required />
			</div>
			<div>
				<label className="block mb-1">Imagen URL</label>
				<input className="w-full border p-2 rounded" value={imagen_url} onChange={e => setImagenUrl(e.target.value)} required />
			</div>
			<div>
				<label className="block mb-1">Link (opcional)</label>
				<input className="w-full border p-2 rounded" value={link} onChange={e => setLink(e.target.value)} />
			</div>
			<div className="flex items-center gap-2">
				<input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} id="activo" />
				<label htmlFor="activo">Activo</label>
			</div>
			<div className="flex gap-2 mt-4">
				<button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Guardar</button>
				<button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onCancel}>Cancelar</button>
			</div>
		</form>
	);
};

export default AdminBannerForm;

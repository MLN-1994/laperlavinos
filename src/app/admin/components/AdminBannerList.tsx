import React from 'react';
import { Banner } from '../../../types/banner';

interface AdminBannerListProps {
	banners: Banner[];
	onEdit: (banner: Banner) => void;
	onDelete: (id: string) => void;
	onToggleActive: (id: string, active: boolean) => void;
}

const AdminBannerList: React.FC<AdminBannerListProps> = ({ banners, onEdit, onDelete, onToggleActive }) => {
	return (
		<div>
			<h2 className="text-xl font-bold mb-4">Banners existentes</h2>
			<table className="min-w-full border text-sm">
				<thead>
					<tr className="bg-slate-100">
						<th className="p-2 border">Imagen</th>
						<th className="p-2 border">Título</th>
						<th className="p-2 border">Activo</th>
						<th className="p-2 border">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{banners.map((banner) => (
						<tr key={banner.id}>
							<td className="p-2 border">
								<img src={banner.imagen_url} alt={banner.titulo} className="w-32 h-16 object-cover rounded" />
							</td>
							<td className="p-2 border">{banner.titulo}</td>
							<td className="p-2 border text-center">
								<input
									type="checkbox"
									checked={banner.activo}
									onChange={() => onToggleActive(banner.id, !banner.activo)}
								/>
							</td>
							<td className="p-2 border flex gap-2">
								<button className="text-blue-600 underline" onClick={() => onEdit(banner)}>Editar</button>
								<button className="text-red-600 underline" onClick={() => onDelete(banner.id)}>Eliminar</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default AdminBannerList;

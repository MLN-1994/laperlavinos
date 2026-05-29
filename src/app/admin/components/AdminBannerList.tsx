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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">Banners existentes</h2>
				<p className="text-xs text-neutral-400">{banners.length} registrados</p>
			</div>

			{banners.length === 0 ? (
				<div className="rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-400">
					Todavía no hay banners cargados.
				</div>
			) : (
				<>
					<div className="space-y-3 md:hidden">
						{banners.map((banner) => (
							<article key={banner.id} className="rounded-sm border border-neutral-200 bg-neutral-50 p-4">
								<img src={banner.imagen_url} alt="Preview del banner" className="h-40 w-full rounded-sm object-cover opacity-90" />
								<div className="mt-4 space-y-3">
									<p className="text-xs leading-5 text-neutral-400">Solo imagen. El texto superpuesto ya no se usa en la tienda.</p>
									<div className="flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-white px-4 py-3">
										<div>
											<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Estado</p>
											<span className={`mt-1 inline-flex rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${banner.activo ? 'bg-[#a68a5c]/20 text-[#c9a96e]' : 'bg-neutral-100 text-neutral-400'}`}>
												{banner.activo ? 'Activo' : 'Inactivo'}
											</span>
										</div>
										<input
											type="checkbox"
											checked={banner.activo}
											onChange={() => onToggleActive(banner.id, !banner.activo)}
											className="h-4 w-4 rounded border-neutral-300 accent-[#a68a5c]"
										/>
									</div>
									<div className="flex gap-2">
										<button className="flex-1 rounded-sm border border-neutral-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-700" onClick={() => onEdit(banner)}>Editar</button>
										<button className="flex-1 rounded-sm border border-red-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-500 transition hover:text-red-600" onClick={() => onDelete(banner.id)}>Eliminar</button>
									</div>
								</div>
							</article>
						))}
					</div>

					<div className="hidden overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50 md:block">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="border-b border-neutral-200 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
								<th className="px-4 py-4">Imagen</th>
								<th className="px-4 py-4">Uso</th>
								<th className="px-4 py-4">Estado</th>
								<th className="px-4 py-4">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{banners.map((banner) => (
								<tr key={banner.id} className="border-t border-neutral-200 align-middle">
									<td className="px-4 py-4">
										<img src={banner.imagen_url} alt="Preview del banner" className="h-20 w-36 rounded-sm object-cover opacity-90" />
									</td>
									<td className="px-4 py-4">
										<p className="font-medium text-neutral-800">Imagen promocional</p>
									</td>
									<td className="px-4 py-4">
										<label className="inline-flex cursor-pointer items-center gap-3">
											<span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${banner.activo ? 'bg-[#a68a5c]/20 text-[#c9a96e]' : 'bg-neutral-100 text-neutral-400'}`}>
												{banner.activo ? 'Activo' : 'Inactivo'}
											</span>
											<input
												type="checkbox"
												checked={banner.activo}
												onChange={() => onToggleActive(banner.id, !banner.activo)}
												className="h-4 w-4 rounded border-neutral-300 accent-[#a68a5c]"
											/>
										</label>
									</td>
									<td className="px-4 py-4">
										<div className="flex flex-wrap gap-2">
											<button className="rounded-sm border border-neutral-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-700" onClick={() => onEdit(banner)}>Editar</button>
											<button className="rounded-sm border border-red-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-500 transition hover:text-red-600" onClick={() => onDelete(banner.id)}>Eliminar</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				</>
			)}
		</div>
	);
};

export default AdminBannerList;

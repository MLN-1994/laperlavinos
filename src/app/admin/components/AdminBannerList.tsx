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
				<h2 className="text-xl font-semibold tracking-tight text-slate-900">Banners existentes</h2>
				<p className="text-sm text-slate-500">{banners.length} registrados</p>
			</div>

			{banners.length === 0 ? (
				<div className="rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-8 text-sm text-slate-500">
					Todavía no hay banners cargados.
				</div>
			) : (
				<>
					<div className="space-y-3 md:hidden">
						{banners.map((banner) => (
							<article key={banner.id} className="rounded-[24px] border border-[#e4d9c9] bg-white p-4 shadow-sm">
								<img src={banner.imagen_url} alt={banner.titulo} className="h-40 w-full rounded-2xl object-cover" />
								<div className="mt-4 space-y-3">
									<div>
										<p className="text-base font-semibold tracking-tight text-slate-900">{banner.titulo}</p>
										{banner.link ? (
											<p className="mt-1 break-all text-xs leading-5 text-slate-500">{banner.link}</p>
										) : (
											<p className="mt-1 text-xs text-slate-400">Sin link</p>
										)}
									</div>
									<div className="flex items-center justify-between gap-3 rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-3">
										<div>
											<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Estado</p>
											<span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${banner.activo ? 'bg-[#e8ede7] text-[#52614f]' : 'bg-slate-200 text-slate-600'}`}>
												{banner.activo ? 'Activo' : 'Inactivo'}
											</span>
										</div>
										<input
											type="checkbox"
											checked={banner.activo}
											onChange={() => onToggleActive(banner.id, !banner.activo)}
											className="h-5 w-5 rounded border-slate-300 text-[#7c6c54] focus:ring-[#c6b08a]"
										/>
									</div>
									<div className="flex gap-2">
										<button className="flex-1 rounded-xl border border-[#d6c9b7] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#f5eee4]" onClick={() => onEdit(banner)}>Editar</button>
										<button className="flex-1 rounded-xl border border-[#dbc7c4] bg-[#f8efee] px-3 py-2.5 text-sm font-medium text-[#8b5a53] transition hover:bg-[#f3e7e6]" onClick={() => onDelete(banner.id)}>Eliminar</button>
									</div>
								</div>
							</article>
						))}
					</div>

					<div className="hidden overflow-hidden rounded-[24px] border border-[#e4d9c9] bg-white shadow-sm md:block">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="bg-[#f5efe6] text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
								<th className="px-4 py-4">Imagen</th>
								<th className="px-4 py-4">Título</th>
								<th className="px-4 py-4">Estado</th>
								<th className="px-4 py-4">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{banners.map((banner) => (
								<tr key={banner.id} className="border-t border-[#efe6d9] align-middle">
									<td className="px-4 py-4">
										<img src={banner.imagen_url} alt={banner.titulo} className="h-20 w-36 rounded-2xl object-cover shadow-sm" />
									</td>
									<td className="px-4 py-4">
										<p className="font-medium text-slate-900">{banner.titulo}</p>
										{banner.link ? <p className="mt-1 truncate text-xs text-slate-500">{banner.link}</p> : <p className="mt-1 text-xs text-slate-400">Sin link</p>}
									</td>
									<td className="px-4 py-4">
										<label className="inline-flex cursor-pointer items-center gap-3">
											<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${banner.activo ? 'bg-[#e8ede7] text-[#52614f]' : 'bg-slate-200 text-slate-600'}`}>
												{banner.activo ? 'Activo' : 'Inactivo'}
											</span>
											<input
												type="checkbox"
												checked={banner.activo}
												onChange={() => onToggleActive(banner.id, !banner.activo)}
												className="h-4 w-4 rounded border-slate-300 text-[#7c6c54] focus:ring-[#c6b08a]"
											/>
										</label>
									</td>
									<td className="px-4 py-4">
										<div className="flex flex-wrap gap-2">
											<button className="rounded-xl border border-[#d6c9b7] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#f5eee4]" onClick={() => onEdit(banner)}>Editar</button>
											<button className="rounded-xl border border-[#dbc7c4] bg-[#f8efee] px-3 py-2 text-sm font-medium text-[#8b5a53] transition hover:bg-[#f3e7e6]" onClick={() => onDelete(banner.id)}>Eliminar</button>
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

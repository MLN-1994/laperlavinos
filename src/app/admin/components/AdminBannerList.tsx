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
				<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">Banners existentes</h2>
				<p className="text-xs text-[#beb9b1]/40">{banners.length} registrados</p>
			</div>

			{banners.length === 0 ? (
				<div className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 px-4 py-8 text-sm text-[#beb9b1]/40">
					Todavía no hay banners cargados.
				</div>
			) : (
				<>
					<div className="space-y-3 md:hidden">
						{banners.map((banner) => (
							<article key={banner.id} className="rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 p-4">
								<img src={banner.imagen_url} alt={banner.titulo} className="h-40 w-full rounded-sm object-cover opacity-90" />
								<div className="mt-4 space-y-3">
									<div>
										<p className="text-base font-semibold tracking-tight text-[#f5efe3]">{banner.titulo}</p>
										{banner.link ? (
											<p className="mt-1 break-all text-xs leading-5 text-[#beb9b1]/40">{banner.link}</p>
										) : (
											<p className="mt-1 text-xs text-[#beb9b1]/30">Sin link</p>
										)}
									</div>
									<div className="flex items-center justify-between gap-3 rounded-sm border border-[#beb9b1]/10 bg-[#2a2725] px-4 py-3">
										<div>
											<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#beb9b1]/40">Estado</p>
											<span className={`mt-1 inline-flex rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${banner.activo ? 'bg-[#a68a5c]/20 text-[#c9a96e]' : 'bg-[#beb9b1]/10 text-[#beb9b1]/40'}`}>
												{banner.activo ? 'Activo' : 'Inactivo'}
											</span>
										</div>
										<input
											type="checkbox"
											checked={banner.activo}
											onChange={() => onToggleActive(banner.id, !banner.activo)}
											className="h-4 w-4 rounded border-[#beb9b1]/30 accent-[#a68a5c]"
										/>
									</div>
									<div className="flex gap-2">
										<button className="flex-1 rounded-sm border border-[#beb9b1]/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 transition hover:text-[#beb9b1]" onClick={() => onEdit(banner)}>Editar</button>
										<button className="flex-1 rounded-sm border border-[#d03416]/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#d03416]/60 transition hover:text-[#d03416]" onClick={() => onDelete(banner.id)}>Eliminar</button>
									</div>
								</div>
							</article>
						))}
					</div>

					<div className="hidden overflow-hidden rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 md:block">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="border-b border-[#beb9b1]/10 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/40">
								<th className="px-4 py-4">Imagen</th>
								<th className="px-4 py-4">Título</th>
								<th className="px-4 py-4">Estado</th>
								<th className="px-4 py-4">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{banners.map((banner) => (
								<tr key={banner.id} className="border-t border-[#beb9b1]/8 align-middle">
									<td className="px-4 py-4">
										<img src={banner.imagen_url} alt={banner.titulo} className="h-20 w-36 rounded-sm object-cover opacity-90" />
									</td>
									<td className="px-4 py-4">
										<p className="font-medium text-[#f5efe3]">{banner.titulo}</p>
										{banner.link ? <p className="mt-1 truncate text-xs text-[#beb9b1]/40">{banner.link}</p> : <p className="mt-1 text-xs text-[#beb9b1]/30">Sin link</p>}
									</td>
									<td className="px-4 py-4">
										<label className="inline-flex cursor-pointer items-center gap-3">
											<span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${banner.activo ? 'bg-[#a68a5c]/20 text-[#c9a96e]' : 'bg-[#beb9b1]/10 text-[#beb9b1]/40'}`}>
												{banner.activo ? 'Activo' : 'Inactivo'}
											</span>
											<input
												type="checkbox"
												checked={banner.activo}
												onChange={() => onToggleActive(banner.id, !banner.activo)}
												className="h-4 w-4 rounded border-[#beb9b1]/30 accent-[#a68a5c]"
											/>
										</label>
									</td>
									<td className="px-4 py-4">
										<div className="flex flex-wrap gap-2">
											<button className="rounded-sm border border-[#beb9b1]/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/60 transition hover:text-[#beb9b1]" onClick={() => onEdit(banner)}>Editar</button>
											<button className="rounded-sm border border-[#d03416]/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#d03416]/60 transition hover:text-[#d03416]" onClick={() => onDelete(banner.id)}>Eliminar</button>
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

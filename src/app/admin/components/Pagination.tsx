import React from "react";

interface PaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	totalItems?: number;
	pageSize?: number;
	className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
	page,
	totalPages,
	onPageChange,
	totalItems,
	pageSize,
	className = "",
}) => {
	if (totalPages <= 1) return null;

	return (
		<div className={`mt-6 flex flex-col items-center gap-3 rounded-sm border border-[#beb9b1]/10 bg-[#1a1a1a]/20 px-4 py-4 ${className}`}>
			{typeof totalItems === "number" && typeof pageSize === "number" && (
				<div className="text-xs text-[#beb9b1]/40">
					Mostrando {Math.min((page - 1) * pageSize + 1, totalItems)}–{Math.min(page * pageSize, totalItems)} de {totalItems} resultados
				</div>
			)}
			<div className="flex gap-2">
				<button
					className="rounded-sm border border-[#beb9b1]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/50 transition hover:text-[#beb9b1] disabled:opacity-30"
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
				>Anterior</button>
				<span className="px-3 py-2 text-xs text-[#beb9b1]/40">Página {page} de {totalPages}</span>
				<button
					className="rounded-sm border border-[#beb9b1]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#beb9b1]/50 transition hover:text-[#beb9b1] disabled:opacity-30"
					onClick={() => onPageChange(page + 1)}
					disabled={page === totalPages}
				>Siguiente</button>
			</div>
		</div>
	);
};

export default Pagination;

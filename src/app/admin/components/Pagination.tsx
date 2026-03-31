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
		<div className={`mt-8 flex flex-col items-center gap-3 rounded-2xl border border-[#ddd1bf] bg-[#faf6ef] px-4 py-4 shadow-sm ${className}`}>
			{typeof totalItems === "number" && typeof pageSize === "number" && (
				<div className="text-sm text-slate-600">
					Mostrando {Math.min((page - 1) * pageSize + 1, totalItems)} - {Math.min(page * pageSize, totalItems)} de {totalItems} resultados
				</div>
			)}
			<div className="flex gap-2">
				<button
					className="rounded-xl border border-[#d6c9b7] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#f5eee4] disabled:opacity-50"
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
				>Anterior</button>
				<span className="px-3 py-2 text-sm font-medium text-slate-700">Página {page} de {totalPages}</span>
				<button
					className="rounded-xl border border-[#d6c9b7] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#f5eee4] disabled:opacity-50"
					onClick={() => onPageChange(page + 1)}
					disabled={page === totalPages}
				>Siguiente</button>
			</div>
		</div>
	);
};

export default Pagination;

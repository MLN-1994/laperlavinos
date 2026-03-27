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
		<div className={`flex flex-col items-center gap-2 mt-6 ${className}`}>
			{typeof totalItems === "number" && typeof pageSize === "number" && (
				<div className="text-sm text-slate-600">
					Mostrando {Math.min((page - 1) * pageSize + 1, totalItems)} - {Math.min(page * pageSize, totalItems)} de {totalItems} resultados
				</div>
			)}
			<div className="flex gap-2">
				<button
					className="px-3 py-1 rounded border bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
				>Anterior</button>
				<span className="px-2 py-1 text-slate-700">Página {page} de {totalPages}</span>
				<button
					className="px-3 py-1 rounded border bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
					onClick={() => onPageChange(page + 1)}
					disabled={page === totalPages}
				>Siguiente</button>
			</div>
		</div>
	);
};

export default Pagination;

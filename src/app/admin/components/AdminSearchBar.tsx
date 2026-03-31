import React from "react";

interface AdminSearchBarProps {
	value: string;
	onChange: (v: string) => void;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({ value, onChange }) => {
	return (
		<div className="space-y-2">
			<label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
				Buscar
			</label>
			<div className="relative">
			<input
				type="text"
				className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 pl-11 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
				placeholder="Buscar por descripción, código o marca..."
				value={value}
				onChange={e => onChange(e.target.value)}
			/>
			<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
				<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
				</svg>
			</span>
			</div>
		</div>
	);
};

export default AdminSearchBar;

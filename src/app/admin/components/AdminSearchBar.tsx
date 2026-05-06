import React from "react";

interface AdminSearchBarProps {
	value: string;
	onChange: (v: string) => void;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({ value, onChange }) => {
	return (
		<div className="space-y-1.5">
			<label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">
				Buscar
			</label>
			<div className="relative">
			<input
				type="text"
				className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 pl-10 text-sm text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
				placeholder="Buscar por descripción, código o marca..."
				value={value}
				onChange={e => onChange(e.target.value)}
			/>
			<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#beb9b1]/30">
				<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
				</svg>
			</span>
			</div>
		</div>
	);
};

export default AdminSearchBar;

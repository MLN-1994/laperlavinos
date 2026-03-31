import React from "react";

interface AdminGroupSelectProps {
	value: string;
	onChange: (v: string) => void;
	options: string[];
}

const AdminGroupSelect: React.FC<AdminGroupSelectProps> = ({ value, onChange, options }) => {
	return (
		<div className="space-y-2">
			<label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
				Grupo
			</label>
			<select
				className="w-full rounded-2xl border border-[#d7ccbc] bg-[#fdfbf7] px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#9f8763] focus:ring-2 focus:ring-[#c6b08a]/20"
				value={value}
				onChange={e => onChange(e.target.value)}
			>
				<option value="">Todos los grupos</option>
				{options.map((g) => (
					<option key={g} value={g}>{g}</option>
				))}
			</select>
		</div>
	);
};

export default AdminGroupSelect;

import React from "react";

interface AdminGroupSelectProps {
	value: string;
	onChange: (v: string) => void;
	options: string[];
}

const AdminGroupSelect: React.FC<AdminGroupSelectProps> = ({ value, onChange, options }) => {
	return (
		<div className="space-y-1.5">
			<label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
				Grupo
			</label>
			<select
				className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 outline-none transition focus:border-[#a68a5c]"
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

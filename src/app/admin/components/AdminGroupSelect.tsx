import React from "react";

interface AdminGroupSelectProps {
	value: string;
	onChange: (v: string) => void;
	options: string[];
}

const AdminGroupSelect: React.FC<AdminGroupSelectProps> = ({ value, onChange, options }) => {
	return (
		<div className="space-y-1.5">
			<label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#beb9b1]/50">
				Grupo
			</label>
			<select
				className="w-full rounded-sm border border-[#beb9b1]/15 bg-[#1a1a1a]/30 px-3 py-2.5 text-sm text-[#f5efe3] outline-none transition focus:border-[#a68a5c]"
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

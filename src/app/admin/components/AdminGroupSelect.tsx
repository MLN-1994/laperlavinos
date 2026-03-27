import React from "react";

interface AdminGroupSelectProps {
	value: string;
	onChange: (v: string) => void;
	options: string[];
}

const AdminGroupSelect: React.FC<AdminGroupSelectProps> = ({ value, onChange, options }) => {
	return (
		<div className="mb-4">
			<select
				className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

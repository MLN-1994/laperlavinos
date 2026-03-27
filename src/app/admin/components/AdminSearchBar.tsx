import React from "react";

interface AdminSearchBarProps {
	value: string;
	onChange: (v: string) => void;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({ value, onChange }) => {
	return (
		<div className="mb-4">
			<input
				type="text"
				className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				placeholder="Buscar por descripción, código o marca..."
				value={value}
				onChange={e => onChange(e.target.value)}
			/>
		</div>
	);
};

export default AdminSearchBar;

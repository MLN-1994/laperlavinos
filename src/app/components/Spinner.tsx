import React from "react";

interface SpinnerProps {
	size?: number; // px
	colorClass?: string;
	className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 32, colorClass = "border-indigo-600", className = "" }) => (
	<span
		className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClass} ${className}`}
		style={{ width: size, height: size, minWidth: size, minHeight: size }}
	/>
);

export default Spinner;

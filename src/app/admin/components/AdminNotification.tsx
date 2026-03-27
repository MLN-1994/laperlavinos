import React, { useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";

interface Props {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  title?: string;
}

export default function AdminNotification({ message, type, onClose, title }: Props) {
  // Se cierra solo después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Detectar si es un toast de "Producto quitado"
  const isRemoved = title === 'Producto quitado';

  const styles = {
    success: {
      bg: isRemoved ? "bg-yellow-50" : "bg-emerald-50",
      border: isRemoved ? "border-yellow-200" : "border-emerald-200",
      text: isRemoved ? "text-yellow-800" : "text-emerald-800",
      icon: isRemoved ? null : <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <XCircleIcon className="h-6 w-6 text-red-500" />
    }
  };

  const current = styles[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-10 duration-300">
      <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-xl ${current.bg} ${current.border} min-w-[320px]`}>
        {current.icon && (
          <div className="flex-shrink-0">
            {current.icon}
          </div>
        )}
        
        <div className="flex-1">
          <p className={`text-sm font-bold ${current.text}`}>
            {title ? title : (type === 'success' ? '¡Logrado!' : 'Hubo un error')}
          </p>
          <p className={`text-xs opacity-90 ${current.text}`}>
            {message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className={`p-1 rounded-md hover:bg-black/5 transition-colors ${current.text}`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      bg: isRemoved ? "bg-[#f7f1e7]" : "bg-[#f4f2ec]",
      border: isRemoved ? "border-[#dbcdb6]" : "border-[#d4d0c6]",
      text: isRemoved ? "text-[#7b6646]" : "text-[#485046]",
      icon: isRemoved ? null : <CheckCircleIcon className="h-6 w-6 text-[#6d776b]" />
    },
    error: {
      bg: "bg-[#fbf0ef]",
      border: "border-[#e2c5c1]",
      text: "text-[#8b4b43]",
      icon: <XCircleIcon className="h-6 w-6 text-[#b1655a]" />
    }
  };

  const current = styles[type];

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed right-6 top-6 z-[200] animate-in fade-in slide-in-from-right-10 duration-300">
      <div className={`flex min-w-[320px] items-center gap-4 rounded-2xl border p-4 shadow-2xl shadow-black/10 backdrop-blur ${current.bg} ${current.border}`}>
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
    </div>,
    document.body,
  );
}

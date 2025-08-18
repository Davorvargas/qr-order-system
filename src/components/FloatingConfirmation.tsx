"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface FloatingConfirmationProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  duration?: number; // Auto-dismiss duration in ms
  type?: 'success' | 'info' | 'warning';
}

export default function FloatingConfirmation({
  isVisible,
  message,
  onClose,
  duration = 2500, // Default 2.5 seconds
  type = 'success'
}: FloatingConfirmationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle,
      iconColor: 'text-white'
    },
    info: {
      bg: 'bg-blue-500', 
      icon: CheckCircle,
      iconColor: 'text-white'
    },
    warning: {
      bg: 'bg-orange-500',
      icon: CheckCircle, 
      iconColor: 'text-white'
    }
  };

  const style = typeStyles[type];
  const IconComponent = style.icon;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out animate-bounce">
      <div className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
        <IconComponent size={20} className={style.iconColor} />
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
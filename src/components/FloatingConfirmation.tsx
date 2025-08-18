"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, ShoppingBag } from "lucide-react";

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
  duration = 3000, // Default 3 seconds
  type = 'success'
}: FloatingConfirmationProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsAnimatingOut(true);
        // Give time for exit animation before actually closing
        setTimeout(() => {
          setIsAnimatingOut(false);
          onClose();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
      border: 'border-emerald-400/20',
      icon: CheckCircle2,
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      shadow: 'shadow-emerald-500/25'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      border: 'border-blue-400/20', 
      icon: ShoppingBag,
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      shadow: 'shadow-blue-500/25'
    },
    warning: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      border: 'border-orange-400/20',
      icon: CheckCircle2, 
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      shadow: 'shadow-orange-500/25'
    }
  };

  const style = typeStyles[type];
  const IconComponent = style.icon;

  return (
    <div 
      className={`
        fixed top-6 left-1/2 transform -translate-x-1/2 z-50 
        transition-all duration-300 ease-out
        ${isAnimatingOut 
          ? 'opacity-0 -translate-y-2 scale-95' 
          : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-2'
        }
      `}
    >
      <div 
        className={`
          ${style.bg} ${style.border} ${style.shadow}
          backdrop-blur-sm 
          text-white px-5 py-3 rounded-xl 
          shadow-xl border 
          flex items-center gap-4 
          max-w-sm min-w-[280px]
          relative overflow-hidden
        `}
      >
        {/* Subtle animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
        
        {/* Icon with subtle background */}
        <div className={`${style.iconBg} p-2 rounded-full relative z-10`}>
          <IconComponent size={18} className={style.iconColor} strokeWidth={2.5} />
        </div>
        
        {/* Message */}
        <span className="text-sm font-medium flex-1 relative z-10">
          {message}
        </span>
        
        {/* Close button */}
        <button
          onClick={() => {
            setIsAnimatingOut(true);
            setTimeout(() => {
              setIsAnimatingOut(false);
              onClose();
            }, 300);
          }}
          className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 p-1 rounded-full relative z-10 hover:scale-110"
          aria-label="Cerrar notificación"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        {/* Progress bar animation */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 animate-pulse">
            <div 
              className="h-full bg-white/60 transition-all ease-linear"
              style={{
                width: '100%',
                animationDuration: `${duration}ms`,
                animationName: 'shrink',
                animationFillMode: 'forwards'
              }}
            />
          </div>
        )}
      </div>
      
      {/* Custom keyframes for progress bar */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
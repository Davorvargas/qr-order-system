"use client";

import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react"; // <-- ASEGÚRATE DE QUE ESTÉN ESTOS TRES
import type { MenuItem } from "@/types/MenuItem";

// --- TYPE DEFINITIONS ---
interface MenuItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (item: MenuItem, quantity: number, notes: string) => void;
}

// --- MAIN COMPONENT ---
export default function MenuItemDetailModal({
  isOpen,
  onClose,
  item,
  onAddToCart,
}: MenuItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const modalContentRef = useRef<HTMLDivElement>(null); // <-- AÑADIR ESTA LÍNEA

  // Resetear el estado cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes("");
    }
  }, [isOpen]);

  // Manejar clic fuera del modal para cerrarlo
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  const handleConfirmAddToCart = () => {
    onAddToCart(item, quantity, notes);
    onClose();
  };

  const totalPrice = (item.price ?? 0) * quantity;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex flex-col justify-end z-50"
      onClick={handleBackdropClick} // <-- AÑADIR ESTO
    >
      <div
        ref={modalContentRef}
        className="bg-white w-full max-w-lg mx-auto flex flex-col relative animate-slide-up h-[100vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full p-3 z-50 shadow-lg transition-all border border-gray-200"
          aria-label="Volver al menú"
          style={{ zIndex: 999 }}
        >
          <X size={24} className="text-gray-800" />
        </button>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-grow">
          {/* Image */}
          <div className="w-full bg-white px-6 py-6">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                width={500}
                height={300}
                className="w-full h-auto object-contain max-h-[40vh] mx-auto block rounded-lg"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
                style={{ backgroundColor: 'white' }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-4xl text-gray-400">🍽️</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{item.name}</h2>
            {item.description && (
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
            )}
            <p className="text-xl font-bold mb-6 text-gray-900">Bs {item.price?.toFixed(2)}</p>

            {/* Notes Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Notas para este producto
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sin cebolla, término medio, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {notes.length}/200 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t sticky bottom-0 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus size={18} className={quantity <= 1 ? "text-gray-400" : "text-gray-700"} />
            </button>
            <span className="font-bold text-xl w-12 text-center text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Plus size={18} className="text-gray-700" />
            </button>
          </div>
          <button
            onClick={handleConfirmAddToCart}
            className="flex-grow bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
          >
            Agregar {quantity} - Bs {totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

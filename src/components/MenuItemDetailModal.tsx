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
        ref={modalContentRef} // <-- AÑADIR ESTO
        className="bg-white rounded-t-2xl w-full max-w-lg mx-auto flex flex-col relative animate-slide-up max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 bg-white rounded-full p-1 z-10"
        >
          <X size={24} />
        </button>

        {/* Image */}
        <div className="w-full h-64 flex-shrink-0 relative">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              layout="fill"
              className="object-cover rounded-t-2xl"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-2xl" />
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <p className="text-xl font-bold mb-4">Bs {item.price?.toFixed(2)}</p>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Notas para este producto
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, término medio, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t sticky bottom-0 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleConfirmAddToCart}
            className="flex-grow bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800"
          >
            Agregar {quantity} - Bs {totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

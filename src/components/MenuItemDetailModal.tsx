"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image_url?: string;
}

interface MenuItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, notes: string) => void;
  primaryColor: string;
}

export default function MenuItemDetailModal({
  item,
  onClose,
  onAddToCart,
  primaryColor,
}: MenuItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAddToCart = () => {
    onAddToCart(item, quantity, notes);
    onClose();
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const total = (item.price || 0) * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-pink-50 rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] flex flex-col overflow-hidden border border-pink-100">
        {/* Header con botón de cerrar */}
        <div className="flex items-center justify-end p-4 border-b border-pink-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Imagen del producto */}
          <div className="mb-6">
            {item.image_url ? (
              <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-lg">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Nombre del producto */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{item.name}</h2>

          {/* Descripción del producto */}
          {item.description && (
            <div className="mb-4">
              <p className="text-gray-700 text-base leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Precio */}
          <div className="mb-6">
            <p className="text-lg">
              Precio:{" "}
              <span className="font-bold">
                Bs. {(item.price || 0).toFixed(2)}
              </span>
            </p>
          </div>

          {/* Notas para el producto */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas para este producto
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, término medio, etc."
              className="w-full px-3 py-2 border border-pink-200 bg-white rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 resize-none placeholder-pink-400"
              rows={3}
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {notes.length}/200 caracteres
            </div>
          </div>
        </div>

        {/* Footer con controles */}
        <div className="border-t bg-gray-50 p-6">
          {/* Contador de cantidad */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={20} />
            </button>

            <span className="mx-6 text-2xl font-bold w-8 text-center">
              {quantity}
            </span>

            <button
              onClick={incrementQuantity}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Botón Agregar */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 rounded-lg font-bold text-white text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            Agregar {quantity} - Bs {total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

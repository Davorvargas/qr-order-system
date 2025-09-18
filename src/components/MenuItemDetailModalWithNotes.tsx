"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import type { MenuItem } from "@/types/MenuItem";

interface MenuItemDetailModalWithNotesProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, notes: string) => void;
  primaryColor?: string;
}

export default function MenuItemDetailModalWithNotes({
  item,
  onClose,
  onAddToCart,
  primaryColor = "#1e40af",
}: MenuItemDetailModalWithNotesProps) {
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
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] flex flex-col overflow-hidden relative">
        {/* Contenido principal */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Imagen del producto */}
          <div className="mb-6 relative">
            {/* Botón de cerrar superpuesto en la imagen */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <X size={20} />
            </button>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
              className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 text-white bg-gray-900"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Botón Agregar */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 rounded-lg font-bold text-white text-lg hover:opacity-90 transition-opacity bg-gray-900"
          >
            Agregar {quantity} - Bs {total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

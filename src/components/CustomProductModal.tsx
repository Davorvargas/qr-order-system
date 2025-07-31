"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface CustomProduct {
  name: string;
  price: number;
  notes?: string;
}

interface CustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: CustomProduct) => void;
}

export default function CustomProductModal({
  isOpen,
  onClose,
  onAdd,
}: CustomProductModalProps) {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; price?: string } = {};

    if (!productName.trim()) {
      newErrors.name = "El nombre del producto es requerido";
    }

    if (!productPrice.trim()) {
      newErrors.price = "El precio es requerido";
    } else {
      const price = parseFloat(productPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "El precio debe ser un número válido mayor a 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const customProduct: CustomProduct = {
      name: productName.trim(),
      price: parseFloat(productPrice),
      notes: productNotes.trim() || undefined,
    };

    onAdd(customProduct);
    handleClose();
  };

  const handleClose = () => {
    setProductName("");
    setProductPrice("");
    setProductNotes("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Agregar Producto Especial
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="ej. Irish Café con doble shot de whisky"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Product Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (Bs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Product Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción o Notas (Opcional)
              </label>
              <textarea
                value={productNotes}
                onChange={(e) => setProductNotes(e.target.value)}
                placeholder="Ingredientes especiales, preparación, etc..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                {productNotes.length}/200 caracteres
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Agregar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
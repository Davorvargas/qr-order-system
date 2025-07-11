// src/components/ConfirmCompletionModal.tsx
"use client";

import { Order } from "@/app/staff/dashboard/page";
import { CheckCircle2, X } from "lucide-react";

interface ConfirmCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
  isLoading: boolean;
}

export default function ConfirmCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading,
}: ConfirmCompletionModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-2">Confirmar Finalización</h2>
        <p className="text-gray-600 mb-6">
          Por favor, revise los detalles del pedido antes de marcarlo como
          completado.
        </p>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="font-semibold text-gray-800">
                Mesa: {order.table_id}
              </span>
              <span className="text-gray-500 mx-2">|</span>
              <span className="font-semibold text-gray-800">
                {order.customer_name}
              </span>
            </div>
            <span className="font-mono font-bold text-lg">#{order.id}</span>
          </div>

          <h3 className="font-semibold mb-2 text-gray-700">
            Resumen del Pedido:
          </h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {order.order_items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-baseline text-sm"
              >
                <span className="text-gray-800">
                  {item.quantity} x {item.menu_items?.name ?? "Item"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-800">Total:</span>
          <span className="text-2xl font-bold font-mono">
            ${order.total_price?.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={18} className="mr-2" />
            {isLoading ? "Finalizando..." : "Confirmar Finalización"}
          </button>
        </div>
      </div>
    </div>
  );
}

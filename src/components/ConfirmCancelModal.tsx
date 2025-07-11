// src/components/ConfirmCancelModal.tsx
"use client";

import { Order } from "@/app/staff/dashboard/page";
import { XCircle, X } from "lucide-react";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
  isLoading: boolean;
}

export default function ConfirmCancelModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading,
}: ConfirmCancelModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Confirmar Cancelación</h2>
          <p className="text-gray-600 mb-6">
            ¿Está seguro de que desea cancelar el pedido #{order.id} para{" "}
            <span className="font-semibold">{order.customer_name}</span>? Esta
            acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Cancelando..." : "Sí, cancelar pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

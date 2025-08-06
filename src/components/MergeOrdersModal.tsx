"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import { Order } from "@/app/staff/dashboard/page";

interface MergeOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceOrders: Order[];
  targetOrder: Order;
  onMergeComplete: () => void;
}

export default function MergeOrdersModal({
  isOpen,
  onClose,
  sourceOrders,
  targetOrder,
  onMergeComplete,
}: MergeOrdersModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sourceOrderIds = sourceOrders.map((order) => order.id);
  const sourceTotal = sourceOrders.reduce(
    (sum, order) => sum + (order.total_price || 0),
    0
  );
  const targetTotal = targetOrder.total_price || 0;
  const newTotal = sourceTotal + targetTotal;

  const handleMerge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/merge-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderIds: sourceOrderIds,
          targetOrderId: targetOrder.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al fusionar órdenes");
      }

      onMergeComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Fusionar Órdenes</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Advertencia */}
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                ¿Estás seguro de que quieres fusionar estas órdenes?
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Esta acción no se puede deshacer. Las órdenes fusionadas se
                marcarán como "fusionadas".
              </p>
            </div>
          </div>

          {/* Órdenes fuente */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Órdenes a fusionar:
            </h4>
            <div className="space-y-2">
              {sourceOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium">Orden #{order.id}</span>
                  <span className="text-sm text-gray-600">
                    Bs {order.total_price?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Orden objetivo */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Fusionar en:</h4>
            <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-sm font-medium">
                Orden #{targetOrder.id}
              </span>
              <span className="text-sm text-blue-600">
                Bs {targetOrder.total_price?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          {/* Nuevo total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Nuevo total:</span>
              <span className="text-lg font-bold text-green-600">
                Bs {newTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <X size={16} className="text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleMerge}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Fusionando...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Fusionar Órdenes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

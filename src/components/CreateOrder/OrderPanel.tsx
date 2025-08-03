"use client";

import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes: string;
}

interface OrderState {
  [itemId: number]: OrderItemDetail;
}

interface Table {
  id: string;
  table_number: string;
}

interface OrderPanelProps {
  orderItems: OrderState;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  generalNotes: string;
  onGeneralNotesChange: (notes: string) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onUpdateItemNotes: (itemId: number, notes: string) => void;
  onConfirmOrder: () => void;
  isLoading: boolean;
  selectedTableNumber?: string;
  availableTables?: Table[];
  selectedTableId?: string;
  onTableChange?: (tableId: string) => void;
}

export default function OrderPanel({
  orderItems,
  customerName,
  onCustomerNameChange,
  generalNotes,
  onGeneralNotesChange,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemNotes,
  onConfirmOrder,
  isLoading,
  selectedTableNumber,
  availableTables,
  selectedTableId,
  onTableChange,
}: OrderPanelProps) {
  const orderItemsArray = Object.entries(orderItems);
  const totalItems = orderItemsArray.reduce((sum, [, item]) => sum + item.quantity, 0);
  const totalPrice = orderItemsArray.reduce(
    (sum, [, item]) => sum + (item.price ?? 0) * item.quantity,
    0
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Simplified */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Detalle del Pedido</h2>
      </div>

      {/* Items del pedido */}
      <div className="flex-1 overflow-y-auto p-4">
        {orderItemsArray.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No hay productos en el pedido</p>
            <p className="text-sm">Selecciona productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orderItemsArray.map(([itemId, item]) => (
              <div key={itemId} className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                      <span>Bs. {(item.price ?? 0).toFixed(2)} c/u</span>
                      <span className="font-semibold text-purple-700">
                        Total: Bs. {((item.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(parseInt(itemId))}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(parseInt(itemId), item.quantity - 1)}
                      className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-medium text-sm bg-white px-2 py-1 rounded border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(parseInt(itemId), item.quantity + 1)}
                      className="w-7 h-7 rounded bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  
                  {/* Notas del ítem - más compactas */}
                  <div className="flex-1 ml-3">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => onUpdateItemNotes(parseInt(itemId), e.target.value)}
                      placeholder="Comentarios..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con cliente, comentarios y acciones */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {/* Cliente y Mesa en la misma línea */}
        <div className="grid grid-cols-2 gap-3">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Selector de Mesa */}
          {availableTables && availableTables.length > 0 && onTableChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesa
              </label>
              <select
                value={selectedTableId || ""}
                onChange={(e) => onTableChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                {availableTables.map(table => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.table_number}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Comentarios generales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios generales
          </label>
          <textarea
            value={generalNotes}
            onChange={(e) => onGeneralNotesChange(e.target.value)}
            placeholder="Comentarios del pedido..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        {/* Totales - Más compacto */}
        {orderItemsArray.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{totalItems} items</span>
              <div className="text-right">
                <div className="text-lg font-bold text-green-700">
                  Bs. {totalPrice.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Total a pagar</div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción - Más compactos */}
        <div className="flex space-x-2">
          <button
            onClick={onConfirmOrder}
            disabled={isLoading || !customerName.trim() || orderItemsArray.length === 0 || !selectedTableId}
            className="flex-1 bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? "PROCESANDO..." : "CONFIRMAR"}
          </button>
          
          <button className="px-4 py-2.5 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-sm">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
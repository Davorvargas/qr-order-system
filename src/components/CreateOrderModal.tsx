// src/components/CreateOrderModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";

// --- TYPE DEFINITIONS ---
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  is_available: boolean;
  image_url: string | null;
  category_id: number | null;
};
type OrderItem = {
  menu_item_id: number;
  name: string;
  quantity: number;
  price: number;
  notes: string; // <-- AÑADIR CAMPO DE NOTAS
};

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  categories: Category[];
}

// --- MAIN COMPONENT ---
export default function CreateOrderModal({
  isOpen,
  onClose,
  menuItems: allItems,
  categories,
}: CreateOrderModalProps) {
  const supabase = createClient();

  // State
  const [tableId, setTableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem>>({});
  const [view, setView] = useState<"form" | "summary">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null
  );

  // Memos
  const itemsByCategory = useMemo(() => {
    return allItems.reduce((acc, item) => {
      const categoryId = item.category_id ?? -1;
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push(item);
      return acc;
    }, {} as Record<number, MenuItem[]>);
  }, [allItems]);

  const totalPrice = useMemo(() => {
    return Object.values(orderItems).reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  }, [orderItems]);

  const totalItems = useMemo(() => {
    return Object.values(orderItems).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }, [orderItems]);

  // Effects
  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setTableId("");
      setCustomerName("");
      setOrderItems({});
      setView("form");
      setIsLoading(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- HANDLERS ---
  const handleUpdateQuantity = (item: MenuItem, change: 1 | -1) => {
    setOrderItems((prev) => {
      const existing = prev[item.id];
      const newQuantity = (existing?.quantity || 0) + change;

      if (newQuantity <= 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [item.id]: {
          menu_item_id: item.id,
          name: item.name,
          quantity: newQuantity,
          price: item.price ?? 0,
          notes: existing?.notes || "", // <-- MANTENER LAS NOTAS EXISTENTES
        },
      };
    });
  };

  const handleNoteChange = (itemId: number, newNote: string) => {
    setOrderItems((prev) => {
      if (!prev[itemId]) return prev; // No hacer nada si el ítem no está en el pedido
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          notes: newNote,
        },
      };
    });
  };

  const handleGoToSummary = () => {
    if (!tableId.trim()) {
      alert("Por favor, ingrese un número de mesa.");
      return;
    }
    setView("summary");
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setSubmitError(null);

    const payload = {
      table_id: tableId,
      customer_name: customerName.trim() || `Table ${tableId}`, // Default name if empty
      total_price: totalPrice,
      source: "staff_placed", // The key identifier!
      order_items: Object.values(orderItems).map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_order: item.price || 0,
        notes: item.notes, // <-- INCLUIR LAS NOTAS
      })),
    };

    const { error } = await supabase.functions.invoke("place-order", {
      body: payload,
    });

    if (error) {
      setSubmitError(`Error: ${error.message}. Please try again.`);
      setIsLoading(false);
    } else {
      onClose(); // Close modal on success
      // We don't redirect, staff stays on dashboard
    }
  };

  // --- RENDER LOGIC ---
  const renderForm = () => (
    <>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Crear Nuevo Pedido</h2>
        <div>
          <label
            htmlFor="tableId"
            className="block text-sm font-medium text-gray-700"
          >
            Número de Mesa
          </label>
          <input
            type="text"
            name="tableId"
            id="tableId"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre del Cliente (Opcional)
          </label>
          <input
            type="text"
            name="customerName"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 bg-gray-50 max-h-[40vh] overflow-y-auto">
        <h3 className="font-semibold mb-2">Menú</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id}>
              <div
                className="p-3 cursor-pointer flex justify-between items-center border-b border-black"
                onClick={() =>
                  setOpenCategoryId(
                    openCategoryId === category.id ? null : category.id
                  )
                }
              >
                <span className="font-medium">{category.name}</span>
                {openCategoryId === category.id ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
              {openCategoryId === category.id && (
                <div>
                  {(itemsByCategory[category.id] || []).map(
                    (item, idx, arr) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-3 ${
                          !item.is_available ? "opacity-50" : ""
                        } ${
                          idx !== arr.length - 1 ? "border-b border-black" : ""
                        }`}
                      >
                        <div className="flex-grow">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Bs {(item.price || 0).toFixed(2)}
                          </p>
                          {/* --- CAMPO DE NOTAS VISUAL --- */}
                          {orderItems[item.id] && (
                            <input
                              type="text"
                              placeholder="Añadir nota... (ej. sin cebolla)"
                              value={orderItems[item.id].notes}
                              onChange={(e) =>
                                handleNoteChange(item.id, e.target.value)
                              }
                              className="mt-2 block w-full text-sm px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}
                          {/* --------------------------- */}
                        </div>
                        {item.is_available ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item, -1)}
                              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold w-6 text-center">
                              {orderItems[item.id]?.quantity || 0}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item, 1)}
                              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-red-600">
                            Unavailable
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 bg-white border-t sticky bottom-0">
        <button
          onClick={handleGoToSummary}
          disabled={totalItems === 0}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex justify-between items-center"
        >
          <span>
            {totalItems > 0
              ? `View Order (${totalItems} items)`
              : "Add items to order"}
          </span>
          <span>Bs {totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </>
  );

  const renderSummary = () => (
    <>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
        <div className="space-y-2 border-b pb-4 mb-4">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Mesa:</span>
            <span className="font-bold">{tableId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Cliente:</span>
            <span className="font-bold">{customerName || "N/A"}</span>
          </div>
        </div>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {Object.values(orderItems).map((item) => (
            <div key={item.menu_item_id} className="flex items-center gap-4">
              <span className="font-bold">{item.quantity}x</span>
              <span className="flex-grow">{item.name}</span>
              <span className="font-mono">
                Bs {((item.price || 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      {submitError && (
        <div className="p-4 mx-6 mb-4 text-center text-red-700 bg-red-100 rounded-lg">
          <p>{submitError}</p>
        </div>
      )}
      <div className="p-4 bg-white border-t sticky bottom-0 grid grid-cols-2 gap-3">
        <button
          onClick={() => setView("form")}
          className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-300"
        >
          Volver al Menú
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300"
        >
          {isLoading
            ? "Placing Order..."
            : `Realizar Pedido (Bs ${totalPrice.toFixed(2)})`}
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-brightness-50 backdrop-saturate-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col relative max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>
        {view === "form" ? renderForm() : renderSummary()}
      </div>
    </div>
  );
}

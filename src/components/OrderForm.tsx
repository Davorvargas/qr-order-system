"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import FloatingCart from "./FloatingCart";
import OrderSummaryModal from "./OrderSummaryModal";
import MenuItemDetailModal from "./MenuItemDetailModal";
import { Plus } from "lucide-react"; // Importar el icono Plus
import type { MenuItem } from "@/types/MenuItem";

// --- INTERFACES ---
// (Las interfaces permanecen igual, pero algunas se usarán en el nuevo modal)
interface Category {
  id: number;
  name: string;
}
interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes: string;
}
interface OrderState {
  [itemId: number]: OrderItemDetail;
}
interface OrderFormProps {
  categories: Category[];
  items: MenuItem[];
  tableId: string;
}

// --- MAIN COMPONENT ---
export default function OrderForm({
  categories,
  items,
  tableId,
}: OrderFormProps) {
  // --- STATE MANAGEMENT ---
  const router = useRouter();
  const supabase = createClient();
  const [orderItems, setOrderItems] = useState<OrderState>({});
  const [customerName, setCustomerName] = useState("");
  // La nota general ya no es necesaria, se manejará por ítem
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Nuevo estado para el modal de detalle
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // --- MEMOS & HELPER FUNCTIONS ---
  const itemsByCategory = useMemo(() => {
    const grouped: { [key: number]: MenuItem[] } = {};
    items.forEach((item) => {
      if (item.category_id) {
        if (!grouped[item.category_id]) grouped[item.category_id] = [];
        grouped[item.category_id].push(item);
      }
    });
    return grouped;
  }, [items]);

  const totalPrice = useMemo(() => {
    return Object.values(orderItems).reduce((sum, item) => {
      return sum + (item.price ?? 0) * item.quantity;
    }, 0);
  }, [orderItems]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetailModal = () => {
    setSelectedItem(null);
  };

  const handleQuickAdd = (itemToAdd: MenuItem) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemToAdd.id]: {
        quantity: (prev[itemToAdd.id]?.quantity || 0) + 1,
        name: itemToAdd.name,
        price: itemToAdd.price,
        notes: prev[itemToAdd.id]?.notes || "", // Preservar notas existentes si se vuelve a añadir
      },
    }));
  };

  const handleAddToCartFromModal = (
    item: MenuItem,
    quantity: number,
    notes: string
  ) => {
    setOrderItems((prev) => ({
      ...prev,
      [item.id]: {
        quantity: (prev[item.id]?.quantity || 0) + quantity,
        name: item.name,
        price: item.price,
        // Concatenamos las notas si el ítem ya estaba en el carrito
        notes: prev[item.id]?.notes
          ? `${prev[item.id].notes}; ${notes}`
          : notes,
      },
    }));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setOrderItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], quantity: newQuantity },
      }));
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems((prev) => {
      const newOrder = { ...prev };
      delete newOrder[itemId];
      return newOrder;
    });
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setSubmitError(null);

    const payload = {
      table_id: tableId,
      customer_name: customerName.trim(),
      total_price: totalPrice,
      notes, // Usar la nota global real
      order_items: Object.entries(orderItems).map(([itemId, details]) => ({
        menu_item_id: parseInt(itemId, 10),
        quantity: details.quantity,
        price_at_order: details.price,
        notes: details.notes, // <-- ENVIAR LAS NOTAS POR ÍTEM
      })),
    };

    const { data, error } = await supabase.functions.invoke("place-order", {
      body: payload,
    });

    if (error) {
      setSubmitError(error.message);
    } else {
      router.push(`/order/confirmation/${data.order_id}`);
    }
    setIsLoading(false);
  };
  // --- END FUNCTIONS ---

  // --- JSX TO RENDER ---
  return (
    <div className="w-full max-w-4xl mx-auto pb-32">
      {" "}
      {/* Added padding-bottom for FloatingCart */}
      {submitError && (
        <div className="p-4 mb-4 text-center text-red-700 bg-red-100 rounded-lg">
          <p className="font-bold">Error al realizar el pedido:</p>
          <p>{submitError}</p>
        </div>
      )}
      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`}>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight text-gray-800">
              {category.name}
            </h2>
            <div className="flex flex-col">
              {(itemsByCategory[category.id] || []).map((item) => (
                <div key={item.id} className="bg-white border-b">
                  {item.image_url ? (
                    // --- CON IMAGEN ---
                    <div
                      className={`flex gap-4 p-4 ${
                        !item.is_available ? "opacity-60" : ""
                      }`}
                    >
                      <div
                        className="flex-grow cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm my-1 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-2">
                          Bs {(item.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-28 h-28 relative">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          layout="fill"
                          className="object-cover rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    // --- SIN IMAGEN ---
                    <div
                      className={`flex items-center gap-4 p-4 ${
                        !item.is_available ? "opacity-60" : ""
                      }`}
                    >
                      <div
                        className="flex-grow cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm my-1 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-2">
                          Bs {(item.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(item);
                          }}
                          disabled={!item.is_available}
                          className="w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center hover:bg-gray-200 disabled:bg-gray-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {/* Modals */}
      <FloatingCart
        orderItems={orderItems}
        onClick={() => setIsSummaryModalOpen(true)}
      />
      <OrderSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        orderItems={orderItems}
        totalPrice={totalPrice}
        customerName={customerName}
        setCustomerName={setCustomerName}
        notes={notes}
        setNotes={setNotes}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmit={handlePlaceOrder}
        isLoading={isLoading}
      />
      <MenuItemDetailModal
        isOpen={selectedItem !== null}
        onClose={handleCloseDetailModal}
        item={selectedItem}
        onAddToCart={handleAddToCartFromModal}
      />
    </div>
  );
}

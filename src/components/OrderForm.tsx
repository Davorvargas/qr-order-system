"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import FloatingCart from "./FloatingCart";
import OrderSummaryModal from "./OrderSummaryModal";

// --- INTERFACES ---
interface Category {
  id: number;
  name: string;
}
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
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
// --- END INTERFACES ---

// --- ICONS ---
const AddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);
// --- END ICONS ---

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
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedItemId, setAddedItemId] = useState<number | null>(null);
  // --- END STATE ---

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

  const handleAddToOrder = (itemToAdd: MenuItem) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemToAdd.id]: {
        ...prev[itemToAdd.id],
        quantity: (prev[itemToAdd.id]?.quantity || 0) + 1,
        name: itemToAdd.name,
        price: itemToAdd.price,
        notes: "",
      },
    }));
    setAddedItemId(itemToAdd.id);
    setTimeout(() => setAddedItemId(null), 1500); // Reset after 1.5s
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
      notes: notes.trim(), // Include general notes
      order_items: Object.entries(orderItems).map(([itemId, details]) => ({
        menu_item_id: parseInt(itemId, 10),
        quantity: details.quantity,
        price_at_order: details.price,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              {(itemsByCategory[category.id] || []).map((item) => {
                const isAdded = addedItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`bg-white transition-opacity flex gap-4 p-4 border-b ${
                      !item.is_available ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-grow">
                      <h3 className="text-base font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm my-1">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bs {(item.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-24 h-24 relative">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          layout="fill"
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddToOrder(item)}
                        disabled={!item.is_available || isAdded}
                        className={`absolute top-1 right-1 w-7 h-7 rounded-full text-white flex items-center justify-center shadow-md transition-all duration-200 ease-in-out transform hover:scale-110 ${
                          isAdded
                            ? "bg-green-500"
                            : "bg-black bg-opacity-70 hover:bg-opacity-100"
                        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                      >
                        {isAdded ? <CheckIcon /> : <AddIcon />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <FloatingCart
        orderItems={orderItems}
        onClick={() => setIsModalOpen(true)}
      />
      <OrderSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

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

export default function OrderForm({
  categories,
  items,
  tableId,
}: OrderFormProps) {
  // --- STATE VARIABLES ---
  const router = useRouter();
  const supabase = createClient();
  const [customerName, setCustomerName] = useState("");
  const [orderItems, setOrderItems] = useState<OrderState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  // --- END STATE VARIABLES ---

  // --- HELPER FUNCTIONS & MEMOS ---
  const itemsByCategory = useMemo(() => {
    const grouped: { [key: number]: MenuItem[] } = {};
    if (items) {
      items.forEach((item) => {
        if (item.category_id) {
          if (!grouped[item.category_id]) {
            grouped[item.category_id] = [];
          }
          grouped[item.category_id].push(item);
        }
      });
    }
    return grouped;
  }, [items]);

  const handleAddToOrder = (itemToAdd: MenuItem) => {
    setOrderItems((prevOrder) => {
      const existingItem = prevOrder[itemToAdd.id];
      if (existingItem) {
        return {
          ...prevOrder,
          [itemToAdd.id]: {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          },
        };
      } else {
        return {
          ...prevOrder,
          [itemToAdd.id]: {
            quantity: 1,
            name: itemToAdd.name,
            price: itemToAdd.price,
            notes: "",
          },
        };
      }
    });
  };

  const totalPrice = useMemo(() => {
    return Object.values(orderItems).reduce((sum, item) => {
      return sum + (item.price ?? 0) * item.quantity;
    }, 0);
  }, [orderItems]);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setSubmitError(null);
    setIsSuccess(false);

    if (!customerName.trim() || Object.keys(orderItems).length === 0) {
      setSubmitError("Please enter your name and add items to your order.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_id: tableId,
          customer_name: customerName.trim(),
          total_price: totalPrice,
          status: "order_placed",
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Failed to create order record.");

      const newOrderId = orderData.id;
      const itemsToInsert = Object.entries(orderItems).map(
        ([itemId, details]) => ({
          order_id: newOrderId,
          menu_item_id: parseInt(itemId, 10),
          quantity: details.quantity,
          notes: details.notes,
          price_at_order: details.price,
        })
      );

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;

      console.log("Order placed successfully! Order ID:", newOrderId);

      router.push(`/order/confirmation/${newOrderId}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      setSubmitError(error.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  // --- END HELPER FUNCTIONS ---

  // --- JSX TO RENDER ---
  return (
    <div className="w-full max-w-4xl space-y-8">
      <section className="p-4 border rounded bg-white shadow-sm">
        <label
          htmlFor="customerName"
          className="block text-xl font-semibold mb-2"
        >
          Your Name
        </label>
        <input
          type="text"
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Please enter your name"
          required
          className="w-full p-2 border rounded"
        />
      </section>

      <section className="p-4 border rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        {categories.map((category) => (
          <div key={category.id} className="mb-8">
            <h3 className="text-2xl font-medium mb-4 border-b pb-1 text-gray-900">
              {category.name}
            </h3>
            <ul className="space-y-4">
              {(itemsByCategory[category.id] || []).map((item) => (
                // Replace the existing <li> and its contents with this new version
                <li
                  key={item.id}
                  className={`p-3 border-b last:border-b-0 transition-opacity ${
                    !item.is_available ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Image Column */}
                    <div className="flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-md bg-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500 text-center">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details & Button Column */}
                    <div className="flex-grow flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-700 my-1">
                            {item.description}
                          </p>
                        )}
                        {item.price !== null && (
                          <p className="font-semibold text-gray-800">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToOrder(item)}
                        disabled={!item.is_available}
                        className={`ml-4 flex-shrink-0 text-white font-bold py-1 px-3 rounded text-sm transition-colors ${
                          !item.is_available
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {item.is_available ? "Add" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </li> // Find the <li> inside the menu item list and replace it with this:
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="p-4 border rounded bg-gray-100 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Your Order</h2>
        {Object.keys(orderItems).length > 0 ? (
          <div>
            <ul className="space-y-2 mb-4">
              {Object.entries(orderItems).map(([itemId, itemDetail]) => (
                <li
                  key={itemId}
                  className="flex justify-between border-b pb-1 text-gray-800"
                >
                  <span>
                    {itemDetail.quantity} x {itemDetail.name}
                  </span>
                  <span>
                    $
                    {((itemDetail.price ?? 0) * itemDetail.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-right font-bold text-lg text-gray-900">
              Total: ${totalPrice.toFixed(2)}
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Your order is empty.</p>
        )}
      </section>

      {submitError && (
        <p className="text-center text-red-600 font-semibold bg-red-100 p-3 rounded">
          Error: {submitError}
        </p>
      )}
      {isSuccess && (
        <p className="text-center text-green-600 font-semibold bg-green-100 p-3 rounded">
          Order placed successfully!
        </p>
      )}

      <section className="text-center">
        <button
          onClick={handlePlaceOrder}
          disabled={
            isLoading ||
            Object.keys(orderItems).length === 0 ||
            !customerName.trim()
          }
          className={`text-white font-bold py-2 px-6 rounded transition-colors ${
            isLoading ||
            Object.keys(orderItems).length === 0 ||
            !customerName.trim()
              ? "bg-blue-300 opacity-50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Placing Order..." : "Place Order"}
        </button>
      </section>
    </div>
  );
}

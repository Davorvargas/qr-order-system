// src/components/OrderList.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  status: string;
  table_id: string;
  total_price: number | null;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);

  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default function OrderList({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const supabase = createClient();
  const [orders, setOrders] = useState(initialOrders);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((currentOrders) => [
            payload.new as Order,
            ...currentOrders,
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((currentOrders) =>
            currentOrders.map((order) =>
              order.id === payload.new.id
                ? { ...order, ...(payload.new as Order) }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // --- THIS FUNCTION NOW HAS THE CORRECT LOGIC ---
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating status:", error);
      alert("Could not update order status. Check RLS policies.");
    }
    // The realtime listener will handle the UI update automatically.
    setUpdatingOrderId(null);
  };

  // ADDED THIS LOG TO HELP DEBUG
  console.log("Data for the order list:", orders);

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
        Incoming Orders
      </h2>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Order for {order.customer_name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === "order_placed"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "receipt_printed"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800" // This will be for 'completed'
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-600">Table: {order.table_id}</p>
              <p className="text-sm text-gray-600">
                Time: {new Date(order.created_at).toLocaleTimeString()}
                <span className="ml-2 font-medium text-gray-800">
                  ({formatTimeAgo(order.created_at)})
                </span>
              </p>
              <p className="font-semibold mt-2">
                Total: ${order.total_price?.toFixed(2)}
              </p>

              {/* --- THIS IS THE MISSING BUTTONS LOGIC --- */}
              <div className="mt-4 pt-4 border-t flex items-center flex-wrap gap-2">
                {order.status === "order_placed" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order.id, "receipt_printed")
                    }
                    disabled={updatingOrderId === order.id}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? "..." : "Print Receipt"}
                  </button>
                )}
                {order.status === "receipt_printed" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "completed")}
                    disabled={updatingOrderId === order.id}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? "..." : "Mark as Completed"}
                  </button>
                )}
                {/* Show a cancel button for any active order */}
                {(order.status === "order_placed" ||
                  order.status === "receipt_printed") && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "cancelled")}
                    disabled={updatingOrderId === order.id}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? "..." : "Cancel Order"}
                  </button>
                )}
                {order.status === "completed" && (
                  <p className="text-xs text-green-700 font-medium">
                    Order Completed
                  </p>
                )}
                {order.status === "cancelled" && (
                  <p className="text-xs text-red-700 font-medium">
                    Order Cancelled
                  </p>
                )}
              </div>
              {/* --- END BUTTONS LOGIC --- */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No orders found.</p>
      )}
    </section>
  );
}

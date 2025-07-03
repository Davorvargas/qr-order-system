// src/app/order/confirmation/[orderId]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

// We no longer need the ConfirmationPageProps interface, so it has been deleted.

// Type definitions for our data
interface OrderItem {
  id: number;
  quantity: number;
  price_at_order: number | null;
  menu_items: { name: string }[] | null;
}
interface Order {
  id: number;
  customer_name: string;
  table_id: string;
  total_price: number | null;
  order_items: OrderItem[];
}

async function getOrderDetails(orderId: number): Promise<Order> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, customer_name, table_id, total_price,
      order_items ( id, quantity, price_at_order, menu_items ( name ) )
    `
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order details:", error);
    notFound();
  }
  return order;
}

// --- FINAL FIX ---
// This comment tells the linter to ignore the 'no-explicit-any' rule for the next line only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function OrderConfirmationPage({ params }: any) {
  const orderId = parseInt(params.orderId, 10);

  if (isNaN(orderId)) {
    notFound();
  }

  const order = await getOrderDetails(orderId);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Thank You!</h1>
          <p className="text-lg text-gray-700">Your order has been received.</p>
        </div>
        <div className="border-t border-b border-dashed py-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Order #:</span>
            <span className="font-mono font-bold text-lg">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Name:</span>
            <span className="font-bold">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Table:</span>
            <span className="font-bold">{order.table_id}</span>
          </div>
        </div>
        <div>
          <h2 className="font-bold mb-2 text-gray-800">Order Summary</h2>
          <ul className="space-y-1 text-gray-700">
            {order.order_items.map((item: OrderItem) => (
              <li key={item.id} className="flex justify-between items-baseline">
                <span>
                  {item.quantity} x {item.menu_items?.[0]?.name || "Item"}
                </span>
                <span className="font-mono">
                  ${((item.price_at_order ?? 0) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t-2 border-dashed pt-4 text-right">
          <p className="font-bold text-xl">
            Total:{" "}
            <span className="font-mono">${order.total_price?.toFixed(2)}</span>
          </p>
        </div>
        <p className="text-center text-xs text-gray-500 pt-4">
          Please show this confirmation to the staff when paying.
        </p>
      </div>
    </main>
  );
}

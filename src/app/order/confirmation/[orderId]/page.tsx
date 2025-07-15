// src/app/order/confirmation/[orderId]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function ReceiptPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString, 10);

  if (isNaN(orderId)) {
    notFound();
  }

  const order = await getOrderDetails(orderId);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">¡Gracias!</h1>
          <p className="text-lg text-gray-700">Tu pedido ha sido recibido.</p>
        </div>
        <div className="border-t border-b border-dashed py-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Pedido #:</span>
            <span className="font-mono font-bold text-lg">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Nombre:</span>
            <span className="font-bold">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Mesa:</span>
            <span className="font-bold">{order.table_id}</span>
          </div>
        </div>
        <div>
          <h2 className="font-bold mb-2 text-gray-800">Resumen del Pedido</h2>
          <ul className="space-y-1 text-gray-700">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between items-baseline">
                <span>
                  {item.quantity} x {item.menu_items?.name ?? "Plato"}
                </span>
                <span className="font-mono">
                  Bs {((item.price_at_order ?? 0) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {order.notes && (
          <div className="border-t pt-4">
            <h2 className="font-bold mb-2 text-gray-800">Tus Notas</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {order.notes}
            </p>
          </div>
        )}
        <div className="border-t-2 border-dashed pt-4 text-right">
          <p className="font-bold text-xl">
            Total:{" "}
            <span className="font-mono">
              Bs {order.total_price?.toFixed(2)}
            </span>
          </p>
        </div>
        <p className="text-center text-xs text-gray-500 pt-4">
          Por favor, muestra esta confirmación al personal al pagar.
        </p>
      </div>
    </main>
  );
}

// Type definitions for our data
interface OrderItem {
  id: number;
  quantity: number;
  price_at_order: number | null;
  menu_items: { name: string } | null;
}
interface Order {
  id: number;
  customer_name: string;
  table_id: string;
  total_price: number | null;
  notes: string | null;
  order_items: OrderItem[];
}

async function getOrderDetails(orderId: number): Promise<Order> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, customer_name, table_id, total_price, notes,
      order_items ( id, quantity, price_at_order, menu_items ( name ) )
    `
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order details:", error);
    notFound();
  }
  // Definir tipo intermedio para el resultado de Supabase
  type SupabaseOrderItem = {
    id: number;
    quantity: number;
    price_at_order: number | null;
    menu_items: { name: string } | { name: string }[] | null;
  };
  const safeOrder = order as unknown as {
    id: number;
    customer_name: string;
    table_id: string;
    total_price: number | null;
    notes: string | null;
    order_items: SupabaseOrderItem[];
  };
  if (safeOrder && safeOrder.order_items) {
    safeOrder.order_items = safeOrder.order_items.map(
      (item: SupabaseOrderItem) => {
        let menuItem: { name: string } | null = null;
        if (Array.isArray(item.menu_items)) {
          menuItem = item.menu_items.length > 0 ? item.menu_items[0] : null;
        } else if (
          item.menu_items &&
          typeof item.menu_items.name === "string"
        ) {
          menuItem = item.menu_items;
        }
        return {
          ...item,
          menu_items: menuItem,
        };
      }
    );
  }
  return safeOrder as Order;
}

// src/app/order/confirmation/[orderId]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { formatModifierNotes } from "@/utils/formatModifiers";
import { getItemName } from "@/utils/getItemName";

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId: orderIdString } = await params;
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
            <span className="font-bold">
              {order.table_number ?? order.table_id}
            </span>
          </div>
        </div>
        <div>
          <h2 className="font-bold mb-2 text-gray-800">Resumen del Pedido</h2>
          <ul className="space-y-2 text-gray-700">
            {order.order_items.map((item) => (
              <li key={item.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">
                    {item.quantity} x {getItemName(item)}
                  </span>
                  <span className="font-mono">
                    Bs {((item.price_at_order ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
                
                {/* Show modifiers */}
                {item.order_item_modifiers && item.order_item_modifiers.length > 0 && (
                  <div className="ml-4 mt-1 text-sm text-blue-600">
                    {item.order_item_modifiers.map((mod, index) => (
                      <div key={mod.id} className="flex justify-between">
                        <span>• {mod.modifier_groups.name}: {mod.modifiers.name}</span>
                        {mod.price_at_order > 0 && (
                          <span className="font-mono">+Bs {mod.price_at_order.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show item notes (for custom products or regular notes) */}
                {item.notes && (
                  <div className="ml-4 mt-1 text-sm text-gray-500">
                    📝 {formatModifierNotes(item.notes)}
                  </div>
                )}
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
  notes?: string | null;
  order_item_modifiers?: {
    id: string;
    price_at_order: number;
    modifier_id: string;
    modifiers: { name: string; price_modifier: number | null };
    modifier_groups: { name: string };
  }[];
}
interface Order {
  id: number;
  customer_name: string;
  table_id: string;
  total_price: number | null;
  notes: string | null;
  order_items: OrderItem[];
}

async function getOrderDetails(
  orderId: number
): Promise<Order & { table_number?: string }> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, customer_name, table_id, total_price, notes,
      order_items ( 
        id, quantity, price_at_order, notes,
        menu_items ( name ),
        order_item_modifiers(
          id,
          price_at_order,
          modifier_id,
          modifiers(name, price_modifier),
          modifier_groups(name)
        )
      ),
      tables!orders_table_id_fkey ( table_number )
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
    tables?: { table_number?: string } | null;
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
  // Extraer el número de mesa si está disponible
  const table_number = safeOrder.tables?.table_number;
  return { ...(safeOrder as Order), table_number };
}

import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

// Tipos explícitos para los datos de la orden
interface OrderItem {
  id: number;
  quantity: number;
  price_at_order: number;
  menu_items: { name: string } | null;
}

interface Order {
  id: number;
  customer_name: string;
  table_id: string;
  total_price: number;
  order_items: OrderItem[];
}

async function getOrderDetails(orderId: number): Promise<Order> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `id, customer_name, table_id, total_price, order_items ( id, quantity, price_at_order, menu_items ( name ) )`
    )
    .eq("id", orderId)
    .single();
  if (error || !order) notFound();
  // Normalizar order_items para que menu_items siempre sea { name: string } | null
  const normalizedOrderItems: OrderItem[] = order.order_items.map(
    (item: {
      id: number;
      quantity: number;
      price_at_order: number;
      menu_items: { name?: string }[] | { name?: string } | null;
    }): OrderItem => {
      let menuItem: { name: string } | null = null;
      if (Array.isArray(item.menu_items)) {
        menuItem =
          item.menu_items.length > 0 &&
          typeof item.menu_items[0].name === "string"
            ? (item.menu_items[0] as { name: string })
            : null;
      } else if (item.menu_items && typeof item.menu_items.name === "string") {
        menuItem = item.menu_items as { name: string };
      }
      return {
        ...item,
        menu_items: menuItem,
      };
    }
  );
  return {
    id: order.id,
    customer_name: order.customer_name,
    table_id: order.table_id,
    total_price: order.total_price,
    order_items: normalizedOrderItems,
  };
}

export default async function Page({
  params,
}: {
  params: { orderId: string };
}) {
  const orderId = parseInt(params.orderId, 10);
  if (isNaN(orderId)) notFound();
  const order = await getOrderDetails(orderId);

  return (
    <html lang="es">
      <head>
        <title>Recibo #{order.id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #222; margin: 0; padding: 0; }
          .receipt-container { max-width: 350px; margin: 24px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 24px; }
          h1 { font-size: 1.5rem; margin-bottom: 8px; text-align: center; }
          .meta { font-size: 1rem; margin-bottom: 16px; text-align: center; }
          .order-info { margin-bottom: 16px; }
          .order-info span { display: block; font-size: 1rem; }
          .items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .items th, .items td { padding: 4px 0; text-align: left; font-size: 0.98rem; }
          .items th { border-bottom: 1px solid #eee; font-weight: 600; }
          .items td:last-child { text-align: right; }
          .total { font-size: 1.2rem; font-weight: bold; text-align: right; margin-bottom: 16px; }
          .thanks { text-align: center; font-size: 1rem; color: #555; margin-top: 16px; }
          .print-instruction { color: #b91c1c; font-size: 0.95rem; text-align: center; margin-bottom: 10px; }
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { background: #fff !important; }
            .receipt-container { box-shadow: none; margin: 0; border-radius: 0; max-width: 80mm; padding: 0 0 0 0; }
            .print-instruction { display: none; }
          }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.onload = function() { window.print(); }`,
          }}
        />
      </head>
      <body>
        <div className="receipt-container">
          <h1>Recibo de Pedido</h1>
          <div className="meta">Pedido #{order.id}</div>
          <div className="order-info">
            <span>
              <strong>Mesa:</strong> {order.table_id}
            </span>
            <span>
              <strong>Cliente:</strong> {order.customer_name}
            </span>
          </div>
          <table className="items">
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Producto</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item: OrderItem) => (
                <tr key={item.id}>
                  <td>{item.quantity}</td>
                  <td>{item.menu_items ? item.menu_items.name : "-"}</td>
                  <td>Bs {(item.price_at_order * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total">Total: Bs {order.total_price?.toFixed(2)}</div>
          <div className="thanks">¡Gracias por tu visita!</div>
        </div>
        <div className="print-instruction">
          Si ves &quot;Guardar como PDF&quot;, selecciona tu impresora para
          imprimir el recibo.
        </div>
      </body>
    </html>
  );
}

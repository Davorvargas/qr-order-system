"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import OrderList from "@/components/OrderList";

// Define the types for our data, including nested items
export type OrderItem = {
  id: number;
  quantity: number;
  menu_items: { name: string; price: number | null } | null;
  notes?: string;
};

export type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  status: string;
  table_id: string;
  table?: { table_number?: string; restaurant_id?: string };
  total_price: number | null;
  order_items: OrderItem[];
  source: string;
  kitchen_printed: boolean;
  drink_printed: boolean;
  notes?: string;
};

export default function StaffDashboardPage() {
  const supabase = createClient();
  const [initialOrders, setInitialOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Obtener el restaurant_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Obtener el restaurant_id del perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) {
        setLoading(false);
        return;
      }

      // Filtrar órdenes por restaurant_id
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          "*, notes, table:tables(table_number, restaurant_id), order_items(*, notes, menu_items(name, price))"
        )
        .eq('restaurant_id', profile.restaurant_id)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error.message);
      } else {
        setInitialOrders(orders as Order[]);
      }
      setLoading(false);
    };

    getInitialData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>
      <OrderList initialOrders={initialOrders} />
    </div>
  );
}

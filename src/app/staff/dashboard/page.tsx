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
  order_item_modifiers?: {
    id: string;
    price_at_order: number;
    modifier_id: string;
    modifiers: { name: string; price_modifier: number | null };
    modifier_groups: { name: string };
  }[];
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
  receipt_printed: boolean;
  notes?: string;
};

export default function StaffDashboardPage() {
  const supabase = createClient();
  const [initialOrders, setInitialOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
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

      // Buscar la última caja cerrada para determinar desde cuándo mostrar pedidos
      const { data: lastClosedCash } = await supabase
        .from('cash_registers')
        .select('closed_at')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
        .limit(1)
        .single();

      // Determinar fecha de inicio para filtrar pedidos
      let startDate;
      if (lastClosedCash?.closed_at) {
        // Si hay una caja cerrada, mostrar pedidos desde esa fecha
        startDate = new Date(lastClosedCash.closed_at);
      } else {
        // Si no hay cajas cerradas, mostrar pedidos del día actual
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      }

      // Filtrar órdenes por restaurant_id e incluir modificadores
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *, 
          notes, 
          table:tables(table_number, restaurant_id), 
          order_items(
            *, 
            notes, 
            menu_items(name, price),
            order_item_modifiers(
              id,
              price_at_order,
              modifier_id,
              modifiers(name, price_modifier),
              modifier_groups(name)
            )
          )
        `)
        .eq('restaurant_id', profile.restaurant_id)
        .eq('archived', false)
        .gte("created_at", startDate.toISOString())
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

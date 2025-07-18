"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderList from "@/components/OrderList";
import StaffLayout from "@/components/StaffLayout"; // <-- Import the new layout
import { User } from "@supabase/supabase-js";
import CreateOrderModal from "@/components/CreateOrderModal"; // Import the modal
import { PlusCircle } from "lucide-react"; // Import an icon

// Define the types for our data, including nested items
export type OrderItem = {
  id: number;
  quantity: number;
  menu_items: { name: string } | null;
};

export type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  status: string;
  table_id: string;
  total_price: number | null;
  order_items: OrderItem[];
  source: string; // Add source field
  kitchen_printed: boolean;
  drink_printed: boolean;
};

// Types for menu data needed by the modal
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  is_available: boolean;
  image_url: string | null;
  category_id: number | null;
};
type Category = { id: number; name: string };

export default function StaffDashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [initialOrders, setInitialOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const getInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // --- Updated data fetching for TODAY's orders ---
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today in local time

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, order_items(*, menu_items(name))") // <-- Fetch nested data
        .gte("created_at", today.toISOString()) // Filter for orders from today onwards
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error.message);
      } else {
        setInitialOrders(orders as Order[]);
      }

      // Fetch menu data for the modal
      const { data: menuItemsData } = await supabase
        .from("menu_items")
        .select("*");
      const { data: categoriesData } = await supabase
        .from("menu_categories")
        .select("*");
      setMenuItems(menuItemsData || []);
      setCategories(categoriesData || []);

      setLoading(false);
    };

    getInitialData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <StaffLayout userEmail={user?.email} onLogout={handleLogout}>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Pedidos</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Crear una orden
          </button>
        </div>
        <OrderList initialOrders={initialOrders} />
      </div>
      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItems={menuItems}
        categories={categories}
      />
    </StaffLayout>
  );
}

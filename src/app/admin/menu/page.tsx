// src/app/admin/menu/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MenuManager from "@/components/MenuManager";

type Category = { id: number; name: string; is_available: boolean };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
};

export default function MenuPage() {
  const supabase = createClient();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError("No authenticated user found");
          setLoading(false);
          return;
        }

        // Get user's restaurant
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("restaurant_id")
          .eq("id", user.id)
          .single();

        if (profileError || !profile?.restaurant_id) {
          setError("No restaurant associated with this user");
          setLoading(false);
          return;
        }

        const restaurantId = profile.restaurant_id;

        // Get menu items and categories
        const [itemsResponse, categoriesResponse] = await Promise.all([
          supabase
            .from("menu_items")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("display_order"),
          supabase
            .from("menu_categories")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("display_order")
        ]);

        if (itemsResponse.error || categoriesResponse.error) {
          console.error("Error fetching data:", itemsResponse.error || categoriesResponse.error);
          setError("Error loading menu data");
        } else {
          setMenuItems(itemsResponse.data || []);
          setCategories(categoriesResponse.data || []);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error loading menu data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Normalizar is_available para que nunca sea null
  const safeCategories = categories.map((cat) => ({
    ...cat,
    is_available: cat.is_available ?? false,
  }));

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
      <MenuManager
        initialItems={menuItems}
        categories={safeCategories}
      />
    </>
  );
}

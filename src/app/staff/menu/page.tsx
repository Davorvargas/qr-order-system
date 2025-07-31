"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MenuOrderManager from "@/components/MenuOrderManager";

type Category = {
  id: number;
  name: string;
  is_available: boolean;
  display_order: number;
};

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
  display_order: number;
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
        const { data: menuItemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .order("display_order");

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("*")
          .order("display_order");

        if (itemsError || categoriesError) {
          setError("Error loading menu data");
          console.error("Error:", itemsError || categoriesError);
        } else {
          setMenuItems(menuItemsData || []);
          setCategories(
            (categoriesData || []).map((cat) => ({
              ...cat,
              is_available: cat.is_available ?? false,
            }))
          );
        }
      } catch (err) {
        setError("Error loading menu data");
        console.error("Error:", err);
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

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
      <MenuOrderManager categories={categories} menuItems={menuItems} />
    </div>
  );
}
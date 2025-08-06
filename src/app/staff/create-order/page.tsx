"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import CreateOrder from "@/components/CreateOrder";

interface Category {
  id: number;
  name: string;
  is_available: boolean;
  display_order: number;
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
}

export default function CreateOrderPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar autenticación
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          redirect("/login");
          return;
        }

        // Obtener restaurant_id del usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("restaurant_id")
          .eq("id", user.id)
          .single();

        if (!profile?.restaurant_id) {
          redirect("/login");
          return;
        }

        // Obtener productos filtrados por restaurante
        const { data: itemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", profile.restaurant_id)
          // Excluir productos especiales viejos que no deben aparecer en dashboard
          .not("description", "like", "%Producto especial%")
          .not("name", "like", "[ELIMINADO]%")
          // Mostrar todos los items normales para el staff, incluyendo desactivados
          .order("category_id")
          .order("display_order");

        if (itemsError) {
          console.error("Error fetching menu items:", itemsError);
          setError("Error loading menu items");
          return;
        }

        // Obtener categorías reales de la base de datos
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("restaurant_id", profile.restaurant_id)
          .eq("is_available", true) // Solo categorías disponibles
          .order("display_order");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          setError("Error loading categories");
          return;
        }

        setItems(itemsData || []);
        setCategories(categoriesData || []);
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Error loading data");
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading menu items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] -m-8">
      <CreateOrder categories={categories} items={items} />
    </div>
  );
}

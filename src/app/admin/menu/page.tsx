// src/app/admin/menu/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import MenuManager from "@/components/MenuManager";

export const dynamic = "force-dynamic"; // <-- FUERZA A LA PÁGINA A SER DINÁMICA

export default async function MenuPage() {
  const supabase = createServerComponentClient<Database>({
    cookies,
  });

  const { data: menuItems, error: itemsError } = await supabase
    .from("menu_items")
    .select("*")
    .order("display_order");

  if (itemsError) {
    console.error(
      "Error fetching menu items:",
      JSON.stringify(itemsError, null, 2)
    );
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("*") // <-- Limpiado para más claridad
    .order("display_order");

  if (categoriesError) {
    console.error(
      "Error fetching categories:",
      JSON.stringify(categoriesError, null, 2)
    );
  }

  if (itemsError || categoriesError) {
    return (
      <div>Error loading menu data. Check the server logs for details.</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
      <MenuManager
        initialItems={menuItems || []}
        categories={categories || []}
      />
    </div>
  );
}

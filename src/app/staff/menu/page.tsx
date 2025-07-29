// src/app/staff/menu/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import MenuManager from "@/components/MenuManager";

export const dynamic = "force-dynamic";

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
    .select("*")
    .order("display_order");

  if (categoriesError) {
    console.error(
      "Error fetching categories:",
      JSON.stringify(categoriesError, null, 2)
    );
  }

  let content;

  if (itemsError || categoriesError) {
    content = (
      <div>Error loading menu data. Check the server logs for details.</div>
    );
  } else {
    const safeCategories = (categories || []).map((cat) => ({
      ...cat,
      is_available: cat.is_available ?? false,
    }));

    content = (
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
        <MenuManager
          initialItems={menuItems || []}
          categories={safeCategories}
        />
      </div>
    );
  }

  return content;
}
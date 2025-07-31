import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateOrder from "@/components/CreateOrder";

interface Category {
  id: number;
  name: string;
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

export default async function CreateOrderPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener categorías y productos
  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("is_available", true)
      .order("display_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("display_order"),
  ]);

  if (categoriesResult.error) {
    console.error("Error fetching categories:", categoriesResult.error);
    return <div>Error loading categories</div>;
  }

  if (itemsResult.error) {
    console.error("Error fetching menu items:", itemsResult.error);
    return <div>Error loading menu items</div>;
  }

  const categories: Category[] = categoriesResult.data || [];
  const items: MenuItem[] = itemsResult.data || [];

  return (
    <div className="h-[calc(100vh-2rem)] -m-8">
      <CreateOrder categories={categories} items={items} />
    </div>
  );
}
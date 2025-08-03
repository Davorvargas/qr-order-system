import { createClient } from "@/utils/supabase/server";
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

export default async function CreateOrderPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener restaurant_id del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.restaurant_id) {
    redirect("/login");
  }

  // Obtener productos filtrados por restaurante
  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", profile.restaurant_id)
    // Mostrar todos los items para el staff, incluyendo desactivados  
    .order("category_id")
    .order("display_order");

  if (itemsError) {
    console.error("Error fetching menu items:", itemsError);
    return <div>Error loading menu items</div>;
  }

  // Obtener categorías reales de la base de datos
  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", profile.restaurant_id)
    .eq("is_available", true) // Solo categorías disponibles
    .order("display_order");

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
    return <div>Error loading categories</div>;
  }

  console.log('CreateOrder Debug:', {
    restaurant_id: profile.restaurant_id,
    categories: categories.length,
    items: items.length,
    sampleItems: items.slice(0, 3).map(i => i.name)
  });

  return (
    <div className="h-[calc(100vh-2rem)] -m-8">
      <CreateOrder categories={categories} items={items} />
    </div>
  );
}
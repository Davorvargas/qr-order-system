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
    .eq("is_available", true)
    .order("display_order");

  if (itemsError) {
    console.error("Error fetching menu items:", itemsError);
    return <div>Error loading menu items</div>;
  }

  // Generar categorías únicas basadas en los category_id de los items
  const categoryIds = [...new Set(items?.map(item => item.category_id).filter(id => id))];
  
  // Mapeo de category_id a nombres descriptivos
  const categoryNames: Record<number, string> = {
    41: 'Cafés en Máquina',
    42: 'Especialidad Métodos', 
    43: 'Bebidas Calientes',
    44: 'Bebidas Frías',
    45: 'Jugos',
    46: 'Pastelería',
    47: 'Nuestros Especiales'
  };
  
  const categories: Category[] = categoryIds.map(id => ({
    id: id as number,
    name: categoryNames[id as number] || `Categoría ${id}`
  }));

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
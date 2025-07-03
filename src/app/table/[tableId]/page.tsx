// src/app/table/[tableId]/page.tsx
// --- UPDATED VERSION ---

import { createClient } from "@/utils/supabase/server"; // <-- Use the new SERVER client
import OrderForm from "@/components/OrderForm";

interface TablePageProps {
  params: {
    tableId: string;
  };
}

// Update the data fetching function to use the new server client
async function getMenuData() {
  const supabase = await createClient(); // <-- Initialize and await the client

  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("id, name")
    .order("name");

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select(
      "id, name, description, price, category_id, is_available, image_url"
    )
    .order("name");

  if (categoriesError)
    console.error("Error fetching categories:", categoriesError.message);
  if (itemsError) console.error("Error fetching items:", itemsError.message);

  return {
    categories: categories || [],
    items: items || [],
  };
}

// The rest of the component remains largely the same
export default async function TablePage({ params }: TablePageProps) {
  const { tableId } = params;
  const { categories, items } = await getMenuData(); // This now uses the updated function

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        Order for Table {tableId}
      </h1>

      {/* Render the Client Component and pass down data */}
      <OrderForm categories={categories} items={items} tableId={tableId} />
    </main>
  );
}

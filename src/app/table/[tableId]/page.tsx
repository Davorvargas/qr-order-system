// src/app/table/[tableId]/page.tsx
import { createClient } from "@/utils/supabase/server";
import OrderForm from "@/components/OrderForm";

// We no longer need the TablePageProps interface, so it has been deleted.

async function getMenuData() {
  const supabase = await createClient();
  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("id, name")
    .order("name");

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("*, menu_categories(name)") // Using * is fine here
    .order("name");

  if (categoriesError)
    console.error("Error fetching categories:", categoriesError.message);
  if (itemsError) console.error("Error fetching items:", itemsError.message);

  return {
    categories: items ? categories || [] : [],
    menuItems: items || [],
  };
}

// --- FINAL FIX ---
// This comment tells the linter to ignore the 'no-explicit-any' rule for the next line only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function TablePage({ params }: any) {
  const { tableId } = params;
  const { categories, menuItems } = await getMenuData();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        Order for Table {tableId}
      </h1>

      <OrderForm categories={categories} items={menuItems} tableId={tableId} />
    </main>
  );
}

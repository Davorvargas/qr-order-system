// src/app/page.tsx
// --- UPDATED VERSION ---
import { createClient } from "@/utils/supabase/server";

// Define a simplified type for a menu item for use in our grouping logic
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
}

export default async function Home() {
  // Initialize the new server client
  const supabase = await createClient();

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("id, name") // More efficient to select only needed columns
    .order("name");

  // Fetch items
  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("id, name, description, price, category_id, is_available") // More efficient
    .order("name");

  // --- Group items by category_id ---
  const itemsByCategory: { [key: number]: MenuItem[] } = {};
  if (items) {
    // We cast 'items' to 'any' here temporarily to avoid a deep type issue
    // with Supabase's inferred types vs our simple interface.
    (items as any[]).forEach((item: MenuItem) => {
      if (item.category_id) {
        if (!itemsByCategory[item.category_id]) {
          itemsByCategory[item.category_id] = [];
        }
        itemsByCategory[item.category_id].push(item);
      }
    });
  }
  // --- End grouping logic ---

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <h1 className="text-4xl font-bold mb-12">Menu</h1>

      {categoriesError && (
        <p className="text-red-500 mb-4">
          Error loading categories: {categoriesError.message}
        </p>
      )}
      {itemsError && (
        <p className="text-red-500 mb-4">
          Error loading items: {itemsError.message}
        </p>
      )}

      {categories && categories.length > 0 ? (
        <div className="w-full max-w-4xl">
          {categories.map((category) => (
            <section key={category.id} className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 border-b pb-2 text-gray-900">
                {category.name}
              </h2>
              {itemsByCategory[category.id] &&
              itemsByCategory[category.id].length > 0 ? (
                <ul className="space-y-4">
                  {itemsByCategory[category.id].map((item) => (
                    <li
                      key={item.id}
                      className="border p-4 rounded-md shadow-sm"
                    >
                      <h3 className="text-xl font-medium text-gray-900">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-700 my-1">
                          {item.description}
                        </p>
                      )}
                      {item.price !== null && (
                        <p className="font-semibold text-gray-800">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  No items found in this category.
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <p>No categories found.</p>
      )}
    </main>
  );
}

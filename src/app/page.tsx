import { supabase } from '@/lib/supabaseClient';

// Define simple types for our data (optional but good practice with TypeScript)
interface Category {
  id: number;
  created_at: string;
  name: string;
}
interface MenuItem {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category_id: number | null;
}

export default async function Home() {
  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('menu_categories')
    .select('*')
    .order('name'); // Optional: Order categories alphabetically by name

  // Fetch items
  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*');

  // Log data to server terminal
  console.log('Fetched categories:', categories);
  console.log('Fetched items:', items);

  // --- Group items by category_id ---
  const itemsByCategory: { [key: number]: MenuItem[] } = {};
  if (items) {
    items.forEach((item) => {
      if (item.category_id) { // Check if category_id exists
        if (!itemsByCategory[item.category_id]) {
          itemsByCategory[item.category_id] = []; // Initialize array if not present
        }
        itemsByCategory[item.category_id].push(item);
      }
      // Optional: Handle items with null category_id if needed
    });
  }
  console.log('Items grouped by category:', itemsByCategory); // Log the grouped structure
  // --- End grouping logic ---

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24"> {/* Adjusted padding */}
      <h1 className="text-4xl font-bold mb-12">Menu</h1>

      {/* Display Errors if any */}
      {categoriesError && <p className="text-red-500 mb-4">Error loading categories: {categoriesError.message}</p>}
      {itemsError && <p className="text-red-500 mb-4">Error loading items: {itemsError.message}</p>}

      {/* Display Menu by Category */}
      {!categoriesError && categories && categories.length > 0 ? (
        <div className="w-full max-w-4xl"> {/* Added container for better layout */}
          {categories.map((category) => (
            <section key={category.id} className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 border-b pb-2">{category.name}</h2>
              {/* Get items for this category from the grouped object */}
              {itemsByCategory[category.id] && itemsByCategory[category.id].length > 0 ? (
                <ul className="space-y-4"> {/* Added spacing between items */}
                  {itemsByCategory[category.id].map((item) => (
                    <li key={item.id} className="border p-4 rounded-md shadow-sm"> {/* Added some basic styling */}
                      <h3 className="text-xl font-medium">{item.name}</h3>
                      {item.description && <p className="text-sm text-gray-600 my-1">{item.description}</p>}
                      {item.price !== null && <p className="font-semibold">${item.price.toFixed(2)}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No items found in this category.</p>
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
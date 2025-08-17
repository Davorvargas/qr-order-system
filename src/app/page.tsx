// src/app/page.tsx
import { createClient } from "@/utils/supabase/server";
import Image from "next/image"; // Import the Next.js Image component

// Define our types clearly at the top
interface Category {
  id: number;
  name: string;
}

// This type represents a menu item with its category info joined
interface MenuItemWithCategory {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  is_available: boolean;
  image_url: string | null;
  category_id: number | null;
  menu_categories: { name: string } | null;
}

async function getMenuData() {
  const supabase = await createClient();
  const { data: categories, error: catError } = await supabase
    .from("menu_categories")
    .select("id, name")
    .order("name");
  const { data: menuItems, error: itemError } = await supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .order("id");

  if (catError) console.error("Error fetching categories:", catError.message);
  if (itemError) console.error("Error fetching items:", itemError.message);

  return {
    categories: categories || [],
    menuItems: menuItems || [],
  };
}

export default async function Home() {
  const { categories, menuItems } = await getMenuData();

  const itemsByCategory: { [key: number]: MenuItemWithCategory[] } = {};
  if (menuItems) {
    // We use the consistent variable name 'menuItems' here
    menuItems.forEach((item) => {
      if (item.category_id) {
        if (!itemsByCategory[item.category_id]) {
          itemsByCategory[item.category_id] = [];
        }
        itemsByCategory[item.category_id].push(item);
      }
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <h1 className="text-4xl font-bold mb-12">Menú</h1>

      {categories && categories.length > 0 ? (
        <div className="w-full max-w-4xl">
          {categories.map((category: Category) => (
            <section key={category.id} className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 border-b pb-2 text-gray-900">
                {category.name}
              </h2>
              <div className="space-y-4">
                {(itemsByCategory[category.id] || []).map(
                  (item: MenuItemWithCategory) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-md flex items-start gap-4 transition-all ${
                        !item.is_available
                          ? "bg-gray-100 pointer-events-none"
                          : ""
                      }`}
                      style={{ opacity: item.is_available ? 1 : 0.5 }}
                    >
                      {/* Imagen con overlay si no está disponible */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.image_url || "/public/file.svg"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded-md bg-gray-200"
                          unoptimized
                        />
                        {!item.is_available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md z-10">
                            <span
                              className="text-gray-700 text-xs font-semibold tracking-wide text-center"
                              style={{ letterSpacing: "0.03em" }}
                            >
                              No disponible por el momento
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                        <p className="font-semibold text-lg text-gray-800">
                          Bs {item.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No se encontraron productos en el menú.</p>
      )}
    </main>
  );
}

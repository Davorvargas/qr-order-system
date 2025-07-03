// src/components/MenuManager.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MenuItemForm from "./MenuItemForm";

// Type definitions remain the same
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
  menu_categories: { name: string } | null;
};
interface MenuManagerProps {
  initialItems: MenuItem[];
  categories: Category[];
}

export default function MenuManager({
  initialItems,
  categories,
}: MenuManagerProps) {
  const supabase = createClient();
  const [menuItems, setMenuItems] = useState(initialItems);
  // This state will hold the item being edited. If it's null, the form is for adding a new item.
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // This function now just sets the item to be edited
  const handleEditClick = (item: MenuItem) => {
    setItemToEdit(item);
    // Scroll to the top of the page to see the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // This function will be called from the form when an item is added or updated
  const handleFormComplete = () => {
    alert(
      "Menu updated successfully! The page will now refresh to show changes."
    );
    window.location.reload();
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm("Are you sure you want to delete this menu item?"))
      return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setMenuItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId)
      );
      alert("Menu item deleted successfully.");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    setUpdatingId(item.id);
    const newStatus = !item.is_available;
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: newStatus })
      .eq("id", item.id);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setMenuItems((currentItems) =>
        currentItems.map((i) =>
          i.id === item.id ? { ...i, is_available: newStatus } : i
        )
      );
    }
    setUpdatingId(null);
  };

  return (
    <>
      {/* Section to ADD or EDIT an item. The form is now always visible. */}
      <section className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {itemToEdit ? `Editing: ${itemToEdit.name}` : "Add a New Menu Item"}
        </h2>
        <MenuItemForm
          categories={categories}
          itemToEdit={itemToEdit}
          // We pass a function to the form so it can tell us when it's done
          onComplete={handleFormComplete}
          // We also pass a function to clear the form for editing
          onCancelEdit={() => setItemToEdit(null)}
        />
      </section>

      {/* Section to DISPLAY existing items */}
      <section className="mt-12 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Menu Items</h2>
        <div className="space-y-4">
          {menuItems.map((item) => (
            // Replace the existing item-mapping div with this one:
            <div
              key={item.id}
              className={`p-4 border rounded-md flex items-center gap-4 transition-all ${
                !item.is_available ? "bg-gray-100 opacity-70" : ""
              }`}
            >
              {/* Column 1: Image */}
              <div className="flex-shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md bg-gray-200"
                  />
                ) : (
                  // Placeholder if no image exists
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-xs text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              {/* Column 2: Item Details (this part grows to fill space) */}
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-sm font-medium text-indigo-600">
                  Category: {item.menu_categories?.name || "N/A"}
                </p>
                <p className="font-semibold text-lg text-gray-800">
                  ${item.price?.toFixed(2)}
                </p>
              </div>

              {/* Column 3: Controls */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center">
                  <label
                    htmlFor={`available-${item.id}`}
                    className={`mr-2 text-sm font-medium ${
                      item.is_available ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id={`available-${item.id}`}
                      checked={item.is_available}
                      onChange={() => handleToggleAvailability(item)}
                      disabled={updatingId === item.id}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex-shrink-0 space-x-2 mt-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

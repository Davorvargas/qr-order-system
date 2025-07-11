// src/components/MenuManager.tsx
"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { ChevronDown, PlusCircle, Settings, Trash2 } from "lucide-react";
import MenuItemFormModal from "./MenuItemFormModal";

// --- TYPE DEFINITIONS ---
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
};
interface MenuManagerProps {
  initialItems: MenuItem[];
  categories: Category[];
}

// --- MAIN COMPONENT ---
export default function MenuManager({
  initialItems,
  categories,
}: MenuManagerProps) {
  const supabase = createClient();
  const [menuItems, setMenuItems] = useState(initialItems);
  const [menuCategories, setMenuCategories] = useState(categories);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(
    categories[0]?.id ?? null
  );

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Group items by category for easy rendering
  const itemsByCategory = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      const categoryId = item.category_id ?? -1;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(item);
      return acc;
    }, {} as Record<number, MenuItem[]>);
  }, [menuItems]);

  const handleToggleAvailability = async (item: MenuItem) => {
    setUpdatingId(item.id);
    const newStatus = !item.is_available;
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: newStatus })
      .eq("id", item.id);
    if (error) {
      alert(`Error: ${error.message}`);
      // Revert optimistic update on error if needed
    } else {
      setMenuItems((current) =>
        current.map((i) =>
          i.id === item.id ? { ...i, is_available: newStatus } : i
        )
      );
    }
    setUpdatingId(null);
  };

  const handleAddCategory = async () => {
    const name = prompt("Ingrese el nombre de la nueva categoría:");
    if (!name) return;

    const { data, error } = await supabase
      .from("menu_categories")
      .insert({ name })
      .select()
      .single();

    if (error) {
      alert(`Error: ${error.message}`);
    } else if (data) {
      setMenuCategories((current) => [...current, data]);
      alert("¡Categoría agregada!");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (
      !window.confirm("¿Está seguro de que desea eliminar este plato del menú?")
    ) {
      return;
    }

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setMenuItems((current) => current.filter((item) => item.id !== itemId));
      alert("Plato eliminado exitosamente.");
    }
  };

  const handleAddItemClick = (categoryId: number) => {
    setEditingCategory({ id: categoryId, name: "" }); // We just need the ID here
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItemClick = (item: MenuItem) => {
    setEditingItem(item);
    setEditingCategory(null);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (savedItem: MenuItem) => {
    if (editingItem) {
      // We were editing, so replace the old item
      setMenuItems((current) =>
        current.map((item) => (item.id === savedItem.id ? savedItem : item))
      );
    } else {
      // We were adding, so add the new item
      setMenuItems((current) => [...current, savedItem]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión del Menú</h1>
        {/* Add button can go here if needed */}
      </div>

      <div className="space-y-4">
        {menuCategories.map((category) => {
          const items = itemsByCategory[category.id] || [];
          const isOpen = openCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {/* Category Header */}
              <div
                className="flex items-center p-4 cursor-pointer"
                onClick={() => setOpenCategoryId(isOpen ? null : category.id)}
              >
                <ChevronDown
                  size={20}
                  className={`transition-transform mr-3 ${
                    isOpen ? "" : "-rotate-90"
                  }`}
                />
                <h2 className="font-semibold text-lg flex-grow">
                  {category.name}
                </h2>
                <span className="text-gray-500 text-sm mr-4">
                  {items.length} items
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <Settings size={18} />
                </button>
              </div>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="border-t border-gray-200">
                  {items.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-4 p-4"
                        >
                          <div className="flex-grow flex items-center gap-4">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-md bg-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0" />
                            )}
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-gray-500">
                                Bs {item.price?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.is_available}
                                onChange={() => handleToggleAvailability(item)}
                                disabled={updatingId === item.id}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                              <span className="ml-3 text-sm font-medium text-gray-500 w-20">
                                {item.is_available
                                  ? "Available"
                                  : "Unavailable"}
                              </span>
                            </label>
                            <button
                              onClick={() => handleEditItemClick(item)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Settings size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-center text-gray-500">
                      No items in this category yet.
                    </p>
                  )}
                  <div className="p-4 border-t bg-gray-50">
                    <button
                      onClick={() => handleAddItemClick(category.id)}
                      className="w-full text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center justify-center py-2"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Add item to {category.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <button
          onClick={handleAddCategory}
          className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Add menu group
        </button>
      </div>
      <MenuItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        categories={menuCategories}
        itemToEdit={editingItem}
        categoryId={editingCategory?.id ?? null}
      />
    </div>
  );
}

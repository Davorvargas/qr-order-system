// src/components/MenuManager.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { ChevronDown, PlusCircle, Settings, Trash2, Sliders } from "lucide-react";
import MenuItemFormModal from "./MenuItemFormModal";
import ModifierManager from "./ModifierManager";

// --- TYPE DEFINITIONS ---
type Category = { id: number; name: string; is_available: boolean };
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
    categories.length > 0 ? categories[0].id : null
  );

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Estados para el gestor de modificadores
  const [isModifierManagerOpen, setIsModifierManagerOpen] = useState(false);
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<MenuItem | null>(null);
  const [itemsWithModifiers, setItemsWithModifiers] = useState<Set<number>>(new Set());

  // Get current user's restaurant_id
  useEffect(() => {
    const fetchRestaurantId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (profile?.restaurant_id) {
        setRestaurantId(profile.restaurant_id);
        fetchItemsWithModifiers(profile.restaurant_id);
      }
    };

    fetchRestaurantId();
  }, [supabase]);

  // Función para obtener qué productos tienen modificadores
  const fetchItemsWithModifiers = async (restaurantId: string) => {
    try {
      const { data: modifierGroups } = await supabase
        .from('modifier_groups')
        .select('menu_item_id')
        .eq('restaurant_id', restaurantId);

      if (modifierGroups) {
        const itemIds = new Set(modifierGroups.map(group => group.menu_item_id));
        setItemsWithModifiers(itemIds);
      }
    } catch (error) {
      console.error('Error fetching items with modifiers:', error);
    }
  };

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
    if (!restaurantId) {
      alert("Error: No se pudo verificar el restaurante");
      return;
    }

    setUpdatingId(item.id);
    const newStatus = !item.is_available;
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: newStatus })
      .eq("id", item.id)
      .eq("restaurant_id", restaurantId);
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

  const handleToggleCategoryAvailability = async (category: Category) => {
    if (!restaurantId) {
      alert("Error: No se pudo verificar el restaurante");
      return;
    }
    
    const newStatus = !category.is_available;
    const { error } = await supabase
      .from("menu_categories")
      .update({ is_available: newStatus })
      .eq("id", category.id)
      .eq("restaurant_id", restaurantId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setMenuCategories((current) =>
        current.map((c) =>
          c.id === category.id ? { ...c, is_available: newStatus } : c
        )
      );
    }
  };

  const handleAddCategory = async () => {
    if (!restaurantId) {
      alert("Error: No se pudo verificar el restaurante");
      return;
    }

    const name = prompt("Ingrese el nombre de la nueva categoría:");
    if (!name) return;

    const { data, error } = await supabase
      .from("menu_categories")
      .insert({ name, restaurant_id: restaurantId })
      .select()
      .single();

    if (error) {
      alert(`Error: ${error.message}`);
    } else if (data) {
      setMenuCategories((current) => [...current, data]);
      alert("¡Categoría agregada!");
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!restaurantId) {
      alert("Error: No se pudo verificar el restaurante");
      return;
    }

    // Safety check: only allow deleting empty categories
    const itemsInGategory = itemsByCategory[category.id] || [];
    if (itemsInGategory.length > 0) {
      alert(
        `Error: No se puede eliminar la categoría "${category.name}" porque no está vacía. Por favor, elimine primero todos los platos de esta categoría.`
      );
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de que desea eliminar permanentemente la categoría "${category.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", category.id)
      .eq("restaurant_id", restaurantId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setMenuCategories((current) =>
        current.filter((c) => c.id !== category.id)
      );
      alert("Categoría eliminada exitosamente.");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!restaurantId) {
      alert("Error: No se pudo verificar el restaurante");
      return;
    }

    if (
      !window.confirm("¿Está seguro de que desea eliminar este plato del menú?")
    ) {
      return;
    }

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setMenuItems((current) => current.filter((item) => item.id !== itemId));
      alert("Plato eliminado exitosamente.");
    }
  };

  const handleAddItemClick = (categoryId: number) => {
    setEditingCategory({ id: categoryId, name: "", is_available: true }); // We just need the ID here
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

  const handleManageModifiers = (item: MenuItem) => {
    setSelectedItemForModifiers(item);
    setIsModifierManagerOpen(true);
  };

  const handleCloseModifierManager = () => {
    setIsModifierManagerOpen(false);
    setSelectedItemForModifiers(null);
    // Refrescar la lista de productos con modificadores
    if (restaurantId) {
      fetchItemsWithModifiers(restaurantId);
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
                className={`flex items-center p-4 ${
                  !category.is_available ? "bg-gray-100 opacity-70" : ""
                }`}
              >
                <div
                  className="flex items-center flex-grow cursor-pointer"
                  onClick={() => setOpenCategoryId(isOpen ? null : category.id)}
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform mr-3 ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
                  <h2 className="font-semibold text-lg">{category.name}</h2>
                </div>
                <span className="text-gray-500 text-sm mr-4">
                  {items.length} items
                </span>
                <label className="relative inline-flex items-center cursor-pointer mr-4">
                  <input
                    type="checkbox"
                    checked={category.is_available}
                    onChange={() => handleToggleCategoryAvailability(category)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
                <button className="text-gray-400 hover:text-gray-600 mr-2">
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
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
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{item.name}</h3>
                                {itemsWithModifiers.has(item.id) && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    <Sliders size={12} className="mr-1" />
                                    Modificadores
                                  </span>
                                )}
                              </div>
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
                              onClick={() => handleManageModifiers(item)}
                              className="text-gray-400 hover:text-purple-600"
                              title="Gestionar Modificadores"
                            >
                              <Sliders size={18} />
                            </button>
                            <button
                              onClick={() => handleEditItemClick(item)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Editar Producto"
                            >
                              <Settings size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Eliminar Producto"
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
      
      {/* Modal de gestión de modificadores */}
      {selectedItemForModifiers && restaurantId && (
        <ModifierManager
          isOpen={isModifierManagerOpen}
          onClose={handleCloseModifierManager}
          menuItemId={selectedItemForModifiers.id}
          menuItemName={selectedItemForModifiers.name}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
}

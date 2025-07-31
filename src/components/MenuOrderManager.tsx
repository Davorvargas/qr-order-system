"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { GripVertical, ArrowUp, ArrowDown, Save, RotateCcw } from "lucide-react";

interface Category {
  id: number;
  name: string;
  display_order: number | null;
  is_available: boolean | null;
}

interface MenuItem {
  id: number;
  name: string;
  category_id: number | null;
  display_order: number | null;
  price: number | null;
  is_available: boolean;
}

interface MenuOrderManagerProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export default function MenuOrderManager({ categories, menuItems }: MenuOrderManagerProps) {
  const supabase = createClient();
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [orderedItems, setOrderedItems] = useState<{ [categoryId: number]: MenuItem[] }>({});
  const [saving, setSaving] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ categoryId: number; itemId: number } | null>(null);

  useEffect(() => {
    // Sort categories by display_order, putting null values at the end
    const sorted = [...categories].sort((a, b) => {
      if (a.display_order === null && b.display_order === null) return 0;
      if (a.display_order === null) return 1;
      if (b.display_order === null) return -1;
      return a.display_order - b.display_order;
    });
    setOrderedCategories(sorted);

    // Group and sort menu items by category
    const grouped: { [categoryId: number]: MenuItem[] } = {};
    menuItems.forEach(item => {
      const categoryId = item.category_id || -1;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(item);
    });

    // Sort items within each category
    Object.keys(grouped).forEach(categoryId => {
      grouped[parseInt(categoryId)].sort((a, b) => {
        if (a.display_order === null && b.display_order === null) return 0;
        if (a.display_order === null) return 1;
        if (b.display_order === null) return -1;
        return a.display_order - b.display_order;
      });
    });

    setOrderedItems(grouped);
  }, [categories, menuItems]);

  const moveCategoryUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedCategories];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setOrderedCategories(newOrder);
  };

  const moveCategoryDown = (index: number) => {
    if (index === orderedCategories.length - 1) return;
    const newOrder = [...orderedCategories];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderedCategories(newOrder);
  };

  const moveItemUp = (categoryId: number, itemIndex: number) => {
    if (itemIndex === 0) return;
    const newItems = { ...orderedItems };
    const items = [...newItems[categoryId]];
    [items[itemIndex], items[itemIndex - 1]] = [items[itemIndex - 1], items[itemIndex]];
    newItems[categoryId] = items;
    setOrderedItems(newItems);
  };

  const moveItemDown = (categoryId: number, itemIndex: number) => {
    const items = orderedItems[categoryId] || [];
    if (itemIndex === items.length - 1) return;
    const newItems = { ...orderedItems };
    const newItemsArray = [...items];
    [newItemsArray[itemIndex], newItemsArray[itemIndex + 1]] = [newItemsArray[itemIndex + 1], newItemsArray[itemIndex]];
    newItems[categoryId] = newItemsArray;
    setOrderedItems(newItems);
  };

  const resetOrder = () => {
    // Reset to original order (sorted by current display_order)
    const sorted = [...categories].sort((a, b) => {
      if (a.display_order === null && b.display_order === null) return 0;
      if (a.display_order === null) return 1;
      if (b.display_order === null) return -1;
      return a.display_order - b.display_order;
    });
    setOrderedCategories(sorted);

    const grouped: { [categoryId: number]: MenuItem[] } = {};
    menuItems.forEach(item => {
      const categoryId = item.category_id || -1;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(item);
    });

    Object.keys(grouped).forEach(categoryId => {
      grouped[parseInt(categoryId)].sort((a, b) => {
        if (a.display_order === null && b.display_order === null) return 0;
        if (a.display_order === null) return 1;
        if (b.display_order === null) return -1;
        return a.display_order - b.display_order;
      });
    });

    setOrderedItems(grouped);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      // Update category display_order
      const categoryUpdates = orderedCategories.map((category, index) => ({
        id: category.id,
        display_order: index + 1
      }));

      for (const update of categoryUpdates) {
        await supabase
          .from("menu_categories")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }

      // Update menu item display_order
      for (const [, items] of Object.entries(orderedItems)) {
        for (let i = 0; i < items.length; i++) {
          await supabase
            .from("menu_items")
            .update({ display_order: i + 1 })
            .eq("id", items[i].id);
        }
      }

      alert("¡Orden guardado exitosamente!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Error al guardar el orden");
    } finally {
      setSaving(false);
    }
  };

  // Drag and drop handlers for categories
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: number) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleCategoryDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedCategory === null) return;

    const draggedIndex = orderedCategories.findIndex(cat => cat.id === draggedCategory);
    if (draggedIndex === -1) return;

    const newOrder = [...orderedCategories];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setOrderedCategories(newOrder);
    setDraggedCategory(null);
  };

  // Drag and drop handlers for items
  const handleItemDragStart = (e: React.DragEvent, categoryId: number, itemId: number) => {
    setDraggedItem({ categoryId, itemId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleItemDrop = (e: React.DragEvent, targetCategoryId: number, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { categoryId: sourceCategoryId, itemId } = draggedItem;
    
    // Find the dragged item
    const sourceItems = orderedItems[sourceCategoryId] || [];
    const draggedItemIndex = sourceItems.findIndex(item => item.id === itemId);
    if (draggedItemIndex === -1) return;

    const itemToMove = sourceItems[draggedItemIndex];
    
    // Create new items object
    const newItems = { ...orderedItems };
    
    // Remove from source
    newItems[sourceCategoryId] = sourceItems.filter(item => item.id !== itemId);
    
    // Add to target
    if (!newItems[targetCategoryId]) {
      newItems[targetCategoryId] = [];
    }
    
    // Update category_id if moving between categories
    const updatedItem = sourceCategoryId !== targetCategoryId 
      ? { ...itemToMove, category_id: targetCategoryId === -1 ? null : targetCategoryId }
      : itemToMove;
    
    newItems[targetCategoryId].splice(targetIndex, 0, updatedItem);
    
    setOrderedItems(newItems);
    setDraggedItem(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Organizar Orden del Menú
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={resetOrder}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            <span>Restablecer</span>
          </button>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? "Guardando..." : "Guardar Orden"}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Orden de Categorías
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Arrastra las categorías para cambiar su orden, o usa los botones de flecha
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {orderedCategories.map((category, index) => (
            <div key={category.id} className="p-4">
              {/* Category Header */}
              <div
                className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg cursor-move"
                draggable
                onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                onDragOver={handleCategoryDragOver}
                onDrop={(e) => handleCategoryDrop(e, index)}
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="text-gray-400" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(orderedItems[category.id] || []).length} productos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveCategoryUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveCategoryDown(index)}
                    disabled={index === orderedCategories.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>

              {/* Category Items */}
              <div className="ml-8 space-y-2">
                {(orderedItems[category.id] || []).map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:bg-gray-50"
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, category.id, item.id)}
                    onDragOver={handleCategoryDragOver}
                    onDrop={(e) => handleItemDrop(e, category.id, itemIndex)}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="text-gray-400" size={16} />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Bs {(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveItemUp(category.id, itemIndex)}
                        disabled={itemIndex === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveItemDown(category.id, itemIndex)}
                        disabled={itemIndex === (orderedItems[category.id] || []).length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {(orderedItems[category.id] || []).length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No hay productos en esta categoría
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Minus, Trash2, Save, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Order, OrderItem } from "@/app/staff/dashboard/page";
import CustomProductModal from "./CustomProductModal";
import { getItemName } from "@/utils/getItemName";

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface ModifiedOrderItem extends OrderItem {
  isNew?: boolean;
  isDeleted?: boolean;
  originalQuantity?: number;
  isCustom?: boolean;
}

interface CustomProduct {
  name: string;
  price: number;
  notes?: string;
}

interface ModifyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdated: () => void;
}

export default function ModifyOrderModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: ModifyOrderModalProps) {
  const supabase = createClient();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifiedItems, setModifiedItems] = useState<ModifiedOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCustomProductModalOpen, setIsCustomProductModalOpen] = useState(false);
  const [customProductCounter, setCustomProductCounter] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchMenuData();
      // Initialize with current order items
      const initialItems: ModifiedOrderItem[] = order.order_items.map(item => ({
        ...item,
        originalQuantity: item.quantity,
        isCustom: !item.menu_items?.name, // Es personalizado si no tiene menu_items
      }));
      setModifiedItems(initialItems);
    }
  }, [isOpen, order]);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      // Primero obtener el restaurant_id de la orden
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("restaurant_id")
        .eq("id", order.id)
        .single();

      if (orderError) {
        console.error("Error getting restaurant_id:", orderError);
        return;
      }

      const restaurantId = orderData.restaurant_id;

      const [menuResult, categoriesResult] = await Promise.all([
        supabase
          .from("menu_items")
          .select("*")
          .eq("is_available", true)
          .eq("restaurant_id", restaurantId)
          .order("display_order"),
        supabase
          .from("menu_categories")
          .select("*")
          .eq("is_available", true)
          .eq("restaurant_id", restaurantId)
          .order("display_order"),
      ]);

      if (menuResult.data) setMenuItems(menuResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
    } catch (error) {
      console.error("Error fetching menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items for search
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuItems, searchTerm]);

  // Group filtered items by category
  const itemsByCategory = useMemo(() => {
    const grouped: { [key: number]: MenuItem[] } = {};
    filteredMenuItems.forEach(item => {
      if (item.category_id) {
        if (!grouped[item.category_id]) grouped[item.category_id] = [];
        grouped[item.category_id].push(item);
      }
    });
    return grouped;
  }, [filteredMenuItems]);

  // Calculate totals
  const { totalItems, totalPrice, hasChanges } = useMemo(() => {
    const activeItems = modifiedItems.filter(item => !item.isDeleted);
    const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = activeItems.reduce((sum, item) => {
      const price = item.menu_items?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Check if there are changes
    const hasChanges = modifiedItems.some(item => 
      item.isNew || 
      item.isDeleted || 
      item.quantity !== (item.originalQuantity || 0)
    );

    return { totalItems, totalPrice, hasChanges };
  }, [modifiedItems]);

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItemIndex = modifiedItems.findIndex(
      item => item.menu_items?.name === menuItem.name && !item.isDeleted
    );

    if (existingItemIndex >= 0) {
      // Increase quantity of existing item
      const updatedItems = [...modifiedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
      setModifiedItems(updatedItems);
    } else {
      // Add new item
      const newItem: ModifiedOrderItem = {
        id: Date.now(), // Temporary ID for new items
        quantity: 1,
        menu_items: { name: menuItem.name, price: menuItem.price },
        notes: "",
        isNew: true,
        originalQuantity: 0,
      };
      setModifiedItems([...modifiedItems, newItem]);
    }
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...modifiedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
    };
    setModifiedItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...modifiedItems];
    const item = updatedItems[index];

    if (item.isNew) {
      // Remove completely if it's a new item
      updatedItems.splice(index, 1);
    } else {
      // Mark as deleted if it's an existing item
      updatedItems[index] = {
        ...item,
        isDeleted: true,
      };
    }
    setModifiedItems(updatedItems);
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updatedItems = [...modifiedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      notes,
    };
    setModifiedItems(updatedItems);
  };

  const handleAddCustomProduct = (customProduct: CustomProduct) => {
    const customId = -(Date.now() + customProductCounter); // Usar IDs únicos negativos para productos personalizados
    setCustomProductCounter(prev => prev + 1);
    
    const newItem: ModifiedOrderItem = {
      id: customId,
      quantity: 1,
      menu_items: { name: customProduct.name, price: customProduct.price },
      notes: customProduct.notes || "",
      isNew: true,
      isCustom: true,
      originalQuantity: 0,
    };
    setModifiedItems([...modifiedItems, newItem]);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      alert("No hay cambios para guardar");
      return;
    }

    setSaving(true);
    try {
      // Delete removed items
      const itemsToDelete = modifiedItems.filter(item => item.isDeleted && !item.isNew);
      for (const item of itemsToDelete) {
        await supabase
          .from("order_items")
          .delete()
          .eq("id", item.id);
      }

      // Update existing items
      const itemsToUpdate = modifiedItems.filter(
        item => !item.isNew && !item.isDeleted && item.quantity !== item.originalQuantity
      );
      for (const item of itemsToUpdate) {
        await supabase
          .from("order_items")
          .update({ 
            quantity: item.quantity,
            notes: item.notes || null,
          })
          .eq("id", item.id);
      }

      // Add new items
      const itemsToAdd = modifiedItems.filter(item => item.isNew && !item.isDeleted);
      if (itemsToAdd.length > 0) {
        const newOrderItems = itemsToAdd.map(item => {
          if (item.isCustom) {
            // Para productos personalizados, usar un menu_item_id especial (0 o crear uno)
            // y almacenar la información en notes como JSON
            const customInfo = {
              type: 'custom_product',
              name: item.menu_items?.name,
              original_notes: item.notes || ''
            };
            return {
              order_id: order.id,
              menu_item_id: -1, // ID especial para productos personalizados
              quantity: item.quantity,
              price_at_order: item.menu_items?.price,
              notes: JSON.stringify(customInfo),
            };
          } else {
            // Para productos del menú
            const menuItem = menuItems.find(mi => mi.name === item.menu_items?.name);
            return {
              order_id: order.id,
              menu_item_id: menuItem?.id,
              quantity: item.quantity,
              price_at_order: item.menu_items?.price,
              notes: item.notes || null,
            };
          }
        });

        await supabase
          .from("order_items")
          .insert(newOrderItems);
      }

      // Update order total
      const activeItems = modifiedItems.filter(item => !item.isDeleted);
      const newTotal = activeItems.reduce((sum, item) => {
        const price = item.menu_items?.price || 0;
        return sum + (price * item.quantity);
      }, 0);

      await supabase
        .from("orders")
        .update({ total_price: newTotal })
        .eq("id", order.id);

      alert("Pedido modificado exitosamente");
      onOrderUpdated();
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Modificar Pedido #{order.id}
            </h2>
            <p className="text-sm text-gray-600">
              Mesa {order.table?.table_number || order.table_id} • {order.customer_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Menu Items */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos para agregar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsCustomProductModalOpen(true)}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>Agregar Producto Especial</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Cargando menú...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map(category => {
                    const categoryItems = itemsByCategory[category.id] || [];
                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={category.id}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          {category.name}
                        </h3>
                        <div className="grid gap-2">
                          {categoryItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">
                                  Bs {(item.price || 0).toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleAddItem(item)}
                                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Current Order Items */}
          <div className="w-96 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Items del Pedido</h3>
              <p className="text-sm text-gray-600">
                {totalItems} productos • Bs {totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {modifiedItems
                  .filter(item => !item.isDeleted)
                  .map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className={`p-3 border rounded-lg ${
                        item.isNew ? "border-green-200 bg-green-50" : "border-gray-200"
                      } ${
                        item.isCustom ? "border-purple-200 bg-purple-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {getItemName(item)}
                            {item.isNew && (
                              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                Nuevo
                              </span>
                            )}
                            {item.isCustom && (
                              <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                Especial
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Bs {(item.menu_items?.price || 0).toFixed(2)} c/u
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          Bs {((item.menu_items?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <textarea
                        value={item.notes || ""}
                        onChange={(e) => handleUpdateNotes(index, e.target.value)}
                        placeholder="Comentarios..."
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  Bs {totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || saving}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span>{saving ? "Guardando..." : "Guardar"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de producto personalizado */}
      <CustomProductModal
        isOpen={isCustomProductModalOpen}
        onClose={() => setIsCustomProductModalOpen(false)}
        onAdd={handleAddCustomProduct}
      />
    </div>
  );
}
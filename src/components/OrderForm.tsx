"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import FloatingCart from "./FloatingCart";
import OrderSummaryModal from "./OrderSummaryModal";
import MenuItemDetailModal from "./MenuItemDetailModal";
import ProductModalWithModifiers from "./ProductModalWithModifiers";
import FloatingConfirmation from "./FloatingConfirmation";
import { Plus } from "lucide-react"; // Importar el icono Plus
import type { MenuItem } from "@/types/MenuItem";

// --- INTERFACES ---
// (Las interfaces permanecen igual, pero algunas se usarán en el nuevo modal)
interface Category {
  id: number;
  name: string;
}
interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes: string;
  isCustom?: boolean;
  originalItemId?: number;
  selectedModifiers?: Record<string, string[]>;
  modifierDetails?: string;
}
interface OrderState {
  [itemId: string]: OrderItemDetail;
}
interface OrderFormProps {
  categories: Category[];
  items: MenuItem[];
  tableId: string;
}

// --- MAIN COMPONENT ---
export default function OrderForm({
  categories,
  items,
  tableId,
}: OrderFormProps) {
  // --- STATE MANAGEMENT ---
  const router = useRouter();
  const supabase = createClient();
  const [orderItems, setOrderItems] = useState<OrderState>({});
  const [customerName, setCustomerName] = useState("");
  // La nota general ya no es necesaria, se manejará por ítem
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Nuevo estado para el modal de detalle
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Estados para modal de modificadores
  const [selectedItemWithModifiers, setSelectedItemWithModifiers] =
    useState<MenuItem | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  
  // Estado para confirmación flotante
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  
  // Helper para mostrar confirmación
  const showItemAddedConfirmation = (itemName: string, quantity: number = 1) => {
    const message = quantity === 1 
      ? `✓ ${itemName} agregado al carrito`
      : `✓ ${quantity}x ${itemName} agregado al carrito`;
    setConfirmationMessage(message);
    setShowConfirmation(true);
  };

  // --- MEMOS & HELPER FUNCTIONS ---
  const itemsByCategory = useMemo(() => {
    const grouped: { [key: number]: MenuItem[] } = {};
    items.forEach((item) => {
      if (item.category_id) {
        if (!grouped[item.category_id]) grouped[item.category_id] = [];
        grouped[item.category_id].push(item);
      }
    });

    // Items are ordered by their natural order in the database
    // display_order sorting removed as it's not available in MenuItem type

    return grouped;
  }, [items]);

  const totalPrice = useMemo(() => {
    return Object.values(orderItems)
      .filter((item) => item.quantity > 0)
      .reduce((sum, item) => {
        return sum + (item.price ?? 0) * item.quantity;
      }, 0);
  }, [orderItems]);

  // Verificar si un producto tiene modificadores
  const checkHasModifiers = async (item: MenuItem): Promise<boolean> => {
    try {
      // Intentar primero con la API pública
      let response = await fetch(`/api/public-modifiers?menuItemId=${item.id}`);

      // Si falla, intentar con la API privada (para usuarios autenticados)
      if (!response.ok) {
        response = await fetch(`/api/modifiers?menuItemId=${item.id}`);
      }

      if (!response.ok) {
        console.warn(
          "Modifiers API not available, falling back to simple mode"
        );
        return false;
      }

      const result = await response.json();
      return result.success && result.data && result.data.length > 0;
    } catch (error) {
      console.warn(
        "Error checking modifiers, falling back to simple mode:",
        error
      );
      return false;
    }
  };

  const handleItemClick = async (item: MenuItem) => {
    // Verificar si el producto tiene modificadores
    const hasModifiers = await checkHasModifiers(item);

    if (hasModifiers) {
      // Abrir modal de modificadores
      setSelectedItemWithModifiers(item);
      setIsModifierModalOpen(true);
    } else {
      // Abrir modal de detalle legacy
      setSelectedItem(item);
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedItem(null);
  };

  const handleQuickAdd = async (itemToAdd: MenuItem) => {
    // Verificar si el producto tiene modificadores
    const hasModifiers = await checkHasModifiers(itemToAdd);

    if (hasModifiers) {
      // Abrir modal de modificadores
      setSelectedItemWithModifiers(itemToAdd);
      setIsModifierModalOpen(true);
    } else {
      // Agregar directo al carrito
      setOrderItems((prev) => ({
        ...prev,
        [itemToAdd.id.toString()]: {
          quantity: (prev[itemToAdd.id.toString()]?.quantity || 0) + 1,
          name: itemToAdd.name,
          price: itemToAdd.price,
          notes: prev[itemToAdd.id.toString()]?.notes || "", // Preservar notas existentes si se vuelve a añadir
        },
      }));
      
      // Mostrar confirmación
      showItemAddedConfirmation(itemToAdd.name);
    }
  };

  const handleAddToCartFromModal = (
    item: MenuItem,
    quantity: number,
    notes: string
  ) => {
    setOrderItems((prev) => ({
      ...prev,
      [item.id.toString()]: {
        quantity: (prev[item.id.toString()]?.quantity || 0) + quantity,
        name: item.name,
        price: item.price,
        // Concatenamos las notas si el ítem ya estaba en el carrito
        notes: prev[item.id.toString()]?.notes
          ? `${prev[item.id.toString()].notes}; ${notes}`
          : notes,
      },
    }));
    
    // Mostrar confirmación
    showItemAddedConfirmation(item.name, quantity);
  };

  // Handler para productos con modificadores
  const handleAddToCartWithModifiers = (
    item: MenuItem,
    quantity: number,
    notes: string,
    selectedModifiers: Record<string, string[]>,
    totalPrice: number,
    existingItemId?: number
  ) => {
    // Crear un ID único para este item con modificadores
    const modifierHash = JSON.stringify(selectedModifiers);
    const uniqueId = `${item.id}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    console.log("🔍 OrderForm: Adding item with modifiers:", {
      itemId: item.id,
      uniqueId,
      selectedModifiers,
      notes,
      totalPrice,
    });

    setOrderItems((prev) => ({
      ...prev,
      [uniqueId]: {
        quantity: quantity,
        name: item.name,
        price: totalPrice / quantity, // Precio unitario con modificadores
        notes: notes,
        isCustom: false,
        originalItemId: item.id,
        selectedModifiers: selectedModifiers,
        modifierDetails: modifierHash,
      },
    }));
    
    // Mostrar confirmación
    showItemAddedConfirmation(item.name, quantity);
  };

  const handleUpdateQuantity = (
    itemId: string | number,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setOrderItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId as string], quantity: newQuantity },
      }));
    }
  };

  const handleRemoveItem = (itemId: string | number) => {
    setOrderItems((prev) => {
      const newOrder = { ...prev };
      delete newOrder[itemId as string];
      return newOrder;
    });
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setSubmitError(null);

    const payload = {
      table_id: tableId,
      customer_name: customerName.trim(),
      total_price: totalPrice,
      notes, // Usar la nota global real
      order_items: Object.entries(orderItems)
        .filter(([itemId, details]) => details.quantity > 0)
        .map(([itemId, details]) => {
          console.log(`🔍 OrderForm: Processing item ${itemId}:`, {
            name: details.name,
            hasSelectedModifiers: !!details.selectedModifiers,
            selectedModifiers: details.selectedModifiers,
            isStringId: typeof itemId === "string",
            notes: details.notes,
          });

          // Handle items with modifiers (these have string IDs)
          if (typeof itemId === "string" && itemId.includes("_")) {
            return {
              menu_item_id: parseInt(itemId.split("_")[0], 10),
              quantity: details.quantity,
              price_at_order: details.price,
              notes: details.selectedModifiers
                ? JSON.stringify({
                    selectedModifiers: details.selectedModifiers,
                    original_notes: details.notes.trim() || "",
                  })
                : details.notes,
            };
          }
          // Handle regular items
          return {
            menu_item_id: parseInt(itemId, 10),
            quantity: details.quantity,
            price_at_order: details.price,
            notes: details.notes,
          };
        }),
    };

    console.log(
      "🚀 OrderForm: Sending order payload:",
      JSON.stringify(payload, null, 2)
    );

    try {
      console.log("🔍 Attempting to call public API route...");
      // Try the public API route first (for unauthenticated users)
      const response = await fetch("/api/place-order-public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📡 Public API response:", {
        status: response.status,
        result,
      });

      if (!response.ok) {
        console.log("⚠️ Public API failed, trying authenticated function...");
        // Fallback to authenticated function if public fails
        const { data: authData, error: authError } =
          await supabase.functions.invoke("place-order", {
            body: payload,
          });

        console.log("📡 Authenticated function response:", {
          authData,
          authError,
        });

        if (authError) {
          setSubmitError(authError.message);
        } else {
          router.push(`/order/confirmation/${authData.order_id}`);
        }
      } else {
        console.log("✅ Public API succeeded!");
        router.push(`/order/confirmation/${result.order_id}`);
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      setSubmitError(
        "Error al enviar el pedido. Por favor, inténtalo de nuevo."
      );
    }

    setIsLoading(false);
  };
  // --- END FUNCTIONS ---

  // --- JSX TO RENDER ---
  return (
    <div className="w-full max-w-4xl mx-auto pb-32">
      {" "}
      {/* Added padding-bottom for FloatingCart */}
      {submitError && (
        <div className="p-4 mb-4 text-center text-red-700 bg-red-100 rounded-lg">
          <p className="font-bold">Error al realizar el pedido:</p>
          <p>{submitError}</p>
        </div>
      )}
      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`}>
            <h2 className="text-2xl font-semibold mb-4 tracking-tight text-gray-800">
              {category.name}
            </h2>
            <div className="flex flex-col">
              {(itemsByCategory[category.id] || []).map((item) => (
                <div key={item.id} className="bg-white border-b relative">
                  {item.image_url ? (
                    // --- CON IMAGEN ---
                    <div
                      className={`flex gap-4 p-4 ${
                        !item.is_available ? "opacity-40 bg-gray-50" : ""
                      } ${
                        item.is_available
                          ? "cursor-pointer hover:bg-gray-50"
                          : "cursor-not-allowed"
                      }`}
                      onClick={() => item.is_available && handleItemClick(item)}
                    >
                      <div className="flex-grow">
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.name}
                          {!item.is_available && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                              No disponible
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm my-1 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-2">
                          Bs {(item.price ?? 0).toFixed(2)}
                        </p>
                        {!item.is_available && (
                          <p className="text-xs text-red-500 mt-1">
                            Temporalmente agotado
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-28 h-28 relative">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          layout="fill"
                          className="object-cover rounded-md"
                          unoptimized
                        />
                      </div>
                    </div>
                  ) : (
                    // --- SIN IMAGEN ---
                    <div
                      className={`flex items-center gap-4 p-4 ${
                        !item.is_available ? "opacity-40 bg-gray-50" : ""
                      } ${
                        item.is_available
                          ? "cursor-pointer hover:bg-gray-50"
                          : "cursor-not-allowed"
                      }`}
                      onClick={() => item.is_available && handleItemClick(item)}
                    >
                      <div className="flex-grow">
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.name}
                          {!item.is_available && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                              No disponible
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm my-1 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-2">
                          Bs {(item.price ?? 0).toFixed(2)}
                        </p>
                        {!item.is_available && (
                          <p className="text-xs text-red-500 mt-1">
                            Temporalmente agotado
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(item);
                          }}
                          disabled={!item.is_available}
                          className="w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center hover:bg-gray-200 disabled:bg-gray-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {/* Modals */}
      <FloatingCart
        orderItems={orderItems}
        onClick={() => setIsSummaryModalOpen(true)}
      />
      <OrderSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        orderItems={orderItems}
        totalPrice={totalPrice}
        customerName={customerName}
        setCustomerName={setCustomerName}
        notes={notes}
        setNotes={setNotes}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmit={handlePlaceOrder}
        isLoading={isLoading}
      />
      <MenuItemDetailModal
        isOpen={selectedItem !== null}
        onClose={handleCloseDetailModal}
        item={selectedItem}
        onAddToCart={handleAddToCartFromModal}
      />
      {/* Modal de producto con modificadores */}
      <ProductModalWithModifiers
        isOpen={isModifierModalOpen}
        onClose={() => {
          setIsModifierModalOpen(false);
          setSelectedItemWithModifiers(null);
        }}
        item={selectedItemWithModifiers}
        onAddToCart={handleAddToCartWithModifiers}
      />
      
      {/* Confirmación flotante */}
      <FloatingConfirmation
        isVisible={showConfirmation}
        message={confirmationMessage}
        onClose={() => setShowConfirmation(false)}
        type="success"
        duration={2500}
      />
    </div>
  );
}

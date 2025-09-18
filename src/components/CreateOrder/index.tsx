"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import SearchBar from "./SearchBar";
import ProductGrid from "./ProductGrid";
import OrderPanel from "./OrderPanel";
import MenuItemDetailModalWithNotes from "../MenuItemDetailModalWithNotes";
import CustomProductModal from "../CustomProductModal";
import ProductModalWithModifiers from "../ProductModalWithModifiers";
import FloatingConfirmation from "../FloatingConfirmation";
import type { MenuItem } from "@/types/MenuItem";

interface Category {
  id: number;
  name: string;
}

interface Table {
  id: string;
  table_number: string;
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

interface CustomProduct {
  name: string;
  price: number;
  notes?: string;
}

interface CreateOrderProps {
  categories: Category[];
  items: MenuItem[];
}

export default function CreateOrder({ categories, items }: CreateOrderProps) {
  const supabase = createClient();

  // Estados principales
  const [orderItems, setOrderItems] = useState<OrderState>({});
  const [customerName, setCustomerName] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal de detalle de producto (legacy)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Modal de producto con modificadores (nuevo)
  const [selectedItemWithModifiers, setSelectedItemWithModifiers] =
    useState<MenuItem | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);

  // Estado para confirmación flotante
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] = useState<
    "success" | "info" | "warning"
  >("success");

  // Helper para mostrar confirmación de items agregados
  const showItemAddedConfirmation = (
    itemName: string,
    quantity: number = 1
  ) => {
    const message =
      quantity === 1
        ? `✓ ${itemName} agregado al carrito`
        : `✓ ${quantity}x ${itemName} agregado al carrito`;
    setConfirmationMessage(message);
    setConfirmationType("success");
    setShowConfirmation(true);
  };

  // Helper para mostrar confirmación de orden enviada
  const showOrderSentConfirmation = (
    customerName: string,
    tableNumber?: string
  ) => {
    const message = tableNumber
      ? `✅ Orden para ${customerName} (Mesa ${tableNumber}) enviada exitosamente`
      : `✅ Orden para ${customerName} enviada exitosamente`;
    setConfirmationMessage(message);
    setConfirmationType("success");
    setShowConfirmation(true);
  };

  // Modal de producto personalizado
  const [isCustomProductModalOpen, setIsCustomProductModalOpen] =
    useState(false);
  const [customProductCounter, setCustomProductCounter] = useState(1);

  // Default table ID para pedidos desde staff (puedes ajustar esto según tu lógica)
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        // Get current user's restaurant_id first
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error(
            "Authentication error:",
            authError?.message || "No user found"
          );
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("restaurant_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError.message);
          return;
        }

        if (!profile?.restaurant_id) {
          console.error("No restaurant_id found for user");
          return;
        }

        // Fetch tables only for this restaurant
        const { data: tables, error: tablesError } = await supabase
          .from("tables")
          .select("id, table_number")
          .eq("restaurant_id", profile.restaurant_id);

        if (tablesError) {
          console.error("Error fetching tables:", tablesError.message);
        } else {
          // Sort tables numerically by table_number
          const sortedTables = (tables || []).sort((a, b) => {
            const numA = parseInt(a.table_number, 10);
            const numB = parseInt(b.table_number, 10);
            return numA - numB;
          });

          setAvailableTables(sortedTables);
          // Set first table as default
          if (sortedTables.length > 0) {
            setSelectedTableId(sortedTables[0].id);
          }
        }
      } catch (error) {
        console.error("Unexpected error in fetchTables:", error);
      }
    };

    fetchTables();
  }, []);

  // Get selected table number
  const selectedTable = availableTables.find(
    (table) => table.id === selectedTableId
  );
  const selectedTableNumber = selectedTable?.table_number;

  // Verificar si un producto tiene modificadores
  const checkHasModifiers = async (item: MenuItem): Promise<boolean> => {
    try {
      const response = await fetch(`/api/modifiers?menuItemId=${item.id}`);

      if (!response.ok) {
        console.warn(
          "Modifiers API not available, falling back to simple mode"
        );
        return false;
      }

      // Verificar que la respuesta sea JSON válida
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("API response is not JSON, falling back to simple mode");
        return false;
      }

      const result = await response.json();
      return result.success && result.data && result.data.length > 0;
    } catch (error) {
      console.error("Error checking modifiers:", error);
      return false;
    }
  };

  // Handlers para productos
  const handleAddItem = async (item: MenuItem) => {
    // Verificar si el producto tiene modificadores
    const hasModifiers = await checkHasModifiers(item);

    if (hasModifiers) {
      // Buscar si ya existe un item con este producto en el carrito
      const foundItemId = Object.keys(orderItems).find((key) => {
        const existingItem = orderItems[parseInt(key)];
        return (
          existingItem &&
          (existingItem.originalItemId === item.id || parseInt(key) === item.id)
        );
      });

      if (foundItemId) {
        // Si existe, abrir el modal con los datos existentes para editar
        const existingItem = orderItems[parseInt(foundItemId)];
        setSelectedItemWithModifiers(item);
        // Store existing item data separately if needed
        // TODO: Handle existing item data properly
      } else {
        // Si no existe, abrir modal para crear nuevo
        setSelectedItemWithModifiers(item);
      }
      setIsModifierModalOpen(true);
    } else {
      // Agregar directo al carrito (comportamiento actual)
      setOrderItems((prev) => ({
        ...prev,
        [item.id.toString()]: {
          quantity: (prev[item.id.toString()]?.quantity || 0) + 1,
          name: item.name,
          price: item.price || 0,
          notes: prev[item.id.toString()]?.notes || "",
          isCustom: false,
        },
      }));

      // Mostrar confirmación
      showItemAddedConfirmation(item.name);
    }
  };

  // Handler para productos personalizados
  const handleAddCustomProduct = (customProduct: CustomProduct) => {
    const customId = (-customProductCounter).toString(); // Usar IDs negativos para productos personalizados
    setCustomProductCounter((prev) => prev + 1);

    setOrderItems((prev) => ({
      ...prev,
      [customId]: {
        quantity: 1,
        name: customProduct.name,
        price: customProduct.price || 0,
        notes: customProduct.notes || "",
        isCustom: true,
      },
    }));

    // Mostrar confirmación
    showItemAddedConfirmation(customProduct.name);
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

  // Handler para productos con modificadores
  const handleAddToCartWithModifiers = (
    item: MenuItem,
    quantity: number,
    notes: string,
    selectedModifiers: Record<string, string[]>,
    totalPrice: number,
    existingItemId?: number
  ) => {
    // Crear un hash para identificar combinaciones únicas de modificadores
    const modifierHash = JSON.stringify(selectedModifiers);

    setOrderItems((prev) => {
      // Si se está editando un item existente
      if (existingItemId && prev[existingItemId]) {
        return {
          ...prev,
          [existingItemId]: {
            ...prev[existingItemId],
            quantity: quantity,
            price: totalPrice / quantity,
            notes: notes,
            selectedModifiers: selectedModifiers,
            modifierDetails: modifierHash,
          },
        };
      }

      // Buscar si ya existe un item con el mismo producto y modificadores
      const existingItemKey = Object.keys(prev).find((key) => {
        const existingItem = prev[parseInt(key)];
        return (
          existingItem &&
          existingItem.originalItemId === item.id &&
          existingItem.modifierDetails === modifierHash &&
          existingItem.notes === notes
        );
      });

      if (existingItemKey) {
        // Si existe, incrementar la cantidad
        const existingItem = prev[parseInt(existingItemKey)];
        return {
          ...prev,
          [existingItemKey]: {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
          },
        };
      } else {
        // Si no existe, crear uno nuevo
        const uniqueId = `${item.id}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        return {
          ...prev,
          [uniqueId]: {
            quantity: quantity,
            name: item.name,
            price: totalPrice / quantity, // Precio unitario con modificadores
            notes: notes,
            isCustom: false,
            originalItemId: item.id,
            selectedModifiers: selectedModifiers,
            modifierDetails: modifierHash, // Para identificar combinaciones únicas
          },
        };
      }
    });

    // Mostrar confirmación
    showItemAddedConfirmation(item.name, quantity);
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
        price: item.price || 0,
        notes: prev[item.id.toString()]?.notes
          ? `${prev[item.id.toString()].notes}; ${notes}`
          : notes,
        isCustom: false,
      },
    }));

    // Mostrar confirmación
    showItemAddedConfirmation(item.name, quantity);
  };

  // Handlers para el carrito
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

  const handleUpdateItemNotes = (itemId: string | number, notes: string) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId as string], notes },
    }));
  };

  // Calcular total
  const totalPrice = useMemo(() => {
    return Object.values(orderItems)
      .filter((item) => item.quantity > 0)
      .reduce((sum, item) => {
        return sum + (item.price ?? 0) * item.quantity;
      }, 0);
  }, [orderItems]);

  // Confirmar pedido
  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      setSubmitError("El nombre del cliente es requerido");
      return;
    }

    if (!selectedTableId) {
      setSubmitError("Debe seleccionar una mesa para el pedido");
      return;
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log(
      "Auth check - User:",
      user ? "Valid" : "Invalid",
      "Error:",
      authError
    );

    if (authError || !user) {
      setSubmitError(
        "Debes estar autenticado para crear pedidos. Por favor inicia sesión."
      );
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    const payload = {
      table_id: selectedTableId,
      customer_name: customerName.trim(),
      total_price: totalPrice,
      notes: generalNotes.trim() || null,
      source: "staff_placed" as const,
      order_items: Object.entries(orderItems).map(([itemId, details]) => {
        console.log(`🔍 Processing item ${itemId}:`, {
          name: details.name,
          hasSelectedModifiers: !!details.selectedModifiers,
          selectedModifiers: details.selectedModifiers,
          isCustom: details.isCustom,
          notes: details.notes,
        });

        // Enhanced validation for custom products
        const isCustomProduct = details.isCustom === true;
        const hasModifiers =
          details.selectedModifiers &&
          Object.keys(details.selectedModifiers).length > 0;

        let notes = null;
        let menu_item_id = null;

        if (isCustomProduct) {
          // Custom product: always null menu_item_id with proper JSON notes
          menu_item_id = null;
          notes = JSON.stringify({
            type: "custom_product",
            name: details.name || "Producto Especial",
            original_notes: details.notes?.trim() || "",
          });
          console.log(
            `✅ Custom product: ${details.name} with proper JSON notes`
          );
        } else {
          // Regular product
          menu_item_id = details.originalItemId || parseInt(itemId, 10);

          if (hasModifiers) {
            notes = JSON.stringify({
              selectedModifiers: details.selectedModifiers,
              original_notes: details.notes?.trim() || "",
            });
          } else {
            notes = details.notes?.trim() || null;
          }
        }

        // Final validation: if menu_item_id is null, ensure we have proper custom product notes
        if (
          menu_item_id === null &&
          (!notes || !notes.includes('"type":"custom_product"'))
        ) {
          console.warn(
            `⚠️ CRITICAL: Item ${itemId} has null menu_item_id but no custom product notes! Fixing...`
          );
          notes = JSON.stringify({
            type: "custom_product",
            name: details.name || "Producto Especial",
            original_notes:
              details.notes?.trim() || "Producto sin nombre definido",
          });
        }

        return {
          menu_item_id,
          quantity: details.quantity,
          price_at_order: details.price,
          notes,
        };
      }),
    };

    try {
      console.log(
        "🚀 Sending order payload:",
        JSON.stringify(payload, null, 2)
      );

      // Check if any items have modifiers
      const itemsWithModifiers = payload.order_items.filter(
        (item) => item.notes && item.notes.includes("selectedModifiers")
      );
      console.log(
        `🔍 Items with modifiers in payload: ${itemsWithModifiers.length}`
      );
      if (itemsWithModifiers.length > 0) {
        console.log(
          "🔍 Modifier items details:",
          itemsWithModifiers.map((item) => ({
            menu_item_id: item.menu_item_id,
            notes: item.notes,
          }))
        );
      }

      // Get the current session to ensure we have a valid token
      const { data: sessionData } = await supabase.auth.getSession();
      console.log(
        "Current session:",
        sessionData.session ? "Valid" : "Invalid"
      );
      console.log(
        "Access token present:",
        sessionData.session?.access_token ? "Yes" : "No"
      );

      let data, error;
      try {
        const response = await supabase.functions.invoke("place-order", {
          body: payload,
        });
        data = response.data;
        error = response.error;
      } catch (invokeError) {
        console.error("Function invoke failed:", invokeError);

        // Try to get the actual response if available
        const error = invokeError as any;
        if (error.response) {
          try {
            const errorText = await error.response.text();
            console.error("Error response body:", errorText);
            const errorData = JSON.parse(errorText);
            const errorMessage = errorData.error || error.message;
            console.error("Parsed error message:", errorMessage);
            setSubmitError(`Error del servidor: ${errorMessage}`);
            if (errorData.details) {
              console.error("Detailed error:", errorData.details);
            }
          } catch (parseError) {
            console.error("Could not parse error response:", parseError);
            setSubmitError(`Error del servidor: ${error.message}`);
          }
        } else {
          // Try to extract error message from the FunctionsHttpError
          let errorMessage = error.message;
          if (error.context) {
            try {
              const context = JSON.parse(error.context);
              if (context.error) {
                errorMessage = context.error;
              }
            } catch (e) {
              console.error("Could not parse error context:", e);
            }
          }
          setSubmitError(`Error del servidor: ${errorMessage}`);
        }
        setIsLoading(false);
        return;
      }

      console.log("Edge Function response:", { data, error });

      if (error) {
        console.error("Edge Function error:", error);
        setSubmitError(
          `Error del servidor: ${error.message || "Error desconocido"}`
        );
      } else {
        // Mostrar mensaje de éxito
        console.log("✅ Orden enviada exitosamente");

        // Mostrar confirmación flotante
        showOrderSentConfirmation(customerName, selectedTableNumber);

        // Limpiar formulario
        setOrderItems({});
        setCustomerName("");
        setGeneralNotes("");
        setSearchTerm("");

        // Limpiar errores previos
        setSubmitError("");
      }
    } catch (error) {
      console.error("Catch block error:", error);

      // Try to extract more information from the error
      let errorMessage = "Error desconocido";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check if there's additional context in the error
        if ("context" in error && error.context) {
          console.error("Error context:", error.context);
        }

        // Check for response body in fetch errors
        if ("cause" in error && error.cause) {
          console.error("Error cause:", error.cause);
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        console.error("Error object keys:", Object.keys(error));
        errorMessage = JSON.stringify(error);
      }

      setSubmitError(`Error: ${errorMessage}`);
    }

    setIsLoading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter para confirmar pedido (solo si hay items)
      if (
        e.key === "Enter" &&
        e.ctrlKey &&
        Object.keys(orderItems).length > 0
      ) {
        e.preventDefault();
        handleConfirmOrder();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [orderItems, handleConfirmOrder]);

  return (
    <div className="h-full flex bg-gray-100">
      {/* Panel central - Productos */}
      <div className="flex-1 flex flex-col mr-96">
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Nuevo Pedido</h1>
              {selectedTableNumber && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  Mesa {selectedTableNumber}
                </span>
              )}
              <button
                onClick={() => setIsCustomProductModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Producto Especial</span>
              </button>
            </div>
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {submitError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{submitError}</p>
            </div>
          )}

          <ProductGrid
            categories={categories}
            items={items}
            searchTerm={searchTerm}
            onAddItem={handleAddItem}
            onItemClick={handleItemClick}
          />
        </div>
      </div>

      {/* Panel derecho fijo - Resumen del pedido */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 h-full z-40">
        <OrderPanel
          orderItems={orderItems}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          generalNotes={generalNotes}
          onGeneralNotesChange={setGeneralNotes}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onUpdateItemNotes={handleUpdateItemNotes}
          onConfirmOrder={handleConfirmOrder}
          isLoading={isLoading}
          selectedTableNumber={selectedTableNumber}
          availableTables={availableTables}
          selectedTableId={selectedTableId}
          onTableChange={setSelectedTableId}
        />
      </div>

      {/* Modal de detalle */}
      {selectedItem && (
        <MenuItemDetailModalWithNotes
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCartFromModal}
          primaryColor="#1e3a8a"
        />
      )}

      {/* Modal de producto personalizado */}
      <CustomProductModal
        isOpen={isCustomProductModalOpen}
        onClose={() => setIsCustomProductModalOpen(false)}
        onAdd={handleAddCustomProduct}
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
        type={confirmationType}
        duration={3000}
      />
    </div>
  );
}

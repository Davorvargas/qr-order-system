"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import SearchBar from "./SearchBar";
import ProductGrid from "./ProductGrid";
import OrderPanel from "./OrderPanel";
import MenuItemDetailModal from "../MenuItemDetailModal";
import CustomProductModal from "../CustomProductModal";
import type { MenuItem } from "@/types/MenuItem";

interface Category {
  id: number;
  name: string;
}

interface Table {
  id: string;
  table_number: number;
}

interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes: string;
  isCustom?: boolean;
}

interface OrderState {
  [itemId: number]: OrderItemDetail;
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

  // Modal de detalle de producto
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Modal de producto personalizado
  const [isCustomProductModalOpen, setIsCustomProductModalOpen] = useState(false);
  const [customProductCounter, setCustomProductCounter] = useState(1);

  // Default table ID para pedidos desde staff (puedes ajustar esto según tu lógica)
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  // Fetch available tables
  useEffect(() => {
    const fetchTables = async () => {
      const { data: tables, error } = await supabase
        .from('tables')
        .select('id, table_number')
        .order('table_number');
      
      if (error) {
        console.error('Error fetching tables:', error);
      } else {
        setAvailableTables(tables || []);
        // Set first table as default
        if (tables && tables.length > 0) {
          setSelectedTableId(tables[0].id);
        }
      }
    };
    
    fetchTables();
  }, []);

  // Get selected table number
  const selectedTable = availableTables.find(table => table.id === selectedTableId);
  const selectedTableNumber = selectedTable?.table_number;

  // Handlers para productos
  const handleAddItem = (item: MenuItem) => {
    setOrderItems((prev) => ({
      ...prev,
      [item.id]: {
        quantity: (prev[item.id]?.quantity || 0) + 1,
        name: item.name,
        price: item.price,
        notes: prev[item.id]?.notes || "",
        isCustom: false,
      },
    }));
  };

  // Handler para productos personalizados
  const handleAddCustomProduct = (customProduct: CustomProduct) => {
    const customId = -customProductCounter; // Usar IDs negativos para productos personalizados
    setCustomProductCounter(prev => prev + 1);
    
    setOrderItems((prev) => ({
      ...prev,
      [customId]: {
        quantity: 1,
        name: customProduct.name,
        price: customProduct.price,
        notes: customProduct.notes || "",
        isCustom: true,
      },
    }));
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleAddToCartFromModal = (
    item: MenuItem,
    quantity: number,
    notes: string
  ) => {
    setOrderItems((prev) => ({
      ...prev,
      [item.id]: {
        quantity: (prev[item.id]?.quantity || 0) + quantity,
        name: item.name,
        price: item.price,
        notes: prev[item.id]?.notes
          ? `${prev[item.id].notes}; ${notes}`
          : notes,
        isCustom: false,
      },
    }));
  };

  // Handlers para el carrito
  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setOrderItems((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], quantity: newQuantity },
      }));
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems((prev) => {
      const newOrder = { ...prev };
      delete newOrder[itemId];
      return newOrder;
    });
  };

  const handleUpdateItemNotes = (itemId: number, notes: string) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes },
    }));
  };

  // Calcular total
  const totalPrice = useMemo(() => {
    return Object.values(orderItems).reduce((sum, item) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check - User:', user ? 'Valid' : 'Invalid', 'Error:', authError);
    
    if (authError || !user) {
      setSubmitError("Debes estar autenticado para crear pedidos. Por favor inicia sesión.");
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    const payload = {
      table_id: selectedTableId,
      customer_name: customerName.trim(),
      total_price: totalPrice,
      notes: generalNotes.trim() || null,
      source: 'staff_placed' as const,
      order_items: Object.entries(orderItems).map(([itemId, details]) => ({
        menu_item_id: details.isCustom ? null : parseInt(itemId, 10),
        quantity: details.quantity,
        price_at_order: details.price,
        notes: details.isCustom ? JSON.stringify({ type: "custom_product", name: details.name, original_notes: details.notes.trim() || "" }) : details.notes.trim() || null,
      })),
    };

    try {
      console.log('Sending order payload:', JSON.stringify(payload, null, 2));
      
      // Get the current session to ensure we have a valid token
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData.session ? 'Valid' : 'Invalid');
      console.log('Access token present:', sessionData.session?.access_token ? 'Yes' : 'No');
      
      const { data, error } = await supabase.functions.invoke("place-order", {
        body: payload,
      });

      console.log('Edge Function response:', { data, error });

      if (error) {
        console.error('Edge Function error:', error);
        setSubmitError(`Error del servidor: ${error.message || 'Error desconocido'}`);
      } else {
        // Mostrar mensaje de éxito simple
        alert("¡Orden enviada!");
        
        // Limpiar formulario
        setOrderItems({});
        setCustomerName("");
        setGeneralNotes("");
        setSearchTerm("");
      }
    } catch (error) {
      console.error('Catch block error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : "Error desconocido";
      setSubmitError(`Error: ${errorMessage}`);
    }

    setIsLoading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter para confirmar pedido (solo si hay items)
      if (e.key === 'Enter' && e.ctrlKey && Object.keys(orderItems).length > 0) {
        e.preventDefault();
        handleConfirmOrder();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
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
      <MenuItemDetailModal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onAddToCart={handleAddToCartFromModal}
      />
      
      {/* Modal de producto personalizado */}
      <CustomProductModal
        isOpen={isCustomProductModalOpen}
        onClose={() => setIsCustomProductModalOpen(false)}
        onAdd={handleAddCustomProduct}
      />
    </div>
  );
}
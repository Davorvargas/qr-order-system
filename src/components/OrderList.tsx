// src/components/OrderList.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Menu } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/app/staff/dashboard/page";
import { Database } from "@/lib/database.types";
import ConfirmCompletionModal from "./ConfirmCompletionModal";
import ConfirmCancelModal from "./ConfirmCancelModal";
import PaymentMethodModal from "./PaymentMethodModal";
import ModifyOrderModal from "./ModifyOrderModal";
import MergeOrdersModal from "./MergeOrdersModal";
import SortableOrderCard from "./SortableOrderCard";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Clock,
  Printer,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertCircle,
  CookingPot,
  GlassWater,
  Receipt,
  Edit,
  Volume2,
  VolumeX,
  Move,
} from "lucide-react";
import { formatModifierNotes } from "../utils/formatModifiers";
import { getItemName } from "../utils/getItemName";

// Nota: Audio notification hook movido a GlobalNotificationService

type Printer = Database["public"]["Tables"]["printers"]["Row"];

type OrderWorkflowStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

const STATUS_TABS: { key: OrderWorkflowStatus; label: string }[] = [
  { key: "pending", label: "Pendientes" },
  { key: "in_progress", label: "En Preparación" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
];

const ITEMS_BEFORE_TRUNCATE = 4;

function formatTimeAgo(dateString: string, now: Date) {
  const date = new Date(dateString);
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.round(minutes / 60);
  return `${hours}h atrás`;
}

const getTimeAgoColor = (dateString: string, now: Date): string => {
  const date = new Date(dateString);
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes >= 25) return "text-red-600 font-semibold";
  if (minutes >= 15) return "text-yellow-600 font-semibold";
  return "text-gray-500";
};

// Componente para mostrar el estado de una impresora
const PrintStatusIndicator = ({
  label,
  printed,
  icon,
}: {
  label: string;
  printed: boolean;
  icon: React.ReactNode;
}) => (
  <div
    className={`flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded border ${
      printed
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-yellow-50 border-yellow-200 text-yellow-800"
    }`}
  >
    <span>{label}</span>
    <span className="font-semibold">{printed ? "✓" : "⏳"}</span>
  </div>
);

// Componente para los botones de reimpresión
const ReprintButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors basis-0"
  >
    <Printer size={16} />
    {label}
  </button>
);

export default function OrderList({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const supabase = createClient();

  // Configurar sensores de drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  // Nota: audioNotifications ahora está en GlobalNotificationService
  const [activeStatus, setActiveStatus] =
    useState<OrderWorkflowStatus>("pending");
  const [expandedCardIds, setExpandedCardIds] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Cargar configuración de sonido desde localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("orderSoundEnabled");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Estados para drag and drop
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [sourceOrders, setSourceOrders] = useState<Order[]>([]);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);

  // Nuevo estado para impresoras activas
  const [activePrinters, setActivePrinters] = useState<Printer[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Obtener restaurant_id y impresoras activas
  useEffect(() => {
    const fetchRestaurantAndPrinters = async () => {
      try {
        // Get restaurant_id from current user's profile instead of orders
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("restaurant_id")
          .eq("id", user.id)
          .single();

        if (profile?.restaurant_id) {
          setRestaurantId(profile.restaurant_id);

          // Obtener impresoras activas
          const { data: printers } = await supabase
            .from("printers")
            .select("*")
            .eq("restaurant_id", profile.restaurant_id)
            .eq("is_active", true)
            .order("type");

          setActivePrinters(printers || []);
        }
      } catch (error) {
        console.error("Error fetching restaurant and printers:", error);
      }
    };

    fetchRestaurantAndPrinters();
  }, [supabase]);

  // Función para obtener el icono según el tipo de impresora
  const getPrinterIcon = (type: string) => {
    switch (type) {
      case "kitchen":
        return <CookingPot size={16} />;
      case "drink":
        return <GlassWater size={16} />;
      case "receipt":
        return <Receipt size={16} />;
      default:
        return <Printer size={16} />;
    }
  };

  // Función para obtener el label según el tipo de impresora
  const getPrinterLabel = (type: string) => {
    switch (type) {
      case "kitchen":
        return "Cocina";
      case "drink":
        return "Bar";
      case "receipt":
        return "Recibo";
      default:
        return type;
    }
  };

  // Función para verificar si la orden está lista para pasar a "En Preparación"
  const isOrderReadyForProgress = useCallback(
    (order: Order) => {
      // Si no hay impresoras activas, todas las órdenes van directo a "En Preparación"
      if (activePrinters.length === 0) {
        return true;
      }
      // Si hay impresoras pero la orden no tiene el campo kitchen_printed definido,
      // asumir que NO está impresa (para que aparezca en Pendientes)
      if (
        order.kitchen_printed === undefined ||
        order.kitchen_printed === null
      ) {
        return false;
      }
      // Solo verificar que el ticket de cocina esté impreso
      return order.kitchen_printed;
    },
    [activePrinters.length]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Guardar configuración de sonido en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("orderSoundEnabled", JSON.stringify(soundEnabled));
    }
  }, [soundEnabled]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Get current user's restaurant_id to filter real-time updates
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("restaurant_id")
            .eq("id", user.id)
            .single();

          if (!profile?.restaurant_id) return;

          const { data: newOrderDetails } = await supabase
            .from("orders")
            .select(
              `
              *, 
              notes, 
              table:tables(table_number), 
              order_items(
                *, 
                notes, 
                menu_items(name),
                order_item_modifiers(
                  id,
                  price_at_order,
                  modifier_id,
                  modifiers(name, price_modifier),
                  modifier_groups(name)
                )
              )
            `
            )
            .eq("id", payload.new.id)
            .eq("restaurant_id", profile.restaurant_id)
            .single();
          if (newOrderDetails) {
            setOrders((current) => [newOrderDetails as Order, ...current]);
            // Nota: Sonido manejado por GlobalNotificationService
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((current) => {
            const updatedOrders = current.map((order) => {
              if (order.id === payload.new.id) {
                const oldStatus = order.status;
                const newStatus = (payload.new as Order).status;

                // Nota: Sonidos de cambio de estado manejados por GlobalNotificationService

                return { ...order, ...(payload.new as Order) };
              }
              return order;
            });
            return updatedOrders;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Nota: Listener de impresoras movido a GlobalNotificationService

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);

    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);

      // Primero verificar que el usuario tenga acceso a la orden
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Obtener el restaurant_id del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.restaurant_id) {
        throw new Error("No se encontró el restaurante del usuario");
      }

      // Primero verificar el estado actual de la orden
      const { data: currentOrder, error: fetchError } = await supabase
        .from("orders")
        .select("id, status, restaurant_id")
        .eq("id", orderId)
        .single();

      if (fetchError) {
        console.error("Error fetching current order:", fetchError);
        throw new Error(`No se pudo obtener la orden: ${fetchError.message}`);
      }

      console.log("Current order state:", currentOrder);

      if (currentOrder.restaurant_id !== profile.restaurant_id) {
        throw new Error("Esta orden no pertenece a tu restaurante");
      }

      // Actualizar la orden
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .eq("restaurant_id", profile.restaurant_id)
        .select();

      if (error) {
        console.error("Error updating order status:", {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        alert(
          `Error al actualizar el pedido: ${error.message} (Código: ${error.code})`
        );
      } else if (data && data.length === 0) {
        console.error("No se encontró la orden o no tienes permisos");
        alert(
          "No se pudo actualizar la orden. Verifica que pertenezca a tu restaurante."
        );
      } else {
        console.log("Order updated successfully:", data);
      }
    } catch (err) {
      console.error("Error en handleUpdateStatus:", err);
      alert(`Error: ${err.message}`);
    }

    setUpdatingOrderId(null);
  };

  const handlePrint = async (orderId: number, printerType: string) => {
    setUpdatingOrderId(orderId);

    // Determinar el endpoint según el tipo de impresora
    let endpoint: string;
    let successMessage: string;

    switch (printerType) {
      case "kitchen":
        endpoint = "/api/print-kitchen-order";
        successMessage = "Comanda de cocina enviada";
        break;
      case "drink":
        endpoint = "/api/print-drink-order";
        successMessage = "Comanda de bar enviada";
        break;
      default:
        endpoint = "/api/print-kitchen-order";
        successMessage = "Comanda enviada";
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        // El API y el servicio de impresión manejan el estado de la base de datos
        // Solo mostrar mensaje de éxito
        alert(successMessage);
      } else {
        // La impresión falló, pero la orden sigue disponible para preparar manualmente
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || "Error al enviar la comanda";
        
        alert(`❌ ${errorMessage}\n\n✅ La orden sigue disponible para preparar manualmente`);
        
        console.error("Print failed for order", orderId, {
          status: res.status,
          error: errorMessage,
          note: "Order remains in pending state for manual preparation"
        });
      }
    } catch (error) {
      // Error de red o conexión, la orden sigue en pending
      console.error("Error printing order:", error);
      alert(`❌ Error de conexión al imprimir\n\n✅ La orden sigue disponible para preparar manualmente`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleCardExpansion = (orderId: number) => {
    setExpandedCardIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleOpenConfirmModal = (order: Order) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true); // Cambiar a modal de pago
  };

  const handleCloseConfirmModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
  };

  const handlePaymentComplete = () => {
    // Refrescar la lista de pedidos
    fetchOrders();
  };

  const handleOpenModifyModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModifyModalOpen(true);
  };

  const handleCloseModifyModal = () => {
    setIsModifyModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => {
    setIsModifyModalOpen(false);
    setSelectedOrder(null);
    // Refresh orders after modification
    fetchOrders();
  };

  // Funciones para drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const orderId = parseInt(event.active.id as string);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setDraggedOrder(order);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sourceOrderId = parseInt(active.id as string);
      const targetOrderId = parseInt(over.id as string);

      const sourceOrder = orders.find((o) => o.id === sourceOrderId);
      const targetOrder = orders.find((o) => o.id === targetOrderId);

      if (sourceOrder && targetOrder) {
        // Verificar que ambas órdenes sean de la misma mesa
        if (sourceOrder.table_id === targetOrder.table_id) {
          setSourceOrders([sourceOrder]);
          setTargetOrder(targetOrder);
          setIsMergeModalOpen(true);
        } else {
          alert("Solo se pueden fusionar órdenes de la misma mesa");
        }
      }
    }

    setDraggedOrder(null);
  };

  const handleMergeComplete = () => {
    fetchOrders();
    setIsMergeModalOpen(false);
    setSourceOrders([]);
    setTargetOrder(null);
  };

  const fetchOrders = async () => {
    try {
      // Get current user and their restaurant_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.restaurant_id) return;

      // Buscar la última caja cerrada para determinar desde cuándo mostrar pedidos
      const { data: lastClosedCash } = await supabase
        .from("cash_registers")
        .select("closed_at")
        .eq("restaurant_id", profile.restaurant_id)
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(1)
        .single();

      // Determinar fecha de inicio para filtrar pedidos
      let startDate;
      if (lastClosedCash?.closed_at) {
        // Si hay una caja cerrada, mostrar pedidos desde esa fecha
        startDate = new Date(lastClosedCash.closed_at);
      } else {
        // Si no hay cajas cerradas, mostrar pedidos del día actual
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(
          `
          *, 
          notes, 
          table:tables(table_number, restaurant_id), 
          order_items(
            *, 
            notes, 
            menu_items(name, price),
            order_item_modifiers(
              id,
              price_at_order,
              modifier_id,
              modifiers(name, price_modifier),
              modifier_groups(name)
            )
          )
        `
        )
        .eq("restaurant_id", profile.restaurant_id)
        .eq("archived", false)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(ordersData as Order[]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleOpenCancelModal = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedOrder) return;
    await handleUpdateStatus(selectedOrder.id, "cancelled");
    handleCloseCancelModal();
  };

  const handleStartPreparing = async (orderId: number) => {
    setUpdatingOrderId(orderId);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.restaurant_id) {
        throw new Error("No se encontró el restaurante del usuario");
      }

      const { error } = await supabase
        .from("orders")
        .update({
          is_preparing: true,
          is_new_order: false,
        })
        .eq("id", orderId)
        .eq("restaurant_id", profile.restaurant_id);

      if (error) {
        console.error("Error actualizando orden:", error);
        alert(`Error al actualizar la orden: ${error.message}`);
      } else {
        console.log("Orden marcada como en preparación");
      }
    } catch (err) {
      console.error("Error en handleStartPreparing:", err);
      alert(`Error: ${err.message}`);
    }

    setUpdatingOrderId(null);
  };

  const handleMarkAsReady = async (orderId: number) => {
    setUpdatingOrderId(orderId);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.restaurant_id) {
        throw new Error("No se encontró el restaurante del usuario");
      }

      const { error } = await supabase
        .from("orders")
        .update({
          is_ready: true,
          is_preparing: false,
        })
        .eq("id", orderId)
        .eq("restaurant_id", profile.restaurant_id);

      if (error) {
        console.error("Error actualizando orden:", error);
        alert(`Error al actualizar la orden: ${error.message}`);
      } else {
        console.log("Orden marcada como lista");
      }
    } catch (err) {
      console.error("Error en handleMarkAsReady:", err);
      alert(`Error: ${err.message}`);
    }

    setUpdatingOrderId(null);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedOrder) return;

    // Actualizar estado del pedido a completado
    await handleUpdateStatus(selectedOrder.id, "completed");

    handleCloseConfirmModal();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // PRIMERA REGLA: NUNCA mostrar órdenes con estado "merged"
      if (order.status === "merged") {
        return false;
      }

      // Para "cancelled", mostrar TODAS las órdenes canceladas (independientemente del estado de impresión)
      if (activeStatus === "cancelled") {
        return order.status === "cancelled";
      }

      // Para "pending", mostrar órdenes que NO han sido impresas Y NO están canceladas Y NO están completadas
      if (activeStatus === "pending") {
        return !isOrderReadyForProgress(order) && 
               order.status !== "cancelled" && 
               order.status !== "completed";
      }

      // Para "in_progress", mostrar órdenes que estén en preparación (con impresora o sin ella)
      if (activeStatus === "in_progress") {
        // Si no hay impresoras activas, mostrar todas las órdenes con status pending o in_progress
        if (activePrinters.length === 0) {
          return (
            order.status === "pending" || order.status === "in_progress"
          );
        }
        // Si hay impresoras, usar la lógica original
        return (
          isOrderReadyForProgress(order) &&
          (order.status === "pending" || order.status === "in_progress")
        );
      }

      // Para otros estados, filtrar directamente
      return order.status === activeStatus;
    });
  }, [orders, activeStatus, activePrinters, isOrderReadyForProgress]);

  // Agrupar pedidos por mesa para mostrar en formato agrupado
  const groupedOrders = useMemo(() => {
    if (activeStatus !== "in_progress") {
      // Para "pending", "completed" y "cancelled", mostrar como lista normal
      return { ungrouped: filteredOrders };
    }

    // Solo para "in_progress", agrupar por mesa
    const groups: { [tableId: string]: Order[] } = {};

    filteredOrders.forEach((order) => {
      const tableKey = order.table_id?.toString() || "sin-mesa";
      if (!groups[tableKey]) {
        groups[tableKey] = [];
      }
      groups[tableKey].push(order);
    });

    return groups;
  }, [filteredOrders, activeStatus]);

  // Función para renderizar el contenido de un pedido (reutilizable)
  const renderOrderContent = (
    order: Order,
    isExpanded: boolean,
    displayedItems: any[],
    isInGroup = false
  ) => {
    const showBlackHeader =
      (activeStatus === "completed" || activeStatus === "cancelled") &&
      !isInGroup;

    return (
      <>
        {showBlackHeader && (
          <div className="bg-gray-800 text-white p-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">
                Mesa {order.table?.table_number || order.table_id}
              </h3>
              <div className="text-right">
                <p className="text-xs opacity-90">
                  {order.order_items.length} item(s)
                </p>
                <p className="text-sm font-bold">
                  Bs {(order.total_price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className={isInGroup ? "" : "p-2"}>
          {!showBlackHeader && (
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-gray-800">
                {isInGroup
                  ? `#${order.id}`
                  : `Mesa ${order.table?.table_number || order.table_id}`}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 font-medium">
                  {order.order_items.length} items
                </span>
                <span className="font-bold">
                  Bs {(order.total_price || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Línea 2: Pedidos uno debajo del otro */}
          <div className="mb-1">
            <div className="text-xs text-gray-700 space-y-0.5">
              {displayedItems.map((item) => (
                <div key={item.id}>
                  {item.quantity}x {getItemName(item)}
                  {item.order_item_modifiers &&
                    item.order_item_modifiers.length > 0 && (
                      <span className="text-blue-600">
                        {" "}
                        (
                        {item.order_item_modifiers.map((mod, idx) => (
                          <span key={mod.id}>
                            {idx > 0 && ", "}
                            {mod.modifiers.name}
                          </span>
                        ))}
                        )
                      </span>
                    )}
                  {item.notes && (
                    <span className="text-gray-500">
                      {" "}
                      📝{formatModifierNotes(item.notes)}
                    </span>
                  )}
                </div>
              ))}
              {order.order_items.length > ITEMS_BEFORE_TRUNCATE && (
                <button
                  onClick={() => toggleCardExpansion(order.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  {isExpanded ? "menos" : "más"}
                </button>
              )}
            </div>
          </div>

          {/* Nota global en línea si existe */}
          {order.notes && (
            <div className="mb-1 text-xs text-yellow-700 bg-yellow-50 px-1 py-0.5 rounded">
              📝 {order.notes}
            </div>
          )}

          {/* Línea 3: #Orden + Cliente + Tiempo */}
          <div className="flex justify-between items-center text-xs text-gray-700 mb-2">
            <span>
              #{order.id} • {order.customer_name || "Cliente"}
            </span>
            <span className={getTimeAgoColor(order.created_at, currentTime)}>
              <Clock size={8} className="inline mr-1" />
              {formatTimeAgo(order.created_at, currentTime)}
            </span>
          </div>

          {/* Indicador compacto de impresora si es necesario */}
          {activePrinters.length > 0 && (
            <div className="mb-2">
              <PrintStatusIndicator
                label="🖨"
                printed={order.kitchen_printed}
                icon={<Printer size={10} />}
              />
            </div>
          )}

          {/* Botones de acción compactos integrados */}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
              {/* Opciones secundarias a la izquierda */}
              <div className="flex gap-0.5">
                {/* Indicador de que la orden es arrastrable */}
                {(order.status === "pending" ||
                  order.status === "in_progress") && (
                  <div
                    className="flex items-center px-1 py-0.5 text-xs text-purple-600 bg-purple-100 rounded"
                    title="Arrastrar para fusionar con otra orden"
                  >
                    <Move size={10} />
                  </div>
                )}

                {activePrinters.length > 0 && (
                  <button
                    onClick={() => handlePrint(order.id, "kitchen")}
                    disabled={updatingOrderId === order.id}
                    className="flex items-center px-1 py-0.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:bg-gray-400"
                    title="Imprimir"
                  >
                    <Printer size={10} />
                  </button>
                )}

                {(order.status === "pending" ||
                  order.status === "in_progress") && (
                  <button
                    onClick={() => handleOpenModifyModal(order)}
                    className="flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                    title="Modificar"
                  >
                    <Edit size={12} />
                  </button>
                )}

                <button
                  onClick={() => handleOpenCancelModal(order)}
                  className="flex items-center px-2 py-1 text-xs text-red-600 bg-red-100 rounded hover:bg-red-200"
                  title="Cancelar"
                >
                  <XCircle size={12} />
                </button>
              </div>

              {/* Subflujo: funciona tanto en pending como in_progress */}
              <div>
                {/* Primer paso: is_new_order -> is_preparing */}
                {(order.status === "pending" || order.status === "in_progress") && 
                  order.is_new_order && !order.is_preparing && !order.is_ready && (
                    <button
                      onClick={() => handleStartPreparing(order.id)}
                      disabled={updatingOrderId === order.id}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-orange-600 rounded hover:bg-orange-700 disabled:bg-gray-400 transition-all"
                    >
                      🔥 EMPEZAR A PREPARAR
                    </button>
                  )}

                {/* Segundo paso: is_preparing -> is_ready */}
                {(order.status === "pending" || order.status === "in_progress") && 
                  !order.is_new_order && order.is_preparing && !order.is_ready && (
                    <button
                      onClick={() => handleMarkAsReady(order.id)}
                      disabled={updatingOrderId === order.id}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded hover:bg-purple-700 disabled:bg-gray-400 transition-all"
                    >
                      ✅ ORDEN LISTA Y ENVIADA
                    </button>
                  )}

                {/* Tercer paso: is_ready -> completar */}
                {(order.status === "pending" || order.status === "in_progress") && 
                  !order.is_new_order && !order.is_preparing && order.is_ready && (
                    <button
                      onClick={() => handleOpenConfirmModal(order)}
                      disabled={updatingOrderId === order.id}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 transition-all"
                    >
                      💵 COBRAR Y CERRAR
                    </button>
                  )}

                {/* Fallback si no coincide con ningún estado */}
                {!["pending", "in_progress", "completed", "cancelled"].includes(
                  order.status
                ) && (
                  <div className="text-xs text-red-500">
                    Estado no reconocido: {order.status}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const orderCounts = useMemo(() => {
    const counts: { [key in OrderWorkflowStatus]: number } = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      // PRIMERA REGLA: NUNCA contar órdenes con estado "merged"
      if (order.status === "merged") {
        return; // Ignorar completamente las órdenes merged
      }

      // Contar por estado PRIMERO, independientemente de la impresión
      if (order.status === "cancelled") {
        counts.cancelled++;
        return;
      }
      
      if (order.status === "completed") {
        counts.completed++;
        return;
      }

      // Para pending e in_progress, usar lógica de impresión para decidir en qué pestaña aparecen
      if (order.status === "pending" || order.status === "in_progress") {
        // Si NO está impreso, va a "pending"
        if (!isOrderReadyForProgress(order)) {
          counts.pending++;
        } else {
          // Si SÍ está impreso, va a "in_progress"
          counts.in_progress++;
        }
      }
    });
    return counts;
  }, [orders, activePrinters, isOrderReadyForProgress]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gray-50 min-h-screen -m-8 -mt-20">
        {/* Tabs pegados al top absoluto de la pantalla */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-200 px-4 py-1">
            <div className="flex items-center">
              {/* Botón de hamburguesa solo para esta página */}
              <button
                onClick={() => {
                  if ((window as any).toggleStaffSidebar) {
                    (window as any).toggleStaffSidebar();
                  }
                }}
                className="p-1 mr-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Toggle sidebar"
              >
                <Menu size={18} />
              </button>
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatus(tab.key)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeStatus === tab.key
                      ? "border-b-2 border-gray-600 text-gray-900 font-semibold"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                    {orderCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Botón de control de sonido compacto */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded transition-colors ${
                soundEnabled
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
              title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Layout Masonry real - máximo 4 columnas */}
        <div className="pt-20 p-2">
          {(() => {
            const columns = 4; // Máximo 4 columnas
            const columnArrays = Array.from({ length: columns }, () => []);

            // Distribuir las órdenes en las columnas de manera dinámica
            const ordersToDistribute = groupedOrders.ungrouped
              ? groupedOrders.ungrouped
              : Object.entries(groupedOrders).map(
                  ([tableKey, tableOrders]) => ({
                    id: `table-${tableKey}`,
                    tableOrders,
                    tableKey,
                    isGrouped: true,
                  })
                );

            ordersToDistribute.forEach((item) => {
              // Encontrar la columna más corta
              let shortestColumnIndex = 0;
              let shortestHeight = columnArrays[0].length;

              for (let i = 1; i < columns; i++) {
                if (columnArrays[i].length < shortestHeight) {
                  shortestHeight = columnArrays[i].length;
                  shortestColumnIndex = i;
                }
              }

              // Agregar el item a la columna más corta
              columnArrays[shortestColumnIndex].push(item);
            });

            return (
              <div className="flex gap-3">
                {columnArrays.map((column, columnIndex) => {
                  // ids de órdenes para SortableContext
                  const sortableIds = column.flatMap((item) =>
                    item.isGrouped
                      ? item.tableOrders.map((order) => order.id)
                      : [item.id]
                  );
                  return (
                    <SortableContext
                      key={columnIndex}
                      items={sortableIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex-1 space-y-3">
                        {column.map((item) => {
                          if (item.isGrouped) {
                            // Renderizar grupo de mesa
                            const tableTotal = item.tableOrders.reduce(
                              (sum, order) => sum + (order.total_price || 0),
                              0
                            );
                            const tableNumber =
                              item.tableOrders[0]?.table?.table_number ||
                              item.tableKey;
                            const hasNewOrders = item.tableOrders.some(
                              (order) => order.status === "pending"
                            );

                            return (
                              <div
                                key={item.id}
                                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out ${
                                  hasNewOrders
                                    ? "ring-1 ring-orange-400 ring-opacity-75"
                                    : ""
                                }`}
                              >
                                {/* Header super compacto de la mesa */}
                                <div className="bg-gray-800 text-white p-2">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-base font-bold">
                                      Mesa {tableNumber}
                                    </h3>
                                    <div className="text-right">
                                      <p className="text-xs opacity-90">
                                        {item.tableOrders.length} pedido(s)
                                      </p>
                                      <p className="text-sm font-bold">
                                        Bs {tableTotal.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Lista compacta de pedidos de la mesa */}
                                <div className="p-2 space-y-2">
                                  {item.tableOrders.map((order, index) => {
                                    const isExpanded = expandedCardIds.includes(
                                      order.id
                                    );
                                    const displayedItems = isExpanded
                                      ? order.order_items
                                      : order.order_items.slice(
                                          0,
                                          ITEMS_BEFORE_TRUNCATE
                                        );

                                    return (
                                      <SortableOrderCard
                                        key={order.id}
                                        id={order.id}
                                        disabled={
                                          order.status === "completed" ||
                                          order.status === "cancelled"
                                        }
                                      >
                                        <div
                                          className={`border rounded p-1 ${
                                            order.status === "pending" &&
                                            !isOrderReadyForProgress(order)
                                              ? "border-blue-400 bg-blue-50 animate-pulse"
                                              : order.is_new_order &&
                                                activeStatus === "in_progress"
                                              ? "border-orange-400 bg-orange-50 animate-pulse"
                                              : order.status === "pending" ||
                                                order.status === "in_progress"
                                              ? "border-purple-300 bg-purple-50"
                                              : "border-gray-200 bg-gray-50"
                                          }`}
                                        >
                                          {/* Contenido individual del pedido sin wrapper adicional */}
                                          {renderOrderContent(
                                            order,
                                            isExpanded,
                                            displayedItems,
                                            true
                                          )}
                                        </div>
                                      </SortableOrderCard>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          } else {
                            // Renderizar orden individual
                            const isExpanded = expandedCardIds.includes(
                              item.id
                            );
                            const displayedItems = isExpanded
                              ? item.order_items
                              : item.order_items.slice(
                                  0,
                                  ITEMS_BEFORE_TRUNCATE
                                );

                            return (
                              <SortableOrderCard
                                key={item.id}
                                id={item.id}
                                disabled={
                                  item.status === "completed" ||
                                  item.status === "cancelled"
                                }
                              >
                                <div
                                  className={`rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out ${
                                    item.status === "pending" &&
                                    !isOrderReadyForProgress(item)
                                      ? "animate-pulse ring-2 ring-blue-500 ring-opacity-100 bg-blue-50"
                                      : item.is_new_order &&
                                        activeStatus === "in_progress"
                                      ? "animate-pulse ring-2 ring-orange-500 ring-opacity-100 bg-orange-50"
                                      : item.status === "pending" ||
                                        item.status === "in_progress"
                                      ? "ring-1 ring-purple-300 hover:ring-purple-400 bg-white"
                                      : "bg-white"
                                  }`}
                                >
                                  {/* Contenido individual del pedido */}
                                  {renderOrderContent(
                                    item,
                                    isExpanded,
                                    displayedItems
                                  )}
                                </div>
                              </SortableOrderCard>
                            );
                          }
                        })}
                      </div>
                    </SortableContext>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {isModalOpen && selectedOrder && (
          <ConfirmCompletionModal
            isOpen={isModalOpen}
            isLoading={updatingOrderId === selectedOrder.id}
            order={selectedOrder}
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirmCompletion}
          />
        )}
        {isCancelModalOpen && selectedOrder && (
          <ConfirmCancelModal
            isOpen={isCancelModalOpen}
            isLoading={updatingOrderId === selectedOrder.id}
            order={selectedOrder}
            onClose={handleCloseCancelModal}
            onConfirm={handleConfirmCancellation}
          />
        )}
        {isPaymentModalOpen && selectedOrder && restaurantId && (
          <PaymentMethodModal
            isOpen={isPaymentModalOpen}
            orderId={selectedOrder.id}
            orderTotal={selectedOrder.total_price || 0}
            restaurantId={restaurantId}
            onClose={handleClosePaymentModal}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
        {isModifyModalOpen && selectedOrder && (
          <ModifyOrderModal
            isOpen={isModifyModalOpen}
            order={selectedOrder}
            onClose={handleCloseModifyModal}
            onOrderUpdated={handleOrderUpdated}
          />
        )}
        {isMergeModalOpen && targetOrder && (
          <MergeOrdersModal
            isOpen={isMergeModalOpen}
            sourceOrders={sourceOrders}
            targetOrder={targetOrder}
            onClose={() => setIsMergeModalOpen(false)}
            onMergeComplete={handleMergeComplete}
          />
        )}
      </div>
    </DndContext>
  );
}

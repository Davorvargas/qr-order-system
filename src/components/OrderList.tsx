// src/components/OrderList.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/app/staff/dashboard/page";
import { Database } from "@/lib/database.types";
import ConfirmCompletionModal from "./ConfirmCompletionModal";
import ConfirmCancelModal from "./ConfirmCancelModal";
import PaymentMethodModal from "./PaymentMethodModal";
import ModifyOrderModal from "./ModifyOrderModal";
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
} from "lucide-react";
import { formatModifierNotes } from "../utils/formatModifiers";
import { getItemName } from "../utils/getItemName";

// Audio notification hook
const useAudioNotification = () => {
  const playNotification = () => {
    try {
      // Crear un sonido simple usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Crear un sonido de notificación simple (3 tonos)
      const playTone = (frequency: number, duration: number, delay: number) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };
      
      // Secuencia de tonos: Do - Mi - Sol
      playTone(523.25, 0.2, 0);    // Do
      playTone(659.25, 0.2, 200);  // Mi  
      playTone(783.99, 0.3, 400);  // Sol
      
    } catch (error) {
      console.log('Audio notification not available:', error);
      // Fallback: mostrar notificación visual si el audio falla
    }
  };
  
  return playNotification;
};

type Printer = Database["public"]["Tables"]["printers"]["Row"];

type OrderWorkflowStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

const STATUS_TABS: { key: OrderWorkflowStatus; label: string }[] = [
  { key: "pending", label: "Pendientes" },
  { key: "in_progress", label: "En Proceso" },
  { key: "completed", label: "Completados" },
  { key: "cancelled", label: "Cancelados" },
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
    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border ${
      printed
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-yellow-50 border-yellow-200 text-yellow-800"
    }`}
  >
    {icon}
    <span>{label}:</span>
    <span className="font-semibold">{printed ? "Impreso" : "Pendiente"}</span>
    {printed ? (
      <CheckCircle2 size={16} className="text-green-600" />
    ) : (
      <AlertCircle size={16} className="text-yellow-600" />
    )}
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
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const playNotification = useAudioNotification();
  const [activeStatus, setActiveStatus] =
    useState<OrderWorkflowStatus>("pending");
  const [expandedCardIds, setExpandedCardIds] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Cargar configuración de sonido desde localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orderSoundEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Nuevo estado para impresoras activas
  const [activePrinters, setActivePrinters] = useState<Printer[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Obtener restaurant_id y impresoras activas
  useEffect(() => {
    const fetchRestaurantAndPrinters = async () => {
      try {
        // Get restaurant_id from current user's profile instead of orders
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
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

  // Función simplificada para una sola impresora
  const isOrderReadyForProgress = (order: Order) => {
    // Solo verificar que el ticket de cocina esté impreso
    return order.kitchen_printed;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Guardar configuración de sonido en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderSoundEnabled', JSON.stringify(soundEnabled));
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
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profile } = await supabase
            .from('profiles')
            .select('restaurant_id')
            .eq('id', user.id)
            .single();

          if (!profile?.restaurant_id) return;

          const { data: newOrderDetails } = await supabase
            .from("orders")
            .select(`
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
            `)
            .eq("id", payload.new.id)
            .eq('restaurant_id', profile.restaurant_id)
            .single();
          if (newOrderDetails) {
            setOrders((current) => [newOrderDetails as Order, ...current]);
            // Reproducir sonido de notificación para nuevo pedido (si está habilitado)
            if (soundEnabled) {
              playNotification();
              console.log('🔊 Nuevo pedido recibido! Reproduciendo notificación sonora');
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((current) =>
            current.map((order) =>
              order.id === payload.new.id
                ? { ...order, ...(payload.new as Order) }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
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
        alert("Error al enviar la comanda");
      }
    } catch (error) {
      console.error("Error printing order:", error);
      alert("Error al enviar la comanda");
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

  const fetchOrders = async () => {
    try {
      // Get current user and their restaurant_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) return;

      // Buscar la última caja cerrada para determinar desde cuándo mostrar pedidos
      const { data: lastClosedCash } = await supabase
        .from('cash_registers')
        .select('closed_at')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
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
        .select(`
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
        `)
        .eq('restaurant_id', profile.restaurant_id)
        .eq('archived', false)
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

  const handleConfirmCompletion = async () => {
    if (!selectedOrder) return;
    
    // Actualizar estado del pedido a completado
    await handleUpdateStatus(selectedOrder.id, "completed");
    
    
    handleCloseConfirmModal();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtrar por estado activo
      if (order.status !== activeStatus) return false;

      // Si el estado es "pending", verificar si el pedido está realmente pendiente
      // Un pedido está pendiente si no todas las impresoras activas han impreso
      if (activeStatus === "pending") {
        return !isOrderReadyForProgress(order);
      }

      return true;
    });
  }, [orders, activeStatus, activePrinters, isOrderReadyForProgress]);

  const orderCounts = useMemo(() => {
    const counts: { [key in OrderWorkflowStatus]: number } = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      // Para pedidos "pending", verificar si realmente están pendientes
      if (order.status === "pending") {
        if (!isOrderReadyForProgress(order)) {
          counts.pending++;
        } else {
          // Si está listo para progreso, contar como "in_progress"
          counts.in_progress++;
        }
      } else {
        // Para otros estados, usar el status directamente
        const status = order.status as OrderWorkflowStatus;
        if (counts[status] !== undefined) {
          counts[status]++;
        }
      }
    });
    return counts;
  }, [orders, activePrinters, isOrderReadyForProgress]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center border-b border-gray-200">
          <div className="flex">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeStatus === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                  {orderCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
          
          {/* Botón de control de sonido */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
            title={soundEnabled ? "Desactivar sonido de notificaciones" : "Activar sonido de notificaciones"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOrders.map((order) => {
          const isExpanded = expandedCardIds.includes(order.id);
          const displayedItems = isExpanded
            ? order.order_items
            : order.order_items.slice(0, ITEMS_BEFORE_TRUNCATE);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-bold text-gray-800">
                      Mesa {order.table?.table_number || order.table_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      por {order.customer_name || "Cliente"}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-gray-400">
                    #{order.id}
                  </span>
                </div>

                {/* Indicador simplificado para una sola impresora */}
                <div className="my-4 flex flex-col gap-2">
                  <PrintStatusIndicator
                    label="Ticket Impreso"
                    printed={order.kitchen_printed}
                    icon={<Printer size={16} />}
                  />
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    {displayedItems.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}x{" "}
                          {getItemName(item)}
                          {item.order_item_modifiers && item.order_item_modifiers.length > 0 && (
                            <span className="block text-xs text-blue-600 ml-2">
                              {item.order_item_modifiers.map((mod, index) => (
                                <span key={mod.id}>
                                  {index > 0 && ", "}
                                  {mod.modifier_groups.name}: {mod.modifiers.name}
                                  {mod.price_at_order > 0 && ` (+${mod.price_at_order})`}
                                </span>
                              ))}
                            </span>
                          )}
                          {item.notes && (
                            <span className="block text-xs text-gray-500 ml-2 whitespace-pre-wrap">
                              📝 {formatModifierNotes(item.notes)}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.order_items.length > ITEMS_BEFORE_TRUNCATE && (
                    <button
                      onClick={() => toggleCardExpansion(order.id)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      {isExpanded ? "Mostrar menos" : "Mostrar más"}
                      {isExpanded ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </button>
                  )}
                </div>

                {/* Nota global de la orden */}
                {order.notes && (
                  <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded">
                    <strong>Nota del pedido:</strong>{" "}
                    <span className="whitespace-pre-wrap">{order.notes}</span>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">Total</p>
                    <p className="text-lg font-bold">
                      Bs {(order.total_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-xs ${getTimeAgoColor(
                      order.created_at,
                      currentTime
                    )}`}
                  >
                    <Clock size={12} className="inline-block mr-1" />
                    {formatTimeAgo(order.created_at, currentTime)}
                  </p>
                </div>

                {order.status !== "completed" &&
                  order.status !== "cancelled" && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <div className="flex flex-col gap-3">
                        {/* Botón simplificado para una sola impresora */}
                        {activePrinters.length > 0 && (
                          <div className="flex gap-3">
                            <ReprintButton
                              label="Imprimir Ticket"
                              onClick={() =>
                                handlePrint(order.id, "kitchen")
                              }
                              disabled={updatingOrderId === order.id}
                            />
                          </div>
                        )}
                        {(order.status === "pending" || order.status === "in_progress") && (
                          <button
                            onClick={() => handleOpenModifyModal(order)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                          >
                            <Edit size={16} />
                            Modificar Pedido
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenConfirmModal(order)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle2 size={16} />
                          Completar Pedido
                        </button>
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                        >
                          <XCircle size={16} />
                          Cancelar Pedido
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
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
    </div>
  );
}

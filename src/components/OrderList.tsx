// src/components/OrderList.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/app/staff/dashboard/page";
import ConfirmCompletionModal from "./ConfirmCompletionModal";
import ConfirmCancelModal from "./ConfirmCancelModal";
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
} from "lucide-react";

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
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors basis-0"
  >
    <Printer size={16} />
    {icon}
    {label}
  </button>
);

export default function OrderList({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const supabase = createClient();
  const [orders, setOrders] = useState(initialOrders);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeStatus, setActiveStatus] =
    useState<OrderWorkflowStatus>("pending");
  const [expandedCardIds, setExpandedCardIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const { data: newOrderDetails } = await supabase
            .from("orders")
            .select("*, order_items(*, menu_items(name))")
            .eq("id", payload.new.id)
            .single();
          if (newOrderDetails) {
            setOrders((current) => [newOrderDetails as Order, ...current]);
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

  const handlePrint = async (orderId: number, type: "kitchen" | "drink") => {
    setUpdatingOrderId(orderId);
    const endpoint =
      type === "kitchen"
        ? "/api/print-kitchen-order"
        : "/api/print-drink-order";
    const successMessage =
      type === "kitchen"
        ? "Comanda de cocina enviada"
        : "Comanda de bebidas enviada";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(successMessage);
      } else {
        alert(`Error al imprimir: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      alert("Error de red al imprimir");
      console.error(error);
    }
    setUpdatingOrderId(null);
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
    setIsModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedOrder) return;
    await handleUpdateStatus(selectedOrder.id, "completed");
    handleCloseConfirmModal();
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.status === activeStatus);
  }, [orders, activeStatus]);

  const orderCounts = useMemo(() => {
    const counts: { [key in OrderWorkflowStatus]: number } = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      // Usamos el status directamente, ya que ahora es la fuente de verdad.
      const status = order.status as OrderWorkflowStatus;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [orders]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
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
                      Mesa {order.table_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      por {order.customer_name || "Cliente"}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-gray-400">
                    #{order.id}
                  </span>
                </div>

                <div className="my-4 flex flex-col gap-2">
                  <PrintStatusIndicator
                    label="Cocina"
                    printed={order.kitchen_printed}
                    icon={<CookingPot size={16} />}
                  />
                  <PrintStatusIndicator
                    label="Bebidas"
                    printed={order.drink_printed}
                    icon={<GlassWater size={16} />}
                  />
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    {displayedItems.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}x{" "}
                          {item.menu_items?.name || "Item borrado"}
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
                        <div className="flex gap-3">
                          <ReprintButton
                            label="Cocina"
                            onClick={() => handlePrint(order.id, "kitchen")}
                            disabled={updatingOrderId === order.id}
                            icon={<CookingPot size={16} />}
                          />
                          <ReprintButton
                            label="Bebidas"
                            onClick={() => handlePrint(order.id, "drink")}
                            disabled={updatingOrderId === order.id}
                            icon={<GlassWater size={16} />}
                          />
                        </div>
                        <button
                          onClick={() => handleOpenConfirmModal(order)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle2 size={16} />
                          Marcar como Completado
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
    </div>
  );
}

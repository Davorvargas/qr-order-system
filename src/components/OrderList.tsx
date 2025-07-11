// src/components/OrderList.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/app/staff/dashboard/page"; // <-- Import types
import ConfirmCompletionModal from "./ConfirmCompletionModal";
import ConfirmCancelModal from "./ConfirmCancelModal"; // <-- Import Cancel Modal
import {
  Clock,
  Printer,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  XCircle, // <-- Import Cancel Icon
  ClipboardEdit, // <-- Import Manual Entry Icon
} from "lucide-react";

type OrderStatus =
  | "order_placed"
  | "receipt_printed"
  | "completed"
  | "cancelled";

const STATUS_TABS: OrderStatus[] = [
  "order_placed",
  "receipt_printed",
  "completed",
  "cancelled",
];

const ITEMS_BEFORE_TRUNCATE = 4; // Max items to show before truncating

// Re-usable function to format time
function formatTimeAgo(dateString: string, now: Date) {
  const date = new Date(dateString);
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutos atrás`;
  const hours = Math.round(minutes / 60);
  return `${hours} horas atrás`;
}

const getTimeAgoColor = (dateString: string, now: Date): string => {
  const date = new Date(dateString);
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes >= 25) {
    return "text-red-600 font-semibold"; // Red for 25+ minutes
  } else if (minutes >= 15) {
    return "text-yellow-600 font-semibold"; // Yellow for 15+ minutes
  } else {
    return "text-gray-500"; // Default color for recent orders
  }
};

// Re-usable component for status pills
const StatusPill = ({ status }: { status: OrderStatus }) => (
  <span
    className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
      {
        order_placed: "bg-blue-100 text-blue-800",
        receipt_printed: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
      }[status]
    }`}
  >
    {(() => {
      if (status === "order_placed") return "Pedido realizado";
      if (status === "receipt_printed") return "Recibo impreso";
      if (status === "completed") return "Completado";
      if (status === "cancelled") return "Cancelado";
      return String(status);
    })()}
  </span>
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
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("order_placed");
  const [expandedCardIds, setExpandedCardIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Timer to update "time ago"
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("realtime orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          // Add a small delay to ensure order_items are committed
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Fetch full order details for the new order
          const { data: newOrderDetails } = await supabase
            .from("orders")
            .select("*, order_items(*, menu_items(name))")
            .eq("id", payload.new.id)
            .single();

          if (newOrderDetails) {
            setOrders((currentOrders) => [
              newOrderDetails as Order,
              ...currentOrders,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((currentOrders) =>
            currentOrders.map((order) =>
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
    setUpdatingOrderId(null); // RLS will trigger UI update
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

  // Memoize counts and filtered orders for performance
  const orderCounts = useMemo(() => {
    return STATUS_TABS.reduce((acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.status === activeStatus);
  }, [orders, activeStatus]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Status Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`${
                activeStatus === status
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {(() => {
                if (status === "order_placed") return "Pedido realizado";
                if (status === "receipt_printed") return "Recibo impreso";
                if (status === "completed") return "Completado";
                if (status === "cancelled") return "Cancelado";
                return String(status);
              })()}
              <span
                className={`${
                  activeStatus === status
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-900"
                } hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block`}
              >
                {orderCounts[status] ?? 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isExpanded = expandedCardIds.includes(order.id);
            const isTruncatable =
              order.order_items.length > ITEMS_BEFORE_TRUNCATE;
            const itemsToShow =
              isTruncatable && !isExpanded
                ? order.order_items.slice(0, ITEMS_BEFORE_TRUNCATE)
                : order.order_items;
            const remainingCount =
              order.order_items.length - ITEMS_BEFORE_TRUNCATE;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Mesa {order.table_id}</h3>
                    <p className="text-sm text-gray-500">
                      por {order.customer_name}
                    </p>
                    {order.source === "staff_placed" && (
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <ClipboardEdit size={12} className="mr-1.5" />
                        <span>Ingresado por Personal</span>
                      </div>
                    )}
                  </div>
                  <StatusPill status={order.status as OrderStatus} />
                </div>

                {/* Order Items */}
                <div className="p-4 flex-grow space-y-2">
                  {itemsToShow.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.menu_items?.name ?? "Item"}
                      </span>
                      {/* Price per item can be added if needed */}
                    </div>
                  ))}
                  {isTruncatable && (
                    <button
                      onClick={() => toggleCardExpansion(order.id)}
                      className="w-full text-left text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} className="mr-1" /> Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" /> Mostrar{" "}
                          {remainingCount} más items...
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="font-mono font-bold text-lg">
                      Bs {order.total_price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={`flex items-center ${getTimeAgoColor(
                        order.created_at,
                        currentTime
                      )}`}
                    >
                      <Clock size={12} className="mr-1.5" />{" "}
                      {formatTimeAgo(order.created_at, currentTime)}
                    </span>
                    <span className="text-gray-500">#{order.id}</span>
                  </div>
                  {/* Action Buttons */}
                  <div className="pt-3 space-y-2">
                    {order.status === "order_placed" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(order.id, "receipt_printed")
                          }
                          disabled={updatingOrderId === order.id}
                          className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 flex items-center justify-center disabled:opacity-50"
                        >
                          <Printer size={16} className="mr-2" />{" "}
                          {updatingOrderId === order.id
                            ? "..."
                            : "Imprimir Recibo"}
                        </button>
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          disabled={updatingOrderId === order.id}
                          className="w-full text-red-600 font-medium py-2 px-4 rounded-md hover:bg-red-50 flex items-center justify-center disabled:opacity-50"
                        >
                          <XCircle size={16} className="mr-2" />
                          Cancelar Pedido
                        </button>
                      </>
                    )}
                    {order.status === "receipt_printed" && (
                      <>
                        <button
                          onClick={() => handleOpenConfirmModal(order)}
                          disabled={updatingOrderId === order.id}
                          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} className="mr-2" />{" "}
                          {updatingOrderId === order.id
                            ? "..."
                            : "Marcar como Completado"}
                        </button>
                        <button
                          onClick={() => handleOpenCancelModal(order)}
                          disabled={updatingOrderId === order.id}
                          className="w-full text-red-600 font-medium py-2 px-4 rounded-md hover:bg-red-50 flex items-center justify-center disabled:opacity-50"
                        >
                          <XCircle size={16} className="mr-2" />
                          Cancelar Pedido
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No hay pedidos con estado &quot;
            {(() => {
              if (activeStatus === "order_placed") return "Pedido realizado";
              if (activeStatus === "receipt_printed") return "Recibo impreso";
              if (activeStatus === "completed") return "Completado";
              if (activeStatus === "cancelled") return "Cancelado";
              return String(activeStatus);
            })()}
            .
          </p>
        </div>
      )}
      <ConfirmCompletionModal
        isOpen={isModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmCompletion}
        order={selectedOrder}
        isLoading={updatingOrderId === selectedOrder?.id}
      />
      <ConfirmCancelModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancellation}
        order={selectedOrder}
        isLoading={updatingOrderId === selectedOrder?.id}
      />
    </div>
  );
}

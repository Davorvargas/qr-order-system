"use client";

import { useState, useEffect } from "react";
import {
  X,
  Printer,
  Clock,
  User,
  FileText,
  MapPin,
  CreditCard,
  QrCode,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { getItemName } from "@/utils/getItemName";
import { formatModifierNotes } from "@/utils/formatModifiers";

interface OrderItem {
  id: number;
  quantity: number;
  price_at_order: number | null;
  notes: string | null;
  menu_items: {
    name: string;
    description: string | null;
  } | null;
}

interface OrderDetail {
  id: number;
  created_at: string;
  customer_name: string;
  total_price: number | null;
  notes: string | null;
  status: string;
  source: string;
  order_type?: string;
  customer_phone?: string | null;
  customer_address?: string | null;
  delivery_date?: string | null;
  delivery_time?: string | null;
  customer_nit_carnet?: string | null;
  customer_razon_social?: string | null;
  table: {
    table_number: string;
  } | null;
  order_items: OrderItem[];
  cash_register?: {
    id: string;
    opened_at: string;
    status: string;
    opened_by: string | null;
  } | null;
  payments?: {
    payment_method: string;
    amount: number;
    processed_at: string;
    processed_by: string | null;
    notes?: string | null;
  }[];
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [reprinting, setReprinting] = useState(false);
  const [printingReceipt, setPrintingReceipt] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen || !orderId) {
      setOrderDetail(null);
      return;
    }

    fetchOrderDetail();
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      // Get current user's restaurant_id
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

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          customer_name,
          total_price,
          notes,
          status,
          source,
          order_type,
          customer_phone,
          customer_address,
          delivery_date,
          delivery_time,
          customer_nit_carnet,
          customer_razon_social,
          table:tables(table_number),
          order_items(
            id,
            quantity,
            price_at_order,
            notes,
            menu_items(name, description)
          )
        `
        )
        .eq("id", orderId)
        .eq("restaurant_id", profile.restaurant_id)
        .single();

      if (error) {
        console.error("Error fetching order detail:", error);
        return;
      }

      // Buscar la sesión de caja correspondiente al pedido
      const { data: cashRegisterData } = await supabase
        .from("cash_registers")
        .select("id, opened_at, status, opened_by")
        .eq("restaurant_id", profile.restaurant_id)
        .lte("opened_at", data.created_at)
        .or(`closed_at.is.null,closed_at.gte.${data.created_at}`)
        .order("opened_at", { ascending: false })
        .limit(1)
        .single();

      // Buscar información de los pagos si el pedido está completado
      let paymentsData = null;
      if (data.status === "completed") {
        const { data: payments } = await supabase
          .from("order_payments")
          .select("payment_method, amount, processed_at, processed_by, notes")
          .eq("order_id", orderId)
          .order("processed_at", { ascending: true });
        paymentsData = payments;
      }

      setOrderDetail({
        ...data,
        cash_register: cashRegisterData || null,
        payments: paymentsData || [],
      } as OrderDetail);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = async () => {
    if (!orderId) return;

    setReprinting(true);
    try {
      // Llamar a la API de reimpresión de cocina
      const response = await fetch("/api/print-kitchen-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        alert("Pedido enviado a reimpresión en cocina");
      } else {
        alert("Error al reimprimir el pedido");
      }
    } catch (error) {
      console.error("Error al reimprimir:", error);
      alert("Error al reimprimir el pedido");
    } finally {
      setReprinting(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!orderId) return;

    setPrintingReceipt(true);
    try {
      // Llamar a la API de impresión de recibo
      const response = await fetch("/api/print-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        alert("Recibo enviado a impresión");
      } else {
        alert("Error al imprimir el recibo");
      }
    } catch (error) {
      console.error("Error al imprimir recibo:", error);
      alert("Error al imprimir el recibo");
    } finally {
      setPrintingReceipt(false);
    }
  };

  // Helper functions para métodos de pago
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "qr":
        return <QrCode className="h-5 w-5 text-gray-400" />;
      case "card":
        return <CreditCard className="h-5 w-5 text-gray-400" />;
      case "cash":
        return <DollarSign className="h-5 w-5 text-gray-400" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "qr":
        return "QR";
      case "card":
        return "Tarjeta";
      case "cash":
        return "Efectivo";
      default:
        return method;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Detalle del Pedido #{orderId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando detalles...</div>
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha y Hora</p>
                      <p className="font-medium">
                        {format(
                          new Date(orderDetail.created_at),
                          "MMM d, yyyy"
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(orderDetail.created_at), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-medium">{orderDetail.customer_name}</p>
                    </div>
                  </div>

                  {orderDetail.table && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Mesa</p>
                        <p className="font-medium">
                          #{orderDetail.table.table_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {orderDetail.order_type === 'delivery' && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-pink-400" />
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Orden</p>
                        <p className="font-medium text-pink-600">
                          📦 Pedido por Delivery
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span
                      className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${
                        orderDetail.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : orderDetail.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {orderDetail.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Origen</p>
                    <p className="font-medium capitalize">
                      {orderDetail.source === "customer_qr"
                        ? "Cliente QR"
                        : orderDetail.source === "staff_placed"
                        ? "Staff Dashboard"
                        : "Staff"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      Bs {orderDetail.total_price?.toFixed(2)}
                    </p>
                  </div>

                  {/* Información de caja */}
                  {orderDetail.cash_register && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Sesión de Caja</p>
                        <p className="font-medium text-xs">
                          #{orderDetail.cash_register.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(
                            new Date(orderDetail.cash_register.opened_at),
                            "MMM d, h:mm a"
                          )}
                        </p>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full mt-1 ${
                            orderDetail.cash_register.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {orderDetail.cash_register.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Información de los pagos */}
                  {orderDetail.payments && orderDetail.payments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 font-medium">
                        Métodos de Pago
                      </p>
                      {orderDetail.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          {getPaymentMethodIcon(payment.payment_method)}
                          <div className="flex-1">
                            <p className="font-medium">
                              {getPaymentMethodLabel(payment.payment_method)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Pagado:{" "}
                              {format(
                                new Date(payment.processed_at),
                                "MMM d, h:mm a"
                              )}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-blue-600 font-medium">
                                {payment.notes}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-green-600">
                              Bs {payment.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {orderDetail.payments.length > 1 && (
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">
                              Total Pagado:
                            </span>
                            <span className="font-bold text-lg text-green-600">
                              Bs{" "}
                              {orderDetail.payments
                                .reduce((sum, p) => sum + p.amount, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Comentarios del pedido */}
              {orderDetail.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Comentarios del pedido
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {orderDetail.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de delivery */}
              {orderDetail.order_type === 'delivery' && (
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-pink-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-pink-800 mb-3">
                        📦 Información de Delivery
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {orderDetail.customer_phone && (
                          <div>
                            <span className="font-medium text-gray-700">📞 Teléfono:</span>
                            <span className="text-gray-600 ml-2">{orderDetail.customer_phone}</span>
                          </div>
                        )}
                        {orderDetail.customer_address && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">📍 Dirección:</span>
                            <span className="text-gray-600 ml-2">{orderDetail.customer_address}</span>
                          </div>
                        )}
                        {orderDetail.delivery_date && orderDetail.delivery_time && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">⏰ Fecha y Hora:</span>
                            <span className="text-gray-600 ml-2">
                              {orderDetail.delivery_date} a las {orderDetail.delivery_time}
                            </span>
                          </div>
                        )}
                        {orderDetail.customer_nit_carnet && (
                          <div>
                            <span className="font-medium text-gray-700">🆔 NIT/Carnet:</span>
                            <span className="text-gray-600 ml-2">{orderDetail.customer_nit_carnet}</span>
                          </div>
                        )}
                        {orderDetail.customer_razon_social && (
                          <div>
                            <span className="font-medium text-gray-700">🏢 Razón Social:</span>
                            <span className="text-gray-600 ml-2">{orderDetail.customer_razon_social}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items del pedido */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos Pedidos
                </h3>
                <div className="space-y-3">
                  {orderDetail.order_items.map((item) => {
                    const itemName = getItemName(item);
                    const modifierText = formatModifierNotes(item.notes);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {itemName}
                          </h4>
                          {item.menu_items?.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.menu_items.description}
                            </p>
                          )}
                          {modifierText && (
                            <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                              <span className="font-medium text-blue-800">
                                Modificadores:{" "}
                              </span>
                              <span className="text-blue-700">
                                {modifierText}
                              </span>
                            </div>
                          )}
                          {item.notes && !modifierText && (
                            <div className="mt-2 p-2 bg-yellow-100 rounded text-sm">
                              <span className="font-medium text-yellow-800">
                                Nota:{" "}
                              </span>
                              <span className="text-yellow-700">
                                {item.notes}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-right">
                          <div>
                            <p className="text-sm text-gray-600">Cantidad</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Precio Unit.
                            </p>
                            <p className="font-medium">
                              Bs {item.price_at_order?.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="font-bold text-gray-900">
                              Bs{" "}
                              {(
                                (item.price_at_order ?? 0) * item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen final */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total del Pedido:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    Bs {orderDetail.total_price?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No se pudo cargar el detalle del pedido
            </div>
          )}
        </div>

        {/* Footer */}
        {orderDetail && (
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Pedido #{orderDetail.id} • {orderDetail.order_items.length}{" "}
              productos
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrintReceipt}
                disabled={printingReceipt || orderDetail.status === "cancelled"}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Printer size={16} />
                <span>
                  {printingReceipt ? "Imprimiendo..." : "Imprimir Recibo"}
                </span>
              </button>
              <button
                onClick={handleReprint}
                disabled={reprinting || orderDetail.status === "cancelled"}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Printer size={16} />
                <span>
                  {reprinting ? "Reimprimiendo..." : "Reimprimir Cocina"}
                </span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

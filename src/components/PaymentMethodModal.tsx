"use client";

import { useState, useEffect } from "react";
import { createClient, User } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import { QrCode, CreditCard, DollarSign, X } from "lucide-react";

type CashRegister = Database["public"]["Tables"]["cash_registers"]["Row"];

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderTotal: number;
  restaurantId: string;
  onPaymentComplete: () => void;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  restaurantId,
  onPaymentComplete,
}: PaymentMethodModalProps) {
  const supabase = createClient();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeCashRegister, setActiveCashRegister] =
    useState<CashRegister | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchActiveCashRegister = async () => {
    try {
      const { data, error } = await supabase
        .from("cash_registers")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "open")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching active cash register:", error);
      }

      setActiveCashRegister(data);
    } catch (error) {
      console.error("Error fetching active cash register:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActiveCashRegister();
      fetchUser();
    }
  }, [isOpen, restaurantId]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    if (!activeCashRegister) {
      alert(
        "No hay una caja abierta. Por favor abre una caja antes de procesar el pago."
      );
      return;
    }

    setLoading(true);

    try {
      // Crear el registro de pago
      const { error: paymentError } = await supabase
        .from("order_payments")
        .insert({
          order_id: orderId,
          cash_register_id: activeCashRegister.id,
          payment_method: selectedMethod,
          amount: orderTotal,
          processed_by: user?.id,
        });

      if (paymentError) throw paymentError;

      // Actualizar el estado del pedido a "completed"
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (orderError) throw orderError;


      onPaymentComplete();
      onClose();
      setSelectedMethod("");
      alert("Pago procesado exitosamente");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "qr":
        return <QrCode size={24} />;
      case "card":
        return <CreditCard size={24} />;
      case "cash":
        return <DollarSign size={24} />;
      default:
        return <DollarSign size={24} />;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Método de Pago</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Total a pagar:</p>
          <p className="text-2xl font-bold text-green-600">
            Bs. {orderTotal.toFixed(2)}
          </p>
        </div>

        {!activeCashRegister && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              ⚠️ No hay una caja abierta. Abre una caja en Reportes antes de
              procesar pagos.
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {["qr", "card", "cash"].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              disabled={!activeCashRegister}
              className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                selectedMethod === method
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              } ${
                !activeCashRegister
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {getPaymentMethodIcon(method)}
              <span className="font-medium">
                {getPaymentMethodLabel(method)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || !activeCashRegister || loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Completar Pago"}
          </button>
        </div>
      </div>
    </div>
  );
}

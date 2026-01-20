"use client";

import { useState, useEffect } from "react";
import { createClient, User } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import { QrCode, CreditCard, DollarSign, X, Plus, Minus } from "lucide-react";

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

  // Estados para pago mixto
  const [showMixedPayment, setShowMixedPayment] = useState(false);
  const [qrAmount, setQrAmount] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);

  // Estados para propina QR
  const [showTipConfirmation, setShowTipConfirmation] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(0);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchActiveCashRegister = async () => {
    if (!restaurantId) {
      setActiveCashRegister(null);
      return;
    }

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
      setActiveCashRegister(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActiveCashRegister();
      fetchUser();
      // Reset states
      setSelectedMethod("");
      setShowMixedPayment(false);
      setQrAmount(0);
      setCashAmount(0);
      setShowTipConfirmation(false);
      setTipAmount(0);
      setTipPercentage(0);
    }
  }, [isOpen, restaurantId]);

  // Calcular propina automáticamente
  useEffect(() => {
    if (selectedMethod === "qr" && !showMixedPayment) {
      const tip = (orderTotal * tipPercentage) / 100;
      setTipAmount(tip);
    }
  }, [orderTotal, tipPercentage, selectedMethod, showMixedPayment]);

  const handlePayment = async () => {
    if (!selectedMethod && !showMixedPayment) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    if (!activeCashRegister) {
      alert(
        "No hay una caja abierta. Por favor abre una caja antes de procesar el pago."
      );
      return;
    }

    // Validar pago mixto
    if (showMixedPayment) {
      const totalMixed = qrAmount + cashAmount;
      if (Math.abs(totalMixed - orderTotal) > 0.01) {
        alert("El total del pago mixto debe ser igual al total del pedido");
        return;
      }
    }

    setLoading(true);

    try {
      if (showMixedPayment) {
        // Procesar pago mixto
        const payments = [];

        if (qrAmount > 0) {
          payments.push({
            order_id: orderId,
            cash_register_id: activeCashRegister.id,
            payment_method: "qr",
            amount: qrAmount,
            processed_by: user?.id,
          });
        }

        if (cashAmount > 0) {
          payments.push({
            order_id: orderId,
            cash_register_id: activeCashRegister.id,
            payment_method: "cash",
            amount: cashAmount,
            processed_by: user?.id,
          });
        }

        // Insertar múltiples pagos
        const { error: paymentError } = await supabase
          .from("order_payments")
          .insert(payments);

        if (paymentError) throw paymentError;
      } else {
        // Pago normal
        const paymentData = {
          order_id: orderId,
          cash_register_id: activeCashRegister.id,
          payment_method: selectedMethod,
          amount: selectedMethod === "qr" ? orderTotal + tipAmount : orderTotal,
          processed_by: user?.id,
          notes:
            selectedMethod === "qr" && tipAmount > 0
              ? `Propina incluida: Bs ${tipAmount.toFixed(2)}`
              : null,
        };

        const { error: paymentError } = await supabase
          .from("order_payments")
          .insert(paymentData);

        if (paymentError) throw paymentError;
      }

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

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setShowMixedPayment(false);
    setQrAmount(0);
    setCashAmount(0);

    if (method === "qr") {
      setShowTipConfirmation(true);
    } else {
      setShowTipConfirmation(false);
    }
  };

  const handleMixedPayment = () => {
    setSelectedMethod("mixed");
    setShowMixedPayment(true);
    setShowTipConfirmation(false);
    // Asegurar que los valores sumen exactamente el total del pedido
    const qrPart = Math.round(orderTotal * 0.6 * 100) / 100; // 60% QR por defecto
    const cashPart = Math.round((orderTotal - qrPart) * 100) / 100; // El resto en efectivo
    setQrAmount(qrPart);
    setCashAmount(cashPart);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ fontSmoothing: 'antialiased' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(0,0,0)', fontWeight: '900', textShadow: '0 0 1px rgba(0,0,0,0.1)' }}>Método de Pago</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            style={{ color: 'rgb(156,163,175)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-2" style={{ color: 'rgb(75,85,99)', fontWeight: '600' }}>Total a pagar:</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(22,163,74)', fontWeight: '900', textShadow: '0 0 1px rgba(22,163,74,0.1)' }}>
            Bs. {orderTotal.toFixed(2)}
          </p>
        </div>

        {!activeCashRegister && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm" style={{ color: 'rgb(220,38,38)', fontWeight: '600' }}>
              ⚠️ No hay una caja abierta. Abre una caja en Reportes antes de
              procesar pagos.
            </p>
          </div>
        )}

        {!showMixedPayment && !showTipConfirmation && (
          <div className="space-y-3 mb-6">
            {["qr", "card", "cash"].map((method) => (
              <button
                key={method}
                onClick={() => handleMethodSelect(method)}
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
                style={{ fontSmoothing: 'antialiased' }}
              >
                {getPaymentMethodIcon(method)}
                <span className="font-medium" style={{ color: 'rgb(0,0,0)', fontWeight: '700' }}>
                  {getPaymentMethodLabel(method)}
                </span>
              </button>
            ))}

            {/* Botón para pago mixto */}
            <button
              onClick={handleMixedPayment}
              disabled={!activeCashRegister}
              className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                selectedMethod === "mixed"
                  ? "border-orange-500 bg-orange-50"
                  : "border-orange-300 hover:border-orange-400"
              } ${
                !activeCashRegister
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{ fontSmoothing: 'antialiased' }}
            >
              <Plus size={24} />
              <span className="font-medium" style={{ color: 'rgb(0,0,0)', fontWeight: '700' }}>Pago Mixto (QR + Efectivo)</span>
            </button>
          </div>
        )}

        {/* Confirmación de propina para QR */}
        {showTipConfirmation && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3" style={{ color: 'rgb(0,0,0)', fontWeight: '900' }}>Confirmar Propina</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgb(75,85,99)', fontWeight: '600' }}>Subtotal:</span>
                <span className="font-medium" style={{ color: 'rgb(0,0,0)', fontWeight: '700' }}>Bs {orderTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgb(75,85,99)', fontWeight: '600' }}>
                  Propina ({tipPercentage}%):
                </span>
                <span className="font-medium" style={{ color: 'rgb(22,163,74)', fontWeight: '700' }}>
                  Bs {tipAmount.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: 'rgb(0,0,0)', fontWeight: '800' }}>Total con propina:</span>
                  <span className="font-bold text-lg" style={{ color: 'rgb(22,163,74)', fontWeight: '900' }}>
                    Bs {(orderTotal + tipAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {[0, 5, 10, 15, 20].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => setTipPercentage(percentage)}
                    className={`flex-1 py-2 px-3 rounded text-sm ${
                      tipPercentage === percentage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    style={{ fontSmoothing: 'antialiased' }}
                  >
                    <span style={{ color: tipPercentage === percentage ? 'rgb(255,255,255)' : 'rgb(55,65,81)', fontWeight: '600' }}>
                      {percentage === 0 ? "Sin propina" : `${percentage}%`}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTipAmount(Math.max(0, tipAmount - 1))}
                  className="p-2 rounded border hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={tipAmount || ""}
                  onChange={(e) =>
                    setTipAmount(parseFloat(e.target.value) || 0)
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  className="flex-1 text-center border rounded py-2"
                  step="0.50"
                  min="0"
                  style={{ color: 'rgb(0,0,0)', fontWeight: '600', fontSmoothing: 'antialiased' }}
                />
                <button
                  onClick={() => setTipAmount(tipAmount + 1)}
                  className="p-2 rounded border hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Configuración de pago mixto */}
        {showMixedPayment && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3" style={{ color: 'rgb(0,0,0)', fontWeight: '900' }}>Configurar Pago Mixto</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(55,65,81)', fontWeight: '700' }}>
                  Pago QR
                </label>
                <div className="flex items-center space-x-2">
                  <QrCode size={20} className="text-blue-600" />
                  <input
                    type="number"
                    value={qrAmount || ""}
                    onChange={(e) => {
                      const qr = parseFloat(e.target.value) || 0;
                      setQrAmount(qr);
                      setCashAmount(Math.max(0, orderTotal - qr));
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className="flex-1 border rounded px-3 py-2"
                    step="0.50"
                    min="0"
                    max={orderTotal}
                    style={{ color: 'rgb(0,0,0)', fontWeight: '600', fontSmoothing: 'antialiased' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(107,114,128)', fontWeight: '600' }}>Bs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(55,65,81)', fontWeight: '700' }}>
                  Pago Efectivo
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign size={20} className="text-green-600" />
                  <input
                    type="number"
                    value={cashAmount || ""}
                    onChange={(e) => {
                      const cash = parseFloat(e.target.value) || 0;
                      setCashAmount(cash);
                      setQrAmount(Math.max(0, orderTotal - cash));
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className="flex-1 border rounded px-3 py-2"
                    step="0.50"
                    min="0"
                    max={orderTotal}
                    style={{ color: 'rgb(0,0,0)', fontWeight: '600', fontSmoothing: 'antialiased' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(107,114,128)', fontWeight: '600' }}>Bs</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgb(55,65,81)', fontWeight: '600' }}>Total configurado:</span>
                  <span className="font-medium" style={{ color: 'rgb(0,0,0)', fontWeight: '700' }}>
                    Bs {(qrAmount + cashAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgb(55,65,81)', fontWeight: '600' }}>Total pedido:</span>
                  <span className="font-medium" style={{ color: 'rgb(0,0,0)', fontWeight: '700' }}>
                    Bs {orderTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span style={{ color: 'rgb(0,0,0)', fontWeight: '800' }}>Diferencia:</span>
                  <span
                    style={{ 
                      color: Math.abs(qrAmount + cashAmount - orderTotal) < 0.01 ? 'rgb(22,163,74)' : 'rgb(220,38,38)', 
                      fontWeight: '800' 
                    }}
                  >
                    Bs {(qrAmount + cashAmount - orderTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            style={{ fontSmoothing: 'antialiased' }}
          >
            <span style={{ color: 'rgb(255,255,255)', fontWeight: '700' }}>Cancelar</span>
          </button>
          <button
            onClick={handlePayment}
            disabled={
              (!selectedMethod && !showMixedPayment) ||
              !activeCashRegister ||
              loading ||
              (showMixedPayment &&
                Math.abs(qrAmount + cashAmount - orderTotal) > 0.01)
            }
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSmoothing: 'antialiased' }}
          >
            <span style={{ color: 'rgb(255,255,255)', fontWeight: '700' }}>
              {loading ? "Procesando..." : "Completar Pago"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

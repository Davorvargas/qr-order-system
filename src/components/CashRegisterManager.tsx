"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import { User } from "@supabase/supabase-js";
import { Plus, X, FileText, CheckCircle } from "lucide-react";


type CashRegister = Database["public"]["Tables"]["cash_registers"]["Row"];

interface CashRegisterManagerProps {
  restaurantId: string;
}

export default function CashRegisterManager({
  restaurantId,
}: CashRegisterManagerProps) {
  const supabase = createClient();
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [activeCashRegister, setActiveCashRegister] =
    useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCashRegisters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cash_registers")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("opened_at", { ascending: false });

      if (error) throw error;

      setCashRegisters(data || []);

      // Buscar caja activa
      const active = data?.find((cr) => cr.status === "open");
      setActiveCashRegister(active || null);
    } catch (error) {
      console.error("Error fetching cash registers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashRegisters();
    fetchUser();
  }, [restaurantId]);

  const openCashRegister = async () => {
    if (!openingAmount || parseFloat(openingAmount) < 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    try {
      const { error } = await supabase
        .from("cash_registers")
        .insert({
          restaurant_id: restaurantId,
          opening_amount: parseFloat(openingAmount),
          opened_by: user?.id,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      setOpeningAmount("");
      setIsOpenModalOpen(false);
      await fetchCashRegisters();
      alert("Caja abierta exitosamente");
    } catch (error) {
      console.error("Error opening cash register:", error);
      alert("Error al abrir la caja");
    }
  };

  const closeCashRegister = async () => {
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    if (!activeCashRegister) return;

    try {
      // Calcular totales
      const { data: payments } = await supabase
        .from("order_payments")
        .select("*")
        .eq("cash_register_id", activeCashRegister.id);

      const totalQr =
        payments
          ?.filter((p) => p.payment_method === "qr")
          .reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalCard =
        payments
          ?.filter((p) => p.payment_method === "card")
          .reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalCash =
        payments
          ?.filter((p) => p.payment_method === "cash")
          .reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalSales = totalQr + totalCard + totalCash;
      const difference =
        parseFloat(closingAmount) -
        (activeCashRegister.opening_amount + totalCash);

      const { error } = await supabase
        .from("cash_registers")
        .update({
          closed_at: new Date().toISOString(),
          closing_amount: parseFloat(closingAmount),
          total_sales: totalSales,
          total_qr: totalQr,
          total_card: totalCard,
          total_cash: totalCash,
          difference: difference,
          status: "closed",
          closed_by: user?.id,
        })
        .eq("id", activeCashRegister.id);

      if (error) throw error;

      setClosingAmount("");
      setIsCloseModalOpen(false);
      await fetchCashRegisters();
      alert("Caja cerrada exitosamente");
    } catch (error) {
      console.error("Error closing cash register:", error);
      alert("Error al cerrar la caja");
    }
  };

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estado de caja */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Control de Caja
            </h2>
            <p className="text-gray-600">
              Gestión de apertura y cierre de caja diaria
            </p>
          </div>

          {activeCashRegister ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-semibold">Caja Abierta</span>
              </div>
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Caja
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Abrir Caja</span>
            </button>
          )}
        </div>

        {activeCashRegister && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monto de Apertura</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatCurrency(activeCashRegister.opening_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Abierta por</p>
                <p className="text-lg font-semibold text-blue-900">
                  {activeCashRegister.opened_by || "Usuario"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Apertura</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatDate(activeCashRegister.opened_at)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de cajas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Historial de Cajas
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {cashRegisters.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay cajas registradas</p>
            </div>
          ) : (
            cashRegisters.map((cashRegister) => (
              <div key={cashRegister.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {cashRegister.status === "open" ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="font-semibold">Abierta</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <X size={20} />
                        <span className="font-semibold">Cerrada</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(cashRegister.opened_at)}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Apertura</p>
                    <p className="font-semibold">
                      {formatCurrency(cashRegister.opening_amount)}
                    </p>
                  </div>
                </div>

                {cashRegister.status === "closed" && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Ventas Totales</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(cashRegister.total_sales)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">QR</p>
                      <p className="font-semibold">
                        {formatCurrency(cashRegister.total_qr)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tarjeta</p>
                      <p className="font-semibold">
                        {formatCurrency(cashRegister.total_card)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efectivo</p>
                      <p className="font-semibold">
                        {formatCurrency(cashRegister.total_cash)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Abrir Caja */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Abrir Caja</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de Apertura (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsOpenModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={openCashRegister}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Abrir Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cerrar Caja */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cerrar Caja</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto en Caja (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCloseModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={closeCashRegister}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

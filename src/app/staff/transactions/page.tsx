// src/app/staff/transactions/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import OrderDetailModal from "@/components/OrderDetailModal";

// --- TYPE DEFINITIONS ---
type Transaction = {
  id: number;
  created_at: string;
  customer_name: string;
  total_price: number | null;
  status: "completed" | "cancelled";
  source: "customer_qr" | "staff_placed"; // Add source field
};

type DateRangeOption =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "This Month"
  | "All Time";

// --- MAIN COMPONENT ---
export default function TransactionsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<DateRangeOption>("This Week");
  const [includeCancelled, setIncludeCancelled] = useState(false); // State for the filter
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // --- DATA FETCHING & AUTH ---
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [supabase, router]);

  useEffect(() => {
    if (!user) return; // Don't fetch until user is confirmed

    const fetchTransactions = async () => {
      setLoading(true);

      // Get current user's restaurant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) {
        setLoading(false);
        return;
      }

      // Determine which statuses to fetch based on the filter
      const statusesToFetch = includeCancelled
        ? ["completed", "cancelled"]
        : ["completed"];

      let query = supabase
        .from("orders")
        .select("id, created_at, customer_name, total_price, status, source") // Include source field
        .eq('restaurant_id', profile.restaurant_id) // Filter by restaurant
        .in("status", statusesToFetch) // Use 'in' filter
        .order("created_at", { ascending: false });

      // Apply date range filters
      const now = new Date();
      if (activeRange === "Today") {
        query = query
          .gte("created_at", startOfToday().toISOString())
          .lte("created_at", endOfToday().toISOString());
      } else if (activeRange === "Yesterday") {
        query = query
          .gte("created_at", startOfYesterday().toISOString())
          .lte("created_at", endOfYesterday().toISOString());
      } else if (activeRange === "This Week") {
        query = query
          .gte("created_at", startOfWeek(now, { weekStartsOn: 1 }).toISOString())
          .lte("created_at", endOfWeek(now, { weekStartsOn: 1 }).toISOString());
      } else if (activeRange === "This Month") {
        query = query
          .gte("created_at", startOfMonth(now).toISOString())
          .lte("created_at", endOfMonth(now).toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching transactions:", error.message);
      } else {
        setTransactions(data as Transaction[]);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [supabase, user, activeRange, includeCancelled]); // Add dependency

  // --- CALCULATE TOTALS ---
  // Memoize completed transactions to derive stats from
  const completedTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === "completed");
  }, [transactions]);

  const totalSales = useMemo(() => {
    return completedTransactions.reduce(
      (sum, t) => sum + (t.total_price ?? 0),
      0
    );
  }, [completedTransactions]);

  const dateRanges: DateRangeOption[] = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "All Time",
  ];

  const dateRangeLabels: Record<DateRangeOption, string> = {
    "Today": "Hoy",
    "Yesterday": "Ayer",
    "This Week": "Esta Semana",
    "This Month": "Este Mes", 
    "All Time": "Todo el Tiempo",
  };

  // --- HANDLER FUNCTIONS ---
  const handleOrderClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
  };

  // --- RENDER ---
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Transacciones</h1>
            <p className="text-sm text-gray-600 mt-1">
              Haz click en cualquier transacción para ver los detalles
            </p>
          </div>
          {/* Filter for cancelled orders */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="include-cancelled"
              checked={includeCancelled}
              onChange={(e) => setIncludeCancelled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="include-cancelled"
              className="ml-2 block text-sm font-medium text-gray-900"
            >
              Incluir Cancelados
            </label>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="mb-6">
          <div className="flex items-center bg-gray-200 rounded-lg p-1">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeRange === range
                    ? "bg-white text-gray-800 shadow-sm"
                    : "bg-transparent text-gray-600 hover:bg-white/50"
                }`}
              >
                {dateRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Ventas Totales</h3>
            <p className="text-3xl font-bold mt-1">Bs {totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total de Transacciones
            </h3>
            <p className="text-3xl font-bold mt-1">
              {completedTransactions.length}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID Orden
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Origen
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Cargando transacciones...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleOrderClick(t.id)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      t.status === "cancelled" ? "bg-red-50 hover:bg-red-100" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      #{t.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(t.created_at), "MMM d, yyyy, h:mm a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          t.source === "customer_qr"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {t.source === "customer_qr" ? "Cliente QR" : "Staff Dashboard"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          t.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t.status === "completed" ? "Completado" : "Cancelado"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono ${
                        t.status === "cancelled"
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      Bs {t.total_price?.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No se encontraron transacciones para el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          orderId={selectedOrderId}
        />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";

interface Analytics {
  revenue_today?: number;
  revenue_yesterday?: number;
  orders_today?: number;
  orders_yesterday?: number;
  total_customers?: number;
  weekly_data?: Array<{
    day: string;
    date: string;
    revenue: number;
    orders: number;
    cost: number;
  }>;
  top_item_today?: {
    name: string;
    quantity: number;
  };
  top_items?: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  low_items?: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  payment_methods?: Array<{
    method: string;
    total: number;
    count: number;
  }>;
  profit_matrix?: {
    stars: Array<{
      name: string;
      quantity: number;
      profit_margin: number;
    }>;
    gems: Array<{
      name: string;
      quantity: number;
      profit_margin: number;
    }>;
    popular: Array<{
      name: string;
      quantity: number;
      profit_margin: number;
    }>;
    problems: Array<{
      name: string;
      quantity: number;
      profit_margin: number;
    }>;
  };
}

interface DashboardContentProps {
  initialAnalytics: Analytics | null;
  restaurantId: string;
}

export default function DashboardContent({
  initialAnalytics,
  restaurantId,
}: DashboardContentProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(
    initialAnalytics
  );
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Normalizar tipos de weekly_data para asegurar que Tooltip reciba números
  useEffect(() => {
    if (!initialAnalytics?.weekly_data) return;
    const normalized = initialAnalytics.weekly_data.map((d) => ({
      ...d,
      revenue: Number(d.revenue ?? 0),
      orders: Number(d.orders ?? 0),
      cost: Number(d.cost ?? 0),
    }));
    setAnalytics({ ...initialAnalytics, weekly_data: normalized });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        "get_dashboard_analytics_weekly",
        {
          p_restaurant_id: restaurantId,
        }
      );

      if (error) throw error;
      const normalizedWeekly = Array.isArray((data as any)?.weekly_data)
        ? (data as any).weekly_data.map((d: any) => ({
            ...d,
            revenue: Number(d?.revenue ?? 0),
            orders: Number(d?.orders ?? 0),
            cost: Number(d?.cost ?? 0),
          }))
        : [];
      setAnalytics({ ...(data as any), weekly_data: normalizedWeekly });
    } catch (error) {
      console.error("Error refreshing analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular cambios porcentuales y ticket promedio
  const revenueChange =
    analytics?.revenue_today && analytics?.revenue_yesterday
      ? ((analytics.revenue_today - analytics.revenue_yesterday) /
          analytics.revenue_yesterday) *
        100
      : 0;

  const ordersChange =
    analytics?.orders_today && analytics?.orders_yesterday
      ? ((analytics.orders_today - analytics.orders_yesterday) /
          analytics.orders_yesterday) *
        100
      : 0;

  // Obtener el ítem más pedido de hoy
  const mostOrderedToday = analytics?.top_item_today || null;

  // Para comparar con ayer, necesitaríamos datos adicionales (por ahora usamos 0)
  const mostOrderedChange = 0; // Placeholder - necesitaríamos datos de ayer para calcular


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Bienvenido de vuelta, aquí tienes un resumen de tu negocio
            </p>
          </div>
          <button
            onClick={refreshAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Calendar size={16} />
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pedidos de hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-100 rounded-lg">
              <ShoppingBag className="text-gray-700" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pedidos de hoy</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics?.orders_today || 0}
              </p>
              <div className="flex items-center justify-end mt-1">
                {ordersChange >= 0 ? (
                  <TrendingUp className="text-green-500 mr-1" size={14} />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" size={14} />
                )}
                <span
                  className={`text-sm ${
                    ordersChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {ordersChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ventas de hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-100 rounded-lg">
              <DollarSign className="text-gray-700" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ventas de hoy</p>
              <p className="text-3xl font-bold text-gray-900">
                Bs {analytics?.revenue_today?.toFixed(0) || "0"}
              </p>
              <div className="flex items-center justify-end mt-1">
                {revenueChange >= 0 ? (
                  <TrendingUp className="text-green-500 mr-1" size={14} />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" size={14} />
                )}
                <span
                  className={`text-sm ${
                    revenueChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {revenueChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Más pedido hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Target className="text-gray-700" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Más pedido hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {mostOrderedToday ? 
                  `${mostOrderedToday.name}` : 
                  "Sin datos"
                }
              </p>
              <div className="flex items-center justify-end mt-1">
                <span className="text-sm text-gray-400">
                  {mostOrderedToday ? `${mostOrderedToday.quantity} pedidos` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ingresos y Gastos
              </h3>
              <p className="text-sm text-gray-500">Últimos 7 días</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                Bs{" "}
                {analytics?.weekly_data
                  ?.reduce((sum, day) => sum + day.revenue, 0)
                  ?.toFixed(0) || "0"}
              </p>
              <p className="text-sm text-gray-500">Últimos 7 días</p>
            </div>
          </div>
          {analytics?.weekly_data && analytics.weekly_data.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={(() => {
                  const chartData = [...analytics.weekly_data].reverse();
                    return chartData;
                })()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickFormatter={(value) => {
                    const cleanDay = value?.toString().trim();
                    const dayMap: Record<string, string> = {
                      'Monday': 'Lun',
                      'Tuesday': 'Mar',
                      'Wednesday': 'Mié',
                      'Thursday': 'Jue',
                      'Friday': 'Vie',
                      'Saturday': 'Sáb',
                      'Sunday': 'Dom',
                    };
                    return dayMap[cleanDay] || cleanDay?.substring(0, 3) || "";
                  }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: "#000", strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    
                    const data = payload[0]?.payload;
                    if (!data) return null;

                    const revenue = Number(data.revenue || 0);
                    const cost = Number(data.cost || 0);
                    const profit = revenue - cost;

                    const dayMap: Record<string, string> = {
                      'Monday': 'Lunes',
                      'Tuesday': 'Martes',
                      'Wednesday': 'Miércoles',
                      'Thursday': 'Jueves',
                      'Friday': 'Viernes',
                      'Saturday': 'Sábado',
                      'Sunday': 'Domingo'
                    };

                    // Limpiar el label y mapear correctamente
                    const cleanLabel = (label as string)?.toString().trim();
                    const dayName = dayMap[cleanLabel] || cleanLabel;

                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-gray-900 mb-3 text-center border-b pb-2">
                          {dayName}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ingresos:</span>
                            <span className="font-semibold text-amber-600">
                              Bs {revenue.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Gastos:</span>
                            <span className="font-semibold text-gray-600">
                              Bs {cost.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t pt-2">
                            <span className="text-gray-700 font-medium">Ganancia:</span>
                            <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Bs {profit.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#f59e0b" }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="cost"
                  stroke="#000"
                  strokeWidth={3}
                  dot={{ fill: "#000", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#000" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-200 flex items-center justify-center text-gray-500">
              No hay datos de ingresos y gastos disponibles
            </div>
          )}
        </div>

        {/* Orders Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumen de Pedidos
            </h3>
            <span className="text-sm text-gray-500">Últimos 7 días</span>
          </div>
          {analytics?.weekly_data && analytics.weekly_data.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={(() => {
                  const chartData = [...analytics.weekly_data].reverse();
                    return chartData;
                })()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickFormatter={(value) => {
                    const cleanDay = value?.toString().trim();
                    const dayMap: Record<string, string> = {
                      'Monday': 'Lun',
                      'Tuesday': 'Mar',
                      'Wednesday': 'Mié',
                      'Thursday': 'Jue',
                      'Friday': 'Vie',
                      'Saturday': 'Sáb',
                      'Sunday': 'Dom',
                    };
                    return dayMap[cleanDay] || cleanDay?.substring(0, 3) || "";
                  }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.1)" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    color: "#000",
                    padding: "8px",
                  }}
                  formatter={(value, name) => [`${value} órdenes`, 'Pedidos']}
                  labelFormatter={(label) => {
                    const cleanDay = label?.toString().trim();
                    const dayMap: Record<string, string> = {
                      'Monday': 'Lunes',
                      'Tuesday': 'Martes',
                      'Wednesday': 'Miércoles',
                      'Thursday': 'Jueves',
                      'Friday': 'Viernes',
                      'Saturday': 'Sábado',
                      'Sunday': 'Domingo'
                    };
                    return dayMap[cleanDay] || cleanDay;
                  }}
                />
                <Bar dataKey="orders" fill="#000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-200 flex items-center justify-center text-gray-500">
              No hay datos de órdenes disponibles
            </div>
          )}
        </div>
      </div>

      {/* Top Categories and Order Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Platos Más Vendidos
            </h3>
            <span className="text-sm text-gray-500">Últimos 7 días</span>
          </div>
          {analytics?.top_items && analytics.top_items.length > 0 ? (
            <div className="space-y-2">
              {analytics.top_items.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                      <span className="text-xs font-bold text-green-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-600 h-1 rounded-full" 
                          style={{ 
                            width: `${Math.min((item.quantity / (analytics.top_items[0]?.quantity || 1)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right ml-3">
                    <div>
                      <p className="text-sm font-bold text-green-600">{item.quantity}</p>
                      <p className="text-xs text-gray-500">unidades</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Bs {item.revenue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">ingresos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              No hay datos de platos disponibles
            </div>
          )}
        </div>

        {/* Worst Performing Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Platos Menos Vendidos
            </h3>
            <span className="text-sm text-gray-500">Últimos 7 días</span>
          </div>
          {analytics?.low_items && analytics.low_items.length > 0 ? (
            <div className="space-y-2">
              {analytics.low_items.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                      <span className="text-xs font-bold text-red-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-red-600 h-1 rounded-full" 
                          style={{ 
                            width: `${analytics.low_items ? Math.min((item.quantity / Math.max(...analytics.low_items.map(i => i.quantity))) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right ml-3">
                    <div>
                      <p className="text-sm font-bold text-red-600">{item.quantity}</p>
                      <p className="text-xs text-gray-500">unidades</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Bs {item.revenue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">ingresos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <AlertTriangle className="mx-auto mb-2 text-gray-400" size={24} />
              <p>No hay datos de platos menos vendidos</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Sources Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Fuentes de Transacciones
          </h3>
          <span className="text-sm text-gray-500">Últimos 7 días</span>
        </div>
        {analytics?.transaction_sources && analytics.transaction_sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.transaction_sources.map((source, index) => {
              const total = analytics.transaction_sources?.reduce((sum, s) => sum + s.total_revenue, 0) || 0;
              const percentage = total > 0 ? (source.total_revenue / source.transaction_count) * 100 : 0;
              const revenuePercentage = total > 0 ? (source.total_revenue / total) * 100 : 0;
              
              return (
                <div key={index} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{source.source_type}</h4>
                        <p className="text-sm text-gray-500">{revenuePercentage.toFixed(1)}% del total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">
                        Bs {source.total_revenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Ingresos totales</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">
                        {source.transaction_count}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Transacciones</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Promedio por transacción:</span>
                      <span className="font-semibold text-gray-900">
                        Bs {source.transaction_count > 0 ? (source.total_revenue / source.transaction_count).toFixed(0) : 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Participación</span>
                      <span>{revenuePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                        style={{ width: `${revenuePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay datos de transacciones disponibles</p>
          </div>
        )}
      </div>

      {/* Profit Matrix Scatter Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Matriz de Rentabilidad
              </h3>
              <p className="text-sm text-gray-600">
                Análisis de productos por ventas vs margen de ganancia • Últimos 30 días
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600">Estrellas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Joyas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">Populares</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Problemas</span>
              </div>
            </div>
          </div>
        </div>

        {analytics?.profit_matrix && (() => {
          // Unificar en una sola serie con metadatos para tooltip/colores por punto
          const allItems = [
            ...analytics.profit_matrix.stars.map(item => ({ ...item, category: 'Estrellas', color: '#10b981' })),
            ...analytics.profit_matrix.gems.map(item => ({ ...item, category: 'Joyas', color: '#3b82f6' })),
            ...analytics.profit_matrix.popular.map(item => ({ ...item, category: 'Populares', color: '#f59e0b' })),
            ...analytics.profit_matrix.problems.map(item => ({ ...item, category: 'Problemas', color: '#ef4444' }))
          ];
          
          if (allItems.length === 0) {
            return (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Target className="text-gray-400" size={20} />
                </div>
                <p className="text-gray-500 text-sm">No hay datos disponibles para este período</p>
              </div>
            );
          }

          const avgSales = allItems.reduce((sum, item) => sum + item.quantity, 0) / allItems.length;
          const avgMargin = allItems.reduce((sum, item) => sum + item.profit_margin, 0) / allItems.length;
          const maxSales = Math.max(...allItems.map(item => item.quantity));
          const maxMargin = Math.max(...allItems.map(item => item.profit_margin));
          
          return (
            <div className="p-6">
              <div className="relative">
                <ResponsiveContainer width="100%" height={420}>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      dataKey="quantity" 
                      domain={[0, Math.ceil(maxSales * 1.1)]}
                      axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                      tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      label={{ 
                        value: 'Número de Ventas', 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 }
                      }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="profit_margin" 
                      domain={[0, Math.ceil(maxMargin * 1.1)]}
                      axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                      tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      label={{ 
                        value: 'Margen (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 }
                      }}
                    />
                    
                    <ReferenceLine 
                      x={avgSales} 
                      stroke="#94a3b8" 
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                    <ReferenceLine 
                      y={avgMargin} 
                      stroke="#94a3b8" 
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />

                    <Tooltip 
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const data = payload[0]?.payload as { name: string; quantity: number; profit_margin: number; category: string; color: string };
                        if (!data) return null;
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                              <p className="font-medium text-gray-900">{data.name}</p>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Categoría:</span>
                                <span className="font-medium">{data.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Ventas:</span>
                                <span className="font-medium">{data.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Margen:</span>
                                <span className="font-medium">{Math.round(data.profit_margin)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    
                    {/* Serie única con colores por punto */}
                    <Scatter
                      name="Productos"
                      data={allItems}
                      shape="circle"
                    >
                      {allItems.map((pt, idx) => (
                        <Cell key={`pt-${idx}`} fill={pt.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>

                {/* Quadrant Labels - Each centered in its own quadrant */}
                
                {/* Top Left Quadrant - Joyas (Alto margen, Pocas ventas) */}
                <div className="absolute top-2 left-1/4 transform -translate-x-1/2">
                  <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">
                    Joyas
                  </div>
                </div>
                
                {/* Top Right Quadrant - Estrellas (Alto margen, Altas ventas) */}
                <div className="absolute top-2 right-1/4 transform translate-x-1/2">
                  <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
                    Estrellas
                  </div>
                </div>
                
                {/* Bottom Left Quadrant - Problemas (Bajo margen, Pocas ventas) */}
                <div className="absolute bottom-24 left-1/4 transform -translate-x-1/2">
                  <div className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded">
                    Problemas
                  </div>
                </div>
                
                {/* Bottom Right Quadrant - Populares (Bajo margen, Altas ventas) */}
                <div className="absolute bottom-24 right-1/4 transform translate-x-1/2">
                  <div className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded">
                    Populares
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}




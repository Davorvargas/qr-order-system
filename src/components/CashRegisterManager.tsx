"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import { User } from "@supabase/supabase-js";
import {
  Plus,
  X,
  FileText,
  CheckCircle,
  Printer,
  Calculator,
  AlertTriangle,
} from "lucide-react";

type CashRegister = Database["public"]["Tables"]["cash_registers"]["Row"];

interface CashRegisterManagerProps {
  restaurantId: string;
}

interface ClosingReport {
  openingAmount: number;
  closingAmount: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  totalSales: number;
  totalQr: number;
  totalCard: number;
  totalCash: number;
  transactionCount: number;
  completedOrders: number;
  cancelledOrders: number;
  openingTime: string;
  closingTime: string;
  cashierName: string;
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [closingReport, setClosingReport] = useState<ClosingReport | null>(
    null
  );
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isHistoricalReportModalOpen, setIsHistoricalReportModalOpen] =
    useState(false);
  const [selectedHistoricalCashRegister, setSelectedHistoricalCashRegister] =
    useState<CashRegister | null>(null);

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

  const generateClosingReport = async (
    closingAmount: number
  ): Promise<ClosingReport> => {
    if (!activeCashRegister) throw new Error("No hay caja activa");

    // Obtener pagos de la caja
    const { data: payments } = await supabase
      .from("order_payments")
      .select("*")
      .eq("cash_register_id", activeCashRegister.id);

    // Calcular totales por método de pago
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

    // Obtener estadísticas de órdenes
    const { data: orders } = await supabase
      .from("orders")
      .select("status")
      .eq("restaurant_id", restaurantId)
      .eq("archived", false);

    const completedOrders =
      orders?.filter((o) => o.status === "completed").length || 0;
    const cancelledOrders =
      orders?.filter((o) => o.status === "cancelled").length || 0;

    // Calcular diferencias
    const expectedCash = activeCashRegister.opening_amount + totalCash;
    const actualCash = closingAmount;
    const difference = actualCash - expectedCash;

    // Obtener nombre del cajero
    const { data: cashierProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user?.id)
      .single();

    return {
      openingAmount: activeCashRegister.opening_amount,
      closingAmount: actualCash,
      expectedCash,
      actualCash,
      difference,
      totalSales,
      totalQr,
      totalCard,
      totalCash,
      transactionCount: payments?.length || 0,
      completedOrders,
      cancelledOrders,
      openingTime: activeCashRegister.opened_at,
      closingTime: new Date().toISOString(),
      cashierName: cashierProfile?.full_name || user?.email || "Usuario",
    };
  };

  const handleCloseCashRegister = async () => {
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    if (!activeCashRegister) return;

    try {
      // Verificar si hay pedidos pendientes o en proceso antes de cerrar
      const { data: activeOrders, error: activeOrdersError } = await supabase
        .from("orders")
        .select("id, status, customer_name, table:tables(table_number)")
        .eq("restaurant_id", restaurantId)
        .eq("archived", false)
        .in("status", ["pending", "in_progress"]);

      if (activeOrdersError) {
        console.error("Error checking active orders:", activeOrdersError);
        alert("Error al verificar pedidos activos");
        return;
      }

      if (activeOrders && activeOrders.length > 0) {
        const ordersList = activeOrders
          .map(
            (order) =>
              `• Pedido #${order.id} (${order.customer_name}) - ${
                order.status === "pending" ? "Pendiente" : "En Proceso"
              }`
          )
          .join("\n");

        alert(
          `No se puede cerrar la caja. Hay ${activeOrders.length} pedido(s) que requieren atención:\n\n${ordersList}\n\nPor favor completa o cancela estos pedidos antes de cerrar la caja.`
        );
        setIsCloseModalOpen(false);
        return;
      }

      // Generar reporte de cierre
      setGeneratingReport(true);
      const report = await generateClosingReport(parseFloat(closingAmount));
      setClosingReport(report);
      setGeneratingReport(false);
      setIsCloseModalOpen(false);
      setIsReportModalOpen(true);
    } catch (error) {
      console.error("Error generating closing report:", error);
      alert("Error al generar el reporte de cierre");
      setGeneratingReport(false);
    }
  };

  const confirmCloseCashRegister = async () => {
    if (!closingReport || !activeCashRegister) return;

    try {
      // Actualizar caja como cerrada
      const { error } = await supabase
        .from("cash_registers")
        .update({
          closed_at: new Date().toISOString(),
          closing_amount: closingReport.closingAmount,
          total_sales: closingReport.totalSales,
          total_qr: closingReport.totalQr,
          total_card: closingReport.totalCard,
          total_cash: closingReport.totalCash,
          difference: closingReport.difference,
          status: "closed",
          closed_by: user?.id,
        })
        .eq("id", activeCashRegister.id);

      if (error) throw error;

      // Archivar pedidos completados
      const { error: archiveError } = await supabase
        .from("orders")
        .update({ archived: true })
        .eq("restaurant_id", restaurantId)
        .eq("status", "completed");

      if (archiveError) {
        console.error("Error archivando pedidos completados:", archiveError);
      }

      setClosingAmount("");
      setIsReportModalOpen(false);
      setClosingReport(null);
      await fetchCashRegisters();
      alert(
        "Caja cerrada exitosamente. Los pedidos completados han sido archivados."
      );
    } catch (error) {
      console.error("Error closing cash register:", error);
      alert("Error al cerrar la caja");
    }
  };

  // Nueva función para imprimir en formato 80mm (impresora térmica)
  const printThermalReport = async () => {
    if (!closingReport) return;

    try {
      // Crear un reporte especial para impresora térmica
      const thermalReport = {
        type: "cash_register_report",
        data: {
          cashierName: closingReport.cashierName,
          openingTime: closingReport.openingTime,
          closingTime: closingReport.closingTime,
          openingAmount: closingReport.openingAmount,
          closingAmount: closingReport.closingAmount,
          totalSales: closingReport.totalSales,
          totalQr: closingReport.totalQr,
          totalCard: closingReport.totalCard,
          totalCash: closingReport.totalCash,
          transactionCount: closingReport.transactionCount,
          completedOrders: closingReport.completedOrders,
          cancelledOrders: closingReport.cancelledOrders,
          expectedCash: closingReport.expectedCash,
          actualCash: closingReport.actualCash,
          difference: closingReport.difference,
          isHistorical: selectedHistoricalCashRegister !== null,
        },
      };

      // Enviar a la API de impresión térmica
      const response = await fetch("/api/print-cash-register-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(thermalReport),
      });

      if (response.ok) {
        alert("Reporte enviado a la impresora térmica exitosamente");
      } else {
        const error = await response.json();
        alert(`Error al imprimir: ${error.error}`);
      }
    } catch (error) {
      console.error("Error al imprimir reporte térmico:", error);
      alert("Error al enviar el reporte a la impresora");
    }
  };

  // Nueva función para generar PDF
  const generatePDF = async () => {
    if (!closingReport) return;

    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import("jspdf");
      const html2canvas = await import("html2canvas");

      // Crear un elemento temporal para el reporte
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "800px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.padding = "20px";
      tempDiv.style.fontFamily = "Arial, sans-serif";
      tempDiv.style.color = "#333";
      tempDiv.style.fontSize = "12px";
      tempDiv.style.lineHeight = "1.4";

      // Generar el contenido HTML del reporte
      const reportData = {
        cashierName: closingReport.cashierName,
        openingTime: closingReport.openingTime,
        closingTime: closingReport.closingTime,
        openingAmount: closingReport.openingAmount,
        closingAmount: closingReport.closingAmount,
        totalSales: closingReport.totalSales,
        totalQr: closingReport.totalQr,
        totalCard: closingReport.totalCard,
        totalCash: closingReport.totalCash,
        transactionCount: closingReport.transactionCount,
        completedOrders: closingReport.completedOrders,
        cancelledOrders: closingReport.cancelledOrders,
        expectedCash: closingReport.expectedCash,
        actualCash: closingReport.actualCash,
        difference: closingReport.difference,
        isHistorical: selectedHistoricalCashRegister !== null,
        restaurantName: "Restaurante Senderos",
      };

      const formatCurrency = (amount: number) => `Bs. ${amount.toFixed(2)}`;
      const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString("es-BO");

      tempDiv.innerHTML = `
        <div style="text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">REPORTE DE CIERRE DE CAJA</div>
          <div style="font-size: 14px; color: #7f8c8d; margin-bottom: 5px;">${
            reportData.restaurantName
          }</div>
          <div style="font-size: 14px; color: #7f8c8d;">${new Date().toLocaleDateString(
            "es-BO"
          )} - ${new Date().toLocaleTimeString("es-BO")}</div>
        </div>

        <div style="margin: 25px 0;">
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 15px;">INFORMACIÓN GENERAL</div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Cajero:</span>
            <span style="text-align: right; font-weight: 500;">${
              reportData.cashierName
            }</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Hora de Apertura:</span>
            <span style="text-align: right; font-weight: 500;">${formatDate(
              reportData.openingTime
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Hora de Cierre:</span>
            <span style="text-align: right; font-weight: 500;">${formatDate(
              reportData.closingTime
            )}</span>
          </div>
        </div>

        <div style="margin: 25px 0;">
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 15px;">RESUMEN DE VENTAS</div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Ventas Totales:</span>
            <span style="text-align: right; font-weight: 500;">${formatCurrency(
              reportData.totalSales
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Transacciones:</span>
            <span style="text-align: right; font-weight: 500;">${
              reportData.isHistorical
                ? "No disponible"
                : reportData.transactionCount
            }</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Pedidos Completados:</span>
            <span style="text-align: right; font-weight: 500;">${
              reportData.isHistorical
                ? "No disponible"
                : reportData.completedOrders
            }</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Pedidos Cancelados:</span>
            <span style="text-align: right; font-weight: 500;">${
              reportData.isHistorical
                ? "No disponible"
                : reportData.cancelledOrders
            }</span>
          </div>
        </div>

        <div style="margin: 25px 0;">
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 15px;">DESGLOSE POR MÉTODO DE PAGO</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
            <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #27ae60;">${formatCurrency(
                reportData.totalCash
              )}</div>
              <div style="font-size: 12px; color: #6c757d;">Efectivo</div>
            </div>
            <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #3498db;">${formatCurrency(
                reportData.totalQr
              )}</div>
              <div style="font-size: 12px; color: #6c757d;">QR</div>
            </div>
            <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #9b59b6;">${formatCurrency(
                reportData.totalCard
              )}</div>
              <div style="font-size: 12px; color: #6c757d;">Tarjeta</div>
            </div>
          </div>
        </div>

        <div style="margin: 25px 0;">
          <div style="font-size: 18px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 15px;">CONTROL DE EFECTIVO</div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Monto de Apertura:</span>
            <span style="text-align: right; font-weight: 500;">${formatCurrency(
              reportData.openingAmount
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Ventas en Efectivo:</span>
            <span style="text-align: right; font-weight: 500;">${formatCurrency(
              reportData.totalCash
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Efectivo Esperado:</span>
            <span style="text-align: right; font-weight: 500;">${formatCurrency(
              reportData.expectedCash
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0;">
            <span style="font-weight: bold; color: #34495e;">Efectivo Real:</span>
            <span style="text-align: right; font-weight: 500;">${formatCurrency(
              reportData.actualCash
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; font-size: 16px; font-weight: bold; border-top: 2px solid #2c3e50; padding-top: 15px; margin-top: 15px;">
            <span style="font-weight: bold; color: #34495e;">DIFERENCIA:</span>
            <span style="text-align: right; font-weight: bold; color: ${
              reportData.difference >= 0 ? "#27ae60" : "#e74c3c"
            };">
              ${reportData.difference >= 0 ? "+" : ""}${formatCurrency(
        reportData.difference
      )}
            </span>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 20px;">
          <p>Reporte generado automáticamente por el sistema QR Order</p>
          <p>Firma del cajero: _________________________</p>
          ${
            reportData.isHistorical
              ? '<p style="color: #f39c12; font-weight: bold;">⚠️ Reporte Histórico - Algunos datos pueden estar limitados</p>'
              : ""
          }
        </div>
      `;

      // Agregar el elemento temporal al DOM
      document.body.appendChild(tempDiv);

      // Convertir el HTML a canvas
      const canvas = await html2canvas.default(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Remover el elemento temporal
      document.body.removeChild(tempDiv);

      // Crear el PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Agregar la primera página
      pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generar nombre del archivo
      const fileName = `reporte-cierre-caja-${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Descargar el PDF
      pdf.save(fileName);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor, intenta de nuevo.");
    }
  };

  const generateHistoricalReport = async (
    cashRegister: CashRegister
  ): Promise<ClosingReport> => {
    // Obtener nombre del cajero que cerró la caja
    const { data: cashierProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", cashRegister.closed_by)
      .single();

    // Para cierres históricos, usamos los datos guardados
    return {
      openingAmount: cashRegister.opening_amount,
      closingAmount: cashRegister.closing_amount || 0,
      expectedCash:
        cashRegister.opening_amount + (cashRegister.total_cash || 0),
      actualCash: cashRegister.closing_amount || 0,
      difference: cashRegister.difference || 0,
      totalSales: cashRegister.total_sales || 0,
      totalQr: cashRegister.total_qr || 0,
      totalCard: cashRegister.total_card || 0,
      totalCash: cashRegister.total_cash || 0,
      transactionCount: 0, // No disponible en cierres históricos
      completedOrders: 0, // No disponible en cierres históricos
      cancelledOrders: 0, // No disponible en cierres históricos
      openingTime: cashRegister.opened_at,
      closingTime: cashRegister.closed_at || new Date().toISOString(),
      cashierName: cashierProfile?.full_name || "Usuario",
    };
  };

  const handleHistoricalReport = async (cashRegister: CashRegister) => {
    try {
      setGeneratingReport(true);
      const report = await generateHistoricalReport(cashRegister);
      setClosingReport(report);
      setSelectedHistoricalCashRegister(cashRegister);
      setGeneratingReport(false);
      setIsHistoricalReportModalOpen(true);
    } catch (error) {
      console.error("Error generating historical report:", error);
      alert("Error al generar el reporte histórico");
      setGeneratingReport(false);
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
                    <div className="md:col-span-4 mt-2">
                      <button
                        onClick={() => handleHistoricalReport(cashRegister)}
                        disabled={generatingReport}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <FileText size={14} />
                        <span>Ver Reporte Detallado</span>
                      </button>
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
                  onClick={handleCloseCashRegister}
                  disabled={generatingReport}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {generatingReport ? "Generando..." : "Generar Reporte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reporte de Cierre */}
      {isReportModalOpen && closingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Reporte de Cierre de Caja
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={printThermalReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  title="Imprimir en impresora térmica 80mm"
                >
                  <Printer size={16} />
                  <span>Imprimir 80mm</span>
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  title="Descargar como PDF"
                >
                  <FileText size={16} />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Información General */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calculator size={16} className="mr-2" />
                  Información General
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cajero:</span>
                    <span className="font-medium">
                      {closingReport.cashierName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apertura:</span>
                    <span>
                      {new Date(closingReport.openingTime).toLocaleString(
                        "es-BO"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cierre:</span>
                    <span>
                      {new Date(closingReport.closingTime).toLocaleString(
                        "es-BO"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen de Ventas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Resumen de Ventas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ventas Totales:</span>
                    <span className="font-medium text-green-600">
                      Bs {closingReport.totalSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transacciones:</span>
                    <span>{closingReport.transactionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedidos Completados:</span>
                    <span className="text-green-600">
                      {closingReport.completedOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedidos Cancelados:</span>
                    <span className="text-red-600">
                      {closingReport.cancelledOrders}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desglose por Método de Pago */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">
                Desglose por Método de Pago
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    Bs {closingReport.totalCash.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Efectivo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    Bs {closingReport.totalQr.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">QR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    Bs {closingReport.totalCard.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Tarjeta</div>
                </div>
              </div>
            </div>

            {/* Control de Efectivo */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">Control de Efectivo</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Monto de Apertura:</span>
                  <span>Bs {closingReport.openingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas en Efectivo:</span>
                  <span>Bs {closingReport.totalCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efectivo Esperado:</span>
                  <span>Bs {closingReport.expectedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efectivo Real:</span>
                  <span>Bs {closingReport.actualCash.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>DIFERENCIA:</span>
                    <span
                      className={
                        closingReport.difference >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {closingReport.difference >= 0 ? "+" : ""}Bs{" "}
                      {closingReport.difference.toFixed(2)}
                    </span>
                  </div>
                  {closingReport.difference !== 0 && (
                    <div className="flex items-center mt-2 text-sm text-orange-600">
                      <AlertTriangle size={14} className="mr-1" />
                      {closingReport.difference > 0
                        ? "Sobrante en caja"
                        : "Faltante en caja"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCloseCashRegister}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Cierre de Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reporte Histórico */}
      {isHistoricalReportModalOpen &&
        closingReport &&
        selectedHistoricalCashRegister && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  Reporte Histórico de Cierre de Caja
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={printThermalReport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    title="Imprimir en impresora térmica 80mm"
                  >
                    <Printer size={16} />
                    <span>Imprimir 80mm</span>
                  </button>
                  <button
                    onClick={generatePDF}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    title="Descargar como PDF"
                  >
                    <FileText size={16} />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHistoricalReportModalOpen(false);
                      setClosingReport(null);
                      setSelectedHistoricalCashRegister(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Aviso de datos limitados */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle size={16} className="text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Reporte Histórico - Algunos datos pueden estar limitados
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Este cierre se realizó antes de la implementación del reporte
                  detallado. Algunas estadísticas como número de transacciones y
                  pedidos no están disponibles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Información General */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Calculator size={16} className="mr-2" />
                    Información General
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cajero:</span>
                      <span className="font-medium">
                        {closingReport.cashierName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Apertura:</span>
                      <span>
                        {new Date(closingReport.openingTime).toLocaleString(
                          "es-BO"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cierre:</span>
                      <span>
                        {new Date(closingReport.closingTime).toLocaleString(
                          "es-BO"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resumen de Ventas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Resumen de Ventas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ventas Totales:</span>
                      <span className="font-medium text-green-600">
                        Bs {closingReport.totalSales.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transacciones:</span>
                      <span className="text-gray-400">No disponible</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pedidos Completados:</span>
                      <span className="text-gray-400">No disponible</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pedidos Cancelados:</span>
                      <span className="text-gray-400">No disponible</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desglose por Método de Pago */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3">
                  Desglose por Método de Pago
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      Bs {closingReport.totalCash.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Efectivo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      Bs {closingReport.totalQr.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">QR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      Bs {closingReport.totalCard.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Tarjeta</div>
                  </div>
                </div>
              </div>

              {/* Control de Efectivo */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3">Control de Efectivo</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monto de Apertura:</span>
                    <span>Bs {closingReport.openingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas en Efectivo:</span>
                    <span>Bs {closingReport.totalCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Esperado:</span>
                    <span>Bs {closingReport.expectedCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Real:</span>
                    <span>Bs {closingReport.actualCash.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>DIFERENCIA:</span>
                      <span
                        className={
                          closingReport.difference >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {closingReport.difference >= 0 ? "+" : ""}Bs{" "}
                        {closingReport.difference.toFixed(2)}
                      </span>
                    </div>
                    {closingReport.difference !== 0 && (
                      <div className="flex items-center mt-2 text-sm text-orange-600">
                        <AlertTriangle size={14} className="mr-1" />
                        {closingReport.difference > 0
                          ? "Sobrante en caja"
                          : "Faltante en caja"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Cerrar */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsHistoricalReportModalOpen(false);
                    setClosingReport(null);
                    setSelectedHistoricalCashRegister(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

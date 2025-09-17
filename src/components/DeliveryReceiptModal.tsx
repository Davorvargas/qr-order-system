"use client";

import { useState } from "react";
import { X, Download } from "lucide-react";
import jsPDF from "jspdf";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    delivery_date: string;
    delivery_time: string;
    customer_nit_carnet?: string;
    customer_razon_social?: string;
    total_price: number;
    created_at: string;
  };
  orderItems: OrderItem[];
  restaurantInfo: {
    name: string;
    logo_url?: string;
    primary_color: string;
  };
}

export default function DeliveryReceiptModal({
  isOpen,
  onClose,
  orderData,
  orderItems,
  restaurantInfo,
}: DeliveryReceiptProps) {
  if (!isOpen) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Set up the document
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    // Title
    doc.text(`COMPROBANTE DE PEDIDO`, 105, 20, { align: "center" });
    doc.text(`${restaurantInfo.name}`, 105, 30, { align: "center" });

    // Reset font
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let yPos = 50;

    // Order info
    doc.text(`Número de Pedido: #${orderData.id}`, 20, yPos);
    yPos += 8;
    doc.text(
      `Fecha: ${new Date(orderData.created_at).toLocaleDateString("es-BO")}`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(
      `Hora: ${new Date(orderData.created_at).toLocaleTimeString("es-BO")}`,
      20,
      yPos
    );
    yPos += 15;

    // Customer info
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL CLIENTE:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    doc.text(`• Nombre: ${orderData.customer_name}`, 20, yPos);
    yPos += 8;
    doc.text(`• Teléfono: ${orderData.customer_phone}`, 20, yPos);
    yPos += 8;
    doc.text(`• Dirección: ${orderData.customer_address}`, 20, yPos);
    yPos += 8;
    doc.text(
      `• Entrega: ${orderData.delivery_date} a las ${orderData.delivery_time}`,
      20,
      yPos
    );
    yPos += 8;

    if (orderData.customer_nit_carnet) {
      doc.text(`• NIT/Carnet: ${orderData.customer_nit_carnet}`, 20, yPos);
      yPos += 8;
    }

    if (orderData.customer_razon_social) {
      doc.text(`• Razón Social: ${orderData.customer_razon_social}`, 20, yPos);
      yPos += 8;
    }

    yPos += 10;

    // Products
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTOS PEDIDOS:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;

    orderItems.forEach((item) => {
      const itemText = `• ${item.quantity}x ${item.name} - $${(
        item.price * item.quantity
      ).toFixed(2)}`;
      doc.text(itemText, 20, yPos);
      yPos += 8;
    });

    yPos += 10;

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL: $${orderData.total_price.toFixed(2)}`, 20, yPos);

    yPos += 20;

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Estado: PEDIDO CONFIRMADO", 20, yPos);
    yPos += 8;
    doc.text("Te contactaremos pronto para coordinar la entrega.", 20, yPos);
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.text("¡Gracias por tu compra!", 105, yPos, { align: "center" });

    // Save the PDF
    doc.save(`Comprobante_Pedido_${orderData.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-pink-50 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-pink-100">
        {/* Header */}
        <div className="bg-pink-600 text-white p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold mb-1">¡Gracias!</h2>
            <p className="text-white/90 text-sm">Tu pedido ha sido recibido.</p>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="flex-1 p-6 overflow-y-auto">
          {/* Order Info */}
          <div
            className="mb-4 pb-4"
            style={{ borderBottom: "2px dashed #ccc" }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Pedido #:</span>
              <span className="font-bold text-lg">{orderData.id}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Nombre:</span>
              <span>{orderData.customer_name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Teléfono:</span>
              <span>{orderData.customer_phone}</span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">Dirección:</span>
              <span className="text-right max-w-[60%] text-sm">
                {orderData.customer_address}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Entrega:</span>
              <span className="text-sm">
                {orderData.delivery_date} {orderData.delivery_time}
              </span>
            </div>
            {orderData.customer_nit_carnet && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">NIT/Carnet:</span>
                <span>{orderData.customer_nit_carnet}</span>
              </div>
            )}
            {orderData.customer_razon_social && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Razón Social:</span>
                <span className="text-right max-w-[60%] text-sm">
                  {orderData.customer_razon_social}
                </span>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <h4 className="font-semibold mb-3">Resumen del Pedido</h4>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-black pt-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-xl font-bold">
                ${orderData.total_price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Contact Message */}
          <div className="text-center text-sm text-gray-600 border-t border-dashed border-pink-300 pt-4">
            <p className="font-semibold mb-1">
              Te contactaremos al {orderData.customer_phone}
            </p>
            <p className="mb-2">para coordinar la entrega.</p>
            <p className="font-semibold">¡Gracias por tu compra!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-pink-200 bg-pink-100 p-4">
          <button
            onClick={downloadPDF}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
          >
            <Download size={18} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

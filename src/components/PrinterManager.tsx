"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import { Printer, PlusCircle, Settings, Trash2, Power, PowerOff } from "lucide-react";

type Printer = Database["public"]["Tables"]["printers"]["Row"];
type PrinterInsert = Database["public"]["Tables"]["printers"]["Insert"];


interface PrinterManagerProps {
  initialPrinters: Printer[];
}

const PRINTER_TYPES = [
  { value: "kitchen", label: "Cocina", description: "Imprime comandas para la cocina" },
  { value: "drink", label: "Bar", description: "Imprime comandas de bebidas" },
  { value: "receipt", label: "Recibo", description: "Imprime recibos para clientes" },
];

const PRINTER_STATUS = {
  online: { label: "En línea", color: "text-green-600", bgColor: "bg-green-100" },
  offline: { label: "Desconectada", color: "text-red-600", bgColor: "bg-red-100" },
  error: { label: "Error", color: "text-orange-600", bgColor: "bg-orange-100" },
  unknown: { label: "Desconocido", color: "text-gray-600", bgColor: "bg-gray-100" },
};

export default function PrinterManager({ initialPrinters }: PrinterManagerProps) {
  const supabase = createClient();
  const [printers, setPrinters] = useState<Printer[]>(initialPrinters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<PrinterInsert>({
    name: "",
    type: "kitchen",
    restaurant_id: "", // Will be set from context
    is_active: true,
    description: "",
    location: "",
    vendor_id: null,
    product_id: null,
  });

  // Get restaurant_id from the first printer or set a default
  useEffect(() => {
    if (printers.length > 0 && !formData.restaurant_id) {
      setFormData(prev => ({ ...prev, restaurant_id: printers[0].restaurant_id }));
    }
  }, [printers, formData.restaurant_id]);

  const handleToggleActive = async (printer: Printer) => {
    setLoading(true);
    const newStatus = !printer.is_active;
    
    const { error } = await supabase
      .from("printers")
      .update({ is_active: newStatus })
      .eq("id", printer.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setPrinters(current =>
        current.map(p =>
          p.id === printer.id ? { ...p, is_active: newStatus } : p
        )
      );
    }
    setLoading(false);
  };

  const handleDeletePrinter = async (printer: Printer) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la impresora "${printer.name}"?`)) {
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("printers")
      .delete()
      .eq("id", printer.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setPrinters(current => current.filter(p => p.id !== printer.id));
    }
    setLoading(false);
  };

  const handleSavePrinter = async () => {
    if (!formData.name.trim()) {
      alert("El nombre de la impresora es obligatorio");
      return;
    }

    setLoading(true);
    let error;

    if (editingPrinter) {
      // Update existing printer
      const { error: updateError } = await supabase
        .from("printers")
        .update({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          location: formData.location,
          vendor_id: formData.vendor_id,
          product_id: formData.product_id,
        })
        .eq("id", editingPrinter.id);

      error = updateError;

      if (!error) {
        setPrinters(current =>
          current.map(p =>
            p.id === editingPrinter.id
              ? { ...p, ...formData }
              : p
          )
        );
      }
    } else {
      // Create new printer
      const { error: insertError } = await supabase
        .from("printers")
        .insert([formData]);

      error = insertError;

      if (!error) {
        // Refresh the list to get the new printer with all fields
        const { data: newPrinters } = await supabase
          .from("printers")
          .select("*")
          .eq("restaurant_id", formData.restaurant_id);
        
        if (newPrinters) {
          setPrinters(newPrinters);
        }
      }
    }

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setEditingPrinter(null);
      setFormData({
        name: "",
        type: "kitchen",
        restaurant_id: formData.restaurant_id,
        is_active: true,
        description: "",
        location: "",
        vendor_id: null,
        product_id: null,
      });
    }
    setLoading(false);
  };

  const openEditModal = (printer: Printer) => {
    setEditingPrinter(printer);
    setFormData({
      name: printer.name,
      type: printer.type,
      restaurant_id: printer.restaurant_id,
      is_active: printer.is_active,
      description: printer.description || "",
      location: printer.location || "",
      vendor_id: printer.vendor_id,
      product_id: printer.product_id,
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPrinter(null);
    setFormData({
      name: "",
      type: "kitchen",
      restaurant_id: formData.restaurant_id,
      is_active: true,
      description: "",
      location: "",
      vendor_id: null,
      product_id: null,
    });
    setIsModalOpen(true);
  };

  const getPrinterTypeLabel = (type: string) => {
    return PRINTER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStatusInfo = (status: string | null) => {
    return PRINTER_STATUS[status as keyof typeof PRINTER_STATUS] || PRINTER_STATUS.unknown;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Impresoras</h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Agregar Impresora
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {printers.map((printer) => {
          const statusInfo = getStatusInfo(printer.status);
          return (
            <div
              key={printer.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                !printer.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Printer size={24} className="text-gray-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-lg">{printer.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getPrinterTypeLabel(printer.type)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(printer)}
                    disabled={loading}
                    className={`p-2 rounded-full transition-colors ${
                      printer.is_active
                        ? "text-green-600 hover:bg-green-100"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={printer.is_active ? "Desactivar" : "Activar"}
                  >
                    {printer.is_active ? <Power size={16} /> : <PowerOff size={16} />}
                  </button>
                  <button
                    onClick={() => openEditModal(printer)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Editar"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePrinter(printer)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {printer.description && (
                  <p className="text-sm text-gray-600">{printer.description}</p>
                )}
                {printer.location && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ubicación:</span> {printer.location}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    printer.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {printer.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {printers.length === 0 && (
        <div className="text-center py-12">
          <Printer size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay impresoras configuradas</h3>
          <p className="text-gray-500 mb-4">
            Agrega tu primera impresora para comenzar a imprimir comandas y recibos.
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center mx-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Agregar Primera Impresora
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingPrinter ? "Editar Impresora" : "Agregar Impresora"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Impresora Cocina Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRINTER_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción opcional de la impresora"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Cocina, Bar, Caja"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor ID
                  </label>
                  <input
                    type="number"
                    value={formData.vendor_id || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vendor_id: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 0x0519"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID
                  </label>
                  <input
                    type="number"
                    value={formData.product_id || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      product_id: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 0x000b"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePrinter}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : (editingPrinter ? "Actualizar" : "Agregar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
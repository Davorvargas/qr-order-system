"use client";

import { useState, useEffect } from "react";
import { QrCode, Download, Printer, Eye, RefreshCw, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface QRTable {
  id: string;
  tableNumber: string;
  displayName: string;
}

interface QRCodeGeneratorProps {
  restaurantId: string;
}

export default function QRCodeGenerator({ restaurantId }: QRCodeGeneratorProps) {
  const [tables, setTables] = useState<QRTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<QRTable | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [numberOfTables, setNumberOfTables] = useState<string>("10");
  const [tablePrefix, setTablePrefix] = useState<string>("Mesa");
  const [startingNumber, setStartingNumber] = useState<string>("1");
  const [additionalTables, setAdditionalTables] = useState<string>("5");
  const [addMorePrefix, setAddMorePrefix] = useState<string>("Mesa");
  const [creating, setCreating] = useState(false);
  
  const supabase = createClient();
  
  // Cargar mesas reales de la base de datos
  useEffect(() => {
    loadTablesFromDatabase();
  }, [restaurantId]);
  
  const loadTablesFromDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('id, table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number');
      
      if (tablesError) {
        throw tablesError;
      }
      
      if (tablesData) {
        const formattedTables: QRTable[] = tablesData.map(table => ({
          id: table.id,
          tableNumber: table.table_number,
          displayName: `Mesa ${table.table_number}`
        }));
        
        setTables(formattedTables);
      }
    } catch (error) {
      console.error('Error loading tables from database:', error);
      setError('Error al cargar las mesas de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const createTablesInDatabase = async (count: number, prefix: string, startNum: number) => {
    try {
      setCreating(true);
      
      const tablesToCreate = [];
      for (let i = 0; i < count; i++) {
        const tableNumber = (startNum + i).toString();
        tablesToCreate.push({
          table_number: tableNumber,
          restaurant_id: restaurantId
        });
      }
      
      const { data: createdTables, error: createError } = await supabase
        .from('tables')
        .insert(tablesToCreate)
        .select('id, table_number');
        
      if (createError) {
        throw createError;
      }
      
      if (createdTables) {
        console.log(`✅ ${createdTables.length} mesas creadas exitosamente`);
        // Recargar la lista de mesas
        await loadTablesFromDatabase();
        return createdTables;
      }
      
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const generateTables = async () => {
    const count = parseInt(numberOfTables);
    const start = parseInt(startingNumber);
    
    if (isNaN(count) || isNaN(start) || count <= 0 || count > 100) {
      alert("Por favor ingresa un número válido de mesas (1-100)");
      return;
    }

    if (tables.length > 0) {
      const confirmReplace = confirm(`Ya tienes ${tables.length} mesas configuradas. ¿Quieres agregar ${count} mesas más en lugar de reemplazarlas?`);
      if (confirmReplace) {
        // Cambiar a modal de agregar más
        setNumberOfTables("1");
        setShowGenerateModal(false);
        setShowAddMoreModal(true);
        return;
      }
    }

    try {
      await createTablesInDatabase(count, tablePrefix, start);
      setShowGenerateModal(false);
      alert(`✅ ${count} mesas creadas exitosamente`);
    } catch (error) {
      console.error('Error creating tables:', error);
      alert(`❌ Error creando mesas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const addMoreTables = async () => {
    const count = parseInt(additionalTables);
    
    if (isNaN(count) || count <= 0 || count > 50) {
      alert("Por favor ingresa un número válido (1-50)");
      return;
    }

    // Encontrar el número de mesa más alto
    const currentNumbers = tables.map(t => parseInt(t.tableNumber)).filter(n => !isNaN(n));
    const maxNumber = currentNumbers.length > 0 ? Math.max(...currentNumbers) : 0;
    const nextNumber = maxNumber + 1;

    try {
      await createTablesInDatabase(count, addMorePrefix, nextNumber);
      setShowAddMoreModal(false);
      setAdditionalTables("5");
      setAddMorePrefix("Mesa");
      alert(`✅ ${count} mesas adicionales creadas exitosamente`);
    } catch (error) {
      console.error('Error creating additional tables:', error);
      alert(`❌ Error creando mesas adicionales: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const getNextTableNumber = () => {
    const currentNumbers = tables.map(t => parseInt(t.tableNumber)).filter(n => !isNaN(n));
    return currentNumbers.length > 0 ? Math.max(...currentNumbers) + 1 : 1;
  };

  const generateQRUrl = (table: QRTable) => {
    // Usar la URL de Vercel para que funcione desde dispositivos móviles
    const baseUrl = 'https://qr-order-system.vercel.app';
    // Usar el UUID de la mesa, no el número
    return `${baseUrl}/menu/${table.id}`;
  };

  const generateQRCodeUrl = (table: QRTable) => {
    const qrUrl = generateQRUrl(table);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
  };

  const downloadQRCode = async (table: QRTable) => {
    try {
      // Crear un canvas para generar la imagen completa
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas');

      // Configurar tamaño del canvas (más grande para incluir texto)
      canvas.width = 400;
      canvas.height = 500;

      // Fondo blanco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Borde
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Título
      ctx.fillStyle = '#000';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(table.displayName.toUpperCase(), canvas.width / 2, 60);

      // Subtítulo
      ctx.font = '18px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Escanea para ver el menú', canvas.width / 2, 90);

      // Cargar y dibujar el QR code
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        qrImage.onload = () => {
          // Dibujar QR en el centro
          const qrSize = 250;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = 120;
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
          
          // Instrucciones
          ctx.font = '14px Arial';
          ctx.fillStyle = '#333';
          ctx.fillText('Escanea este código QR con tu teléfono', canvas.width / 2, 400);
          ctx.fillText('para ver el menú y hacer tu pedido', canvas.width / 2, 420);
          
          resolve(null);
        };
        qrImage.onerror = reject;
        qrImage.src = generateQRCodeUrl(table);
      });

      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Error al generar la imagen');
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${table.displayName.replace(/\s+/g, '-')}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Error al descargar el código QR");
    }
  };

  const downloadAllQRCodes = async () => {
    if (tables.length === 0) return;
    
    if (tables.length > 20) {
      if (!confirm(`¿Estás seguro de que quieres descargar ${tables.length} códigos QR? Esto puede tomar un momento.`)) {
        return;
      }
    }
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      await downloadQRCode(table);
      
      // Pausa más larga entre descargas para evitar problemas del navegador
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mostrar progreso para descargas grandes
      if (tables.length > 10) {
        console.log(`Descargando ${i + 1}/${tables.length}: ${table.displayName}`);
      }
    }
    
    alert(`¡${tables.length} códigos QR descargados exitosamente!`);
  };

  const printQRCode = (table: QRTable) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodeUrl = generateQRCodeUrl(table);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${table.displayName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              margin: 20px auto;
              width: fit-content;
              border-radius: 10px;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .qr-subtitle {
              font-size: 16px;
              margin-bottom: 20px;
              color: #666;
            }
            .qr-code {
              margin: 20px 0;
            }
            .qr-instructions {
              font-size: 14px;
              margin-top: 15px;
              color: #333;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-title">${table.displayName.toUpperCase()}</div>
            <div class="qr-subtitle">Escanea para ver el menú</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code ${table.displayName}" />
            </div>
            <div class="qr-instructions">
              Escanea este código QR con tu teléfono<br>
              para ver el menú y hacer tu pedido
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadTablesFromDatabase}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw size={16} />
            <span>Reintentar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Códigos QR de Mesas</h3>
            <p className="text-sm text-gray-600">Códigos QR para las mesas configuradas en el sistema</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadTablesFromDatabase}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Actualizar</span>
            </button>
            {tables.length > 0 && (
              <>
                <button
                  onClick={() => setShowAddMoreModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Agregar Más</span>
                </button>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    await downloadAllQRCodes();
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  title={`Descargar ${tables.length} códigos QR completos`}
                >
                  <Download size={16} />
                  <span>Descargar Todos ({tables.length})</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Generar Mesas</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <QrCode size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">¡Genera tus primeras mesas con códigos QR!</h3>
            <p className="text-gray-500 mb-6">
              Decide cuántas mesas necesitas y genera todas las mesas con sus QRs de una vez
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={creating}
            >
              <Plus size={20} />
              <span>Comenzar</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">{table.displayName}</h4>
                    <div className="mb-4">
                      <img 
                        src={generateQRCodeUrl(table)} 
                        alt={`QR ${table.displayName}`}
                        className="w-32 h-32 mx-auto border border-gray-200 rounded"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setSelectedTable(table);
                          setShowPreview(true);
                        }}
                        className="flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        <Eye size={16} />
                        <span>Vista Previa</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          downloadQRCode(table);
                        }}
                        className="flex items-center justify-center space-x-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded transition-colors"
                      >
                        <Download size={16} />
                        <span>Descargar</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          printQRCode(table);
                        }}
                        className="flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                      >
                        <Printer size={16} />
                        <span>Imprimir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add More Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="text-center h-full flex flex-col justify-center">
                  <button
                    onClick={() => setShowAddMoreModal(true)}
                    className="w-full h-full min-h-[280px] flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors group"
                    disabled={creating}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 group-hover:border-blue-500 flex items-center justify-center mb-3 transition-colors">
                      <Plus size={24} className="group-hover:text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium mb-1">Agregar Más</div>
                      <div className="text-sm text-gray-400">
                        Próxima: {addMorePrefix} {getNextTableNumber()}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Add Bar */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>{tables.length}</strong> mesas configuradas • Próximo número: <strong>{addMorePrefix} {getNextTableNumber()}</strong>
                </div>
                <button
                  onClick={() => setShowAddMoreModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  disabled={creating}
                >
                  <Plus size={16} />
                  <span>Añadir Más</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vista Previa - {selectedTable.displayName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center">
              <div className="border-2 border-black rounded-lg p-6 mb-4">
                <div className="text-xl font-bold mb-2">{selectedTable.displayName.toUpperCase()}</div>
                <div className="text-gray-600 mb-4">Escanea para ver el menú</div>
                <img 
                  src={generateQRCodeUrl(selectedTable)} 
                  alt={`QR ${selectedTable.displayName}`}
                  className="w-48 h-48 mx-auto mb-4"
                />
                <div className="text-sm text-gray-700">
                  Escanea este código QR con tu teléfono<br />
                  para ver el menú y hacer tu pedido
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-4 break-all">
                URL: {generateQRUrl(selectedTable)}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    await downloadQRCode(selectedTable);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Descargar
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    printQRCode(selectedTable);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Tables Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Generar Mesas con Códigos QR</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={creating}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de mesas
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={numberOfTables}
                  onChange={(e) => setNumberOfTables(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  disabled={creating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefijo (opcional)
                </label>
                <input
                  type="text"
                  value={tablePrefix}
                  onChange={(e) => setTablePrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mesa"
                  disabled={creating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empezar desde el número
                </label>
                <input
                  type="number"
                  min="1"
                  value={startingNumber}
                  onChange={(e) => setStartingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                  disabled={creating}
                />
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Vista previa:</strong> {tablePrefix} {startingNumber}, {tablePrefix} {parseInt(startingNumber) + 1}, {tablePrefix} {parseInt(startingNumber) + 2}...
              </div>
              
              {tables.length > 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                  <strong>Nota:</strong> Ya tienes {tables.length} mesas configuradas. Se agregarán las nuevas mesas.
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  await generateTables();
                }}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creando..." : "Generar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add More Tables Modal */}
      {showAddMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Añadir Más Mesas</h3>
              <button
                onClick={() => setShowAddMoreModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={creating}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <strong>Estado actual:</strong> {tables.length} mesas configuradas<br/>
                  <strong>Próximo número:</strong> {getNextTableNumber()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cuántos más?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={additionalTables}
                    onChange={(e) => setAdditionalTables(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                    disabled={creating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prefijo
                  </label>
                  <input
                    type="text"
                    value={addMorePrefix}
                    onChange={(e) => setAddMorePrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mesa"
                    disabled={creating}
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Se agregarán:</strong> {addMorePrefix} {getNextTableNumber()}, {addMorePrefix} {getNextTableNumber() + 1}, {addMorePrefix} {getNextTableNumber() + 2}...
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddMoreModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  await addMoreTables();
                }}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creando..." : `Añadir ${additionalTables}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, Edit2, Check, X, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  cost: number | null;
  category_id: number | null;
  is_available: boolean;
  categories?: { name: string } | null;
}

interface CostEditorProps {
  initialItems: MenuItem[];
  restaurantId: string;
}

export default function CostEditor({ initialItems, restaurantId }: CostEditorProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  const supabase = createClient();

  // Filtrar items por búsqueda
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Iniciar edición
  const startEditing = (item: MenuItem) => {
    setEditingId(item.id);
    setEditingValue(item.cost?.toString() || '');
    setError(null);
    setSuccess(null);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue('');
    setError(null);
  };

  // Guardar cambios
  const saveCost = async (itemId: number) => {
    const newCost = parseFloat(editingValue);
    
    // Validaciones
    if (isNaN(newCost) || newCost < 0) {
      setError('El costo debe ser un número positivo');
      return;
    }

    if (newCost > 10000) {
      setError('El costo no puede ser mayor a $10,000');
      return;
    }

    setIsLoading(itemId);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ cost: newCost })
        .eq('id', itemId)
        .eq('restaurant_id', restaurantId); // Seguridad: solo del restaurante

      if (updateError) {
        throw updateError;
      }

      // Actualizar estado local
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, cost: newCost } : item
      ));

      setEditingId(null);
      setEditingValue('');
      setSuccess(itemId);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error updating cost:', err);
      setError('Error al guardar el costo. Inténtalo de nuevo.');
    } finally {
      setIsLoading(null);
    }
  };

  // Manejar Enter y Escape
  const handleKeyPress = (e: React.KeyboardEvent, itemId: number) => {
    if (e.key === 'Enter') {
      saveCost(itemId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="p-6">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mensaje de error global */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const isEditing = editingId === item.id;
              const isLoadingItem = isLoading === item.id;
              const isSuccessItem = success === item.id;
              
              const profit = item.price && item.cost ? item.price - item.cost : null;
              const margin = profit && item.price ? (profit / item.price) * 100 : null;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Producto */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.categories?.name || 'Sin categoría'}
                  </td>

                  {/* Precio */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Bs {item.price?.toFixed(2) || '0.00'}
                  </td>

                  {/* Costo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, item.id)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveCost(item.id)}
                          disabled={isLoadingItem}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isLoadingItem}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          Bs {item.cost?.toFixed(2) || '0.00'}
                        </span>
                        <button
                          onClick={() => startEditing(item)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Margen */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {margin !== null ? (
                      <span className={`font-medium ${
                        margin > 50 ? 'text-green-600' : 
                        margin > 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {margin.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {isLoadingItem && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                      {isSuccessItem && (
                        <Check size={16} className="text-green-600" />
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'No hay productos disponibles.'}
          </p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Tipos para modificadores
interface Modifier {
  id: string;
  name: string;
  price_modifier: number;
  is_default: boolean;
  display_order: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  modifiers: Modifier[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (item: MenuItem, quantity: number, notes: string, selectedModifiers: Record<string, string[]>, totalPrice: number) => void;
}

export default function ProductModalWithModifiers({
  isOpen,
  onClose,
  item,
  onAddToCart,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const supabase = createClient();

  // Cargar modificadores cuando se abre el modal
  useEffect(() => {
    if (isOpen && item) {
      loadModifiers();
      setQuantity(1);
      setNotes("");
      setSelectedModifiers({});
      setValidationErrors([]);
    }
  }, [isOpen, item]);

  // Recalcular precio cuando cambian las selecciones
  useEffect(() => {
    if (item) {
      calculateTotalPrice();
    }
  }, [selectedModifiers, quantity, item]);

  const loadModifiers = async () => {
    if (!item) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/modifiers?menuItemId=${item.id}`);
      const result = await response.json();
      
      if (result.success) {
        setModifierGroups(result.data);
        
        // Seleccionar opciones por defecto
        const defaultSelections: Record<string, string[]> = {};
        result.data.forEach((group: ModifierGroup) => {
          const defaultModifiers = group.modifiers.filter(m => m.is_default);
          if (defaultModifiers.length > 0) {
            defaultSelections[group.id] = defaultModifiers.map(m => m.id);
          } else if (group.is_required && group.modifiers.length > 0) {
            // Si es requerido pero no hay default, seleccionar el primero
            defaultSelections[group.id] = [group.modifiers[0].id];
          }
        });
        setSelectedModifiers(defaultSelections);
      }
    } catch (error) {
      console.error('Error loading modifiers:', error);
      setModifierGroups([]); // Fallback a modo simple
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = async () => {
    if (!item) return;
    
    try {
      const allSelectedIds = Object.values(selectedModifiers).flat();
      const response = await fetch('/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: item.id,
          selectedModifierIds: allSelectedIds
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setTotalPrice(result.data.totalPrice * quantity);
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      // Fallback: precio base * cantidad
      setTotalPrice((item.price || 0) * quantity);
    }
  };

  const handleModifierChange = (groupId: string, modifierId: string, checked: boolean) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group) return;

    setSelectedModifiers(prev => {
      const current = prev[groupId] || [];
      
      if (group.max_selections === 1) {
        // Radio button behavior
        return { ...prev, [groupId]: checked ? [modifierId] : [] };
      } else {
        // Checkbox behavior
        if (checked) {
          if (current.length < group.max_selections) {
            return { ...prev, [groupId]: [...current, modifierId] };
          }
          return prev; // No agregar si se alcanzó el máximo
        } else {
          return { ...prev, [groupId]: current.filter(id => id !== modifierId) };
        }
      }
    });
  };

  const validateSelections = (): boolean => {
    const errors: string[] = [];
    
    modifierGroups.forEach(group => {
      const selected = selectedModifiers[group.id] || [];
      
      if (group.is_required && selected.length < group.min_selections) {
        errors.push(`Debes seleccionar al menos ${group.min_selections} opción(es) en "${group.name}"`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAddToCart = () => {
    if (!item || !validateSelections()) return;
    
    // Convert modifier IDs to names for the Edge Function
    const modifiersByName: Record<string, string[]> = {};
    
    Object.entries(selectedModifiers).forEach(([groupId, modifierIds]) => {
      const group = modifierGroups.find(g => g.id === groupId);
      if (group) {
        const modifierNames = modifierIds.map(modId => {
          const modifier = group.modifiers.find(m => m.id === modId);
          return modifier?.name || '';
        }).filter(name => name !== '');
        
        if (modifierNames.length > 0) {
          modifiersByName[group.name] = modifierNames;
        }
      }
    });
    
    console.log('🔍 Converting modifiers from IDs to names:', {
      originalIds: selectedModifiers,
      convertedNames: modifiersByName
    });
    
    onAddToCart(item, quantity, notes, modifiersByName, totalPrice);
    handleClose();
  };

  const handleClose = () => {
    setQuantity(1);
    setNotes("");
    setSelectedModifiers({});
    setValidationErrors([]);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Descripción del producto */}
          {item.description && (
            <p className="text-gray-600 mb-4">{item.description}</p>
          )}

          {/* Precio base */}
          <div className="mb-6">
            <span className="text-lg font-semibold text-gray-900">
              Precio base: Bs. {item.price?.toFixed(2) || '0.00'}
            </span>
          </div>

          {/* Loading modificadores */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando opciones...</span>
            </div>
          )}

          {/* Grupos de modificadores */}
          {!loading && modifierGroups.map(group => (
            <div key={group.id} className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {group.name}
                {group.is_required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              <div className="space-y-2">
                {group.modifiers.map(modifier => {
                  const isSelected = selectedModifiers[group.id]?.includes(modifier.id) || false;
                  const InputComponent = group.max_selections === 1 ? 'input' : 'input';
                  const inputType = group.max_selections === 1 ? 'radio' : 'checkbox';
                  
                  return (
                    <label
                      key={modifier.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <InputComponent
                          type={inputType}
                          name={group.max_selections === 1 ? `group_${group.id}` : undefined}
                          checked={isSelected}
                          onChange={(e) => handleModifierChange(group.id, modifier.id, e.target.checked)}
                          className="mr-3"
                        />
                        <span className="text-gray-900">{modifier.name}</span>
                      </div>
                      <span className="text-gray-600">
                        {modifier.price_modifier > 0 && '+'}
                        {modifier.price_modifier !== 0 && `Bs. ${modifier.price_modifier.toFixed(2)}`}
                        {modifier.price_modifier === 0 && 'Incluido'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Errores de validación */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Notas especiales */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas especiales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin azúcar, extra caliente, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {notes.length}/200 caracteres
            </p>
          </div>

          {/* Cantidad y precio total */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Total:</p>
              <p className="text-xl font-bold text-gray-900">
                Bs. {totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            <span>Agregar al carrito - Bs. {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
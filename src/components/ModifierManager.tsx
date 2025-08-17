"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Settings, Save } from "lucide-react";

interface ModifierGroup {
  id: number;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  modifiers: Modifier[];
}

interface Modifier {
  id: number;
  name: string;
  price_modifier: number;
  is_default: boolean;
  display_order: number;
}

interface ModifierManagerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: number;
  menuItemName: string;
  restaurantId: string;
  onSave?: () => void;
}

export default function ModifierManager({
  isOpen,
  onClose,
  menuItemId,
  menuItemName,
  restaurantId,
  onSave,
}: ModifierManagerProps) {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && menuItemId) {
      fetchModifiers();
    }
  }, [isOpen, menuItemId]);

  const fetchModifiers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/modifiers?menuItemId=${menuItemId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Sort modifiers within each group
        const sortedGroups = (result.data || []).map((group) => ({
          ...group,
          modifiers: (group.modifiers || []).sort(
            (a, b) => a.display_order - b.display_order
          ),
        }));
        setModifierGroups(sortedGroups);
      } else {
        console.error("Error fetching modifiers:", result.error);
      }
    } catch (error) {
      console.error("Error fetching modifiers:", error);
    } finally {
      setLoading(false);
    }
  };

  const addModifierGroup = () => {
    const newGroup: ModifierGroup = {
      id: Date.now(), // Temporary ID
      name: "Nuevo Grupo",
      is_required: false,
      min_selections: 0,
      max_selections: 1,
      display_order: modifierGroups.length,
      modifiers: [],
    };
    setModifierGroups([...modifierGroups, newGroup]);
  };

  const updateModifierGroup = (
    groupId: number,
    updates: Partial<ModifierGroup>
  ) => {
    setModifierGroups((groups) =>
      groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  const removeModifierGroup = (groupId: number) => {
    if (
      window.confirm("¿Estás seguro de eliminar este grupo de modificadores?")
    ) {
      setModifierGroups((groups) =>
        groups.filter((group) => group.id !== groupId)
      );
    }
  };

  const addModifier = (groupId: number) => {
    const group = modifierGroups.find((g) => g.id === groupId);
    if (!group) return;

    const newModifier: Modifier = {
      id: Date.now(), // Temporary ID
      name: "Nueva Opción",
      price_modifier: 0,
      is_default: false,
      display_order: group.modifiers.length,
    };

    updateModifierGroup(groupId, {
      modifiers: [...group.modifiers, newModifier],
    });
  };

  const updateModifier = (
    groupId: number,
    modifierId: number,
    updates: Partial<Modifier>
  ) => {
    const group = modifierGroups.find((g) => g.id === groupId);
    if (!group) return;

    const updatedModifiers = group.modifiers.map((modifier) =>
      modifier.id === modifierId ? { ...modifier, ...updates } : modifier
    );

    updateModifierGroup(groupId, { modifiers: updatedModifiers });
  };

  const removeModifier = (groupId: number, modifierId: number) => {
    const group = modifierGroups.find((g) => g.id === groupId);
    if (!group) return;

    const updatedModifiers = group.modifiers.filter(
      (modifier) => modifier.id !== modifierId
    );
    updateModifierGroup(groupId, { modifiers: updatedModifiers });
  };

  const saveModifiers = async () => {
    setSaving(true);
    try {
      // Preparar datos para la API
      const groupsData = modifierGroups.map((group) => ({
        name: group.name,
        is_required: group.is_required,
        min_selections: group.min_selections,
        max_selections: group.max_selections,
        display_order: group.display_order,
        modifiers: group.modifiers.map((modifier) => ({
          name: modifier.name,
          price_modifier: modifier.price_modifier,
          is_default: modifier.is_default,
          display_order: modifier.display_order,
        })),
      }));

      console.log("Sending modifier data:", { menuItemId, groupsData });

      const response = await fetch("/api/modifiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menuItemId: menuItemId,
          groups: groupsData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", {
          status: response.status,
          result,
        });
        throw new Error(
          result.error || result.details || `API error: ${response.status}`
        );
      }

      if (result.success) {
        alert("Modificadores guardados exitosamente");
        onSave?.();
        onClose();
      } else {
        throw new Error(result.error || result.details || "Error desconocido");
      }
    } catch (error) {
      console.error("Error saving modifiers:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al guardar modificadores";
      alert(`Error al guardar modificadores: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Gestionar Modificadores
            </h2>
            <p className="text-sm text-gray-600">{menuItemName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando modificadores...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {modifierGroups.map((group, groupIndex) => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Grupo
                        </label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) =>
                            updateModifierGroup(group.id, {
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Ej: Temperatura, Tipo de Leche"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={group.is_required}
                            onChange={(e) =>
                              updateModifierGroup(group.id, {
                                is_required: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Requerido</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600">Min:</label>
                          <input
                            type="number"
                            value={group.min_selections}
                            onChange={(e) =>
                              updateModifierGroup(group.id, {
                                min_selections: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                            min="0"
                          />
                          <label className="text-xs text-gray-600">Max:</label>
                          <input
                            type="number"
                            value={group.max_selections}
                            onChange={(e) =>
                              updateModifierGroup(group.id, {
                                max_selections: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeModifierGroup(group.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Modifiers */}
                  <div className="space-y-2">
                    {group.modifiers.map((modifier, modifierIndex) => (
                      <div
                        key={modifier.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={modifier.name}
                            onChange={(e) =>
                              updateModifier(group.id, modifier.id, {
                                name: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Nombre de la opción"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={modifier.price_modifier}
                            onChange={(e) =>
                              updateModifier(group.id, modifier.id, {
                                price_modifier: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Precio"
                            step="0.01"
                          />
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={modifier.is_default}
                            onChange={(e) =>
                              updateModifier(group.id, modifier.id, {
                                is_default: e.target.checked,
                              })
                            }
                            className="mr-1"
                          />
                          <span className="text-xs text-gray-600">Default</span>
                        </label>
                        <button
                          onClick={() => removeModifier(group.id, modifier.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addModifier(group.id)}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Agregar Opción
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addModifierGroup}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center"
              >
                <Plus size={20} className="mr-2" />
                Agregar Grupo de Modificadores
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={saveModifiers}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? "Guardando..." : "Guardar Modificadores"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Truck, Settings, ExternalLink, Copy, Check } from "lucide-react";

export default function DeliverySetupPage() {
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user's restaurant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) return;

      // Load menu items
      const { data: items } = await supabase
        .from('menu_items')
        .select('id, name, description, price, is_available, menu_type')
        .eq('restaurant_id', profile.restaurant_id)
        .order('name');

      setMenuItems(items || []);

      // Load or create delivery settings
      let { data: settings } = await supabase
        .from('restaurant_delivery_settings')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .single();

      if (!settings) {
        // Create default settings
        const { data: newSettings } = await supabase
          .from('restaurant_delivery_settings')
          .insert({
            restaurant_id: profile.restaurant_id,
            delivery_enabled: false,
            theme_color: '#1e40af'
          })
          .select()
          .single();

        settings = newSettings;
      }

      setDeliverySettings(settings);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDeliveryLink = async () => {
    if (!deliverySettings) return;

    try {
      const { data, error } = await supabase.rpc('generate_delivery_link', {
        p_restaurant_id: deliverySettings.restaurant_id
      });

      if (error) throw error;

      await loadData();
      alert('¡Link de delivery generado exitosamente!');
    } catch (error) {
      console.error('Error generating delivery link:', error);
      alert('Error al generar el link de delivery');
    }
  };

  const updateMenuItemType = async (itemId: number, menuType: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ menu_type: menuType })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, menu_type: menuType } : item
        )
      );
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Error al actualizar el item del menú');
    }
  };

  const toggleDeliveryEnabled = async () => {
    if (!deliverySettings) return;

    try {
      const { error } = await supabase
        .from('restaurant_delivery_settings')
        .update({ delivery_enabled: !deliverySettings.delivery_enabled })
        .eq('id', deliverySettings.id);

      if (error) throw error;

      setDeliverySettings(prev => ({
        ...prev,
        delivery_enabled: !prev.delivery_enabled
      }));
    } catch (error) {
      console.error('Error toggling delivery:', error);
      alert('Error al cambiar el estado del delivery');
    }
  };

  const copyDeliveryLink = async () => {
    if (!deliverySettings?.delivery_link_id) return;

    const link = `${window.location.origin}/delivery/${deliverySettings.delivery_link_id}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const deliveryItems = menuItems.filter(item =>
    item.menu_type === 'delivery' || item.menu_type === 'both'
  );

  const deliveryLink = deliverySettings?.delivery_link_id
    ? `${window.location.origin}/delivery/${deliverySettings.delivery_link_id}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="text-blue-600" size={32} />
            Configuración de Delivery
          </h1>
          <p className="text-gray-600 mt-2">
            Configura tu menú especial para delivery y genera el link para WhatsApp
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings size={24} />
              <h2 className="text-xl font-semibold">Configuración General</h2>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deliverySettings?.delivery_enabled || false}
                onChange={toggleDeliveryEnabled}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <span>Delivery Habilitado</span>
            </label>
          </div>

          {deliverySettings?.delivery_enabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={generateDeliveryLink}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {deliverySettings?.delivery_link_id ? 'Regenerar Link' : 'Generar Link de Delivery'}
                </button>

                {deliveryLink && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="bg-gray-100 p-3 rounded-lg flex-1 font-mono text-sm">
                      {deliveryLink}
                    </div>
                    <button
                      onClick={copyDeliveryLink}
                      className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      title="Copiar link"
                    >
                      {copiedLink ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {deliveryLink && (
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                  <p className="text-sm text-pink-800">
                    <strong>¡Perfecto!</strong> Comparte este link por WhatsApp con tus clientes.
                    Ellos verán tu menú con un fondo rosado especial para delivery.
                  </p>
                  <p className="text-xs text-pink-600 mt-2">
                    Items disponibles para delivery: <strong>{deliveryItems.length}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Items Management */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Items del Menú
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona qué items estarán disponibles para delivery
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Disponibilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo de Menú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500 max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.price ? `$${item.price}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.menu_type || 'regular'}
                        onChange={(e) => updateMenuItemType(item.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="regular">Solo Restaurante</option>
                        <option value="delivery">Solo Delivery</option>
                        <option value="both">Restaurante + Delivery</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
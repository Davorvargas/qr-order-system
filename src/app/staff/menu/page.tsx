"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MenuOrderManager from "@/components/MenuOrderManager";
import MenuManager from "@/components/MenuManager";
import { Edit3, Move3D } from "lucide-react";

type Category = {
  id: number;
  name: string;
  is_available: boolean;
  display_order: number;
};

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
  display_order: number;
};

export default function MenuPage() {
  const supabase = createClient();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manage' | 'reorder'>('manage');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el restaurant_id del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Obtener el restaurant_id del perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        if (!profile?.restaurant_id) {
          setLoading(false);
          return;
        }

        // Filtrar por restaurant_id
        const { data: menuItemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq('restaurant_id', profile.restaurant_id)
          .order("display_order");

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("*")
          .eq('restaurant_id', profile.restaurant_id)
          .order("display_order");

        if (itemsError || categoriesError) {
          setError("Error loading menu data");
          console.error("Error:", itemsError || categoriesError);
        } else {
          setMenuItems(menuItemsData || []);
          setCategories(
            (categoriesData || []).map((cat) => ({
              ...cat,
              is_available: cat.is_available ?? false,
            }))
          );
        }
      } catch (err) {
        setError("Error loading menu data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión del Menú</h1>
        
        {/* Pestañas para alternar entre funcionalidades */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'manage'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Edit3 size={16} className="mr-2" />
            Gestionar
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reorder'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Move3D size={16} className="mr-2" />
            Reordenar
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'manage' ? (
        <MenuManager 
          initialItems={menuItems} 
          categories={categories}
        />
      ) : (
        <MenuOrderManager 
          categories={categories} 
          menuItems={menuItems} 
        />
      )}
    </div>
  );
}
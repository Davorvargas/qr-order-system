"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import CategoryNav from "@/components/CategoryNav";
import { createClient } from "@/utils/supabase/client";

// Define types on the client-side as well
interface Category {
  id: number;
  name: string;
  display_order?: number;
}
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
  display_order?: number;
}

export default function MenuPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [tableNumber, setTableNumber] = useState<string>("");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (!tableId) {
      console.error("No tableId provided");
      setError("No se proporcionó ID de mesa");
      setIsLoading(false);
      return;
    }

    console.log("TableId received:", tableId, "Type:", typeof tableId);

    const getMenuData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        // 1. Obtener el ID del restaurante a partir del ID de la mesa
        const { data: tableData, error: tableError } = await supabase
          .from("tables")
          .select("table_number, restaurant_id")
          .eq("id", tableId)
          .single();

        if (tableError || !tableData) {
          console.error("Error fetching table data:", tableError);
          console.error("Table ID being searched:", tableId);
          setError("No se pudo encontrar la mesa");
          return;
        }

        setTableNumber(tableData.table_number);
        const restaurantId = tableData.restaurant_id;

        // 2. Obtener platos solo para ese restaurante, ordenados correctamente
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("category_id")
          .order("display_order");

        if (menuItemsError) {
          console.error("Error fetching menu items:", menuItemsError);
          setError("Error al cargar el menú");
          return;
        }

        // 3. Obtener categorías disponibles de la base de datos
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("id, name, display_order")
          .eq("is_available", true)
          .eq("restaurant_id", restaurantId)
          .order("display_order");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          setError("Error al cargar las categorías");
          return;
        }

        setAllCategories(categoriesData || []);
        setAllMenuItems(menuItemsData || []);

        // 4. Calcular categorías disponibles
        if (menuItemsData && categoriesData) {
          const itemCategoryIds = new Set(
            menuItemsData.map((item) => item.category_id)
          );
          const filteredCategories = categoriesData
            .filter((category) => itemCategoryIds.has(category.id))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

          setAvailableCategories(filteredCategories);

          // Establecer la primera categoría como activa
          if (filteredCategories.length > 0 && activeCategoryId === null) {
            setActiveCategoryId(filteredCategories[0].id);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Error inesperado al cargar el menú");
      } finally {
        setIsLoading(false);
      }
    };

    getMenuData();
  }, [tableId, activeCategoryId]);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current || availableCategories.length === 0) return;

      const categoryElements = availableCategories.map((cat) =>
        document.getElementById(`category-${cat.id}`)
      );

      let currentActiveId = activeCategoryId;
      for (const el of categoryElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            currentActiveId = parseInt(el.id.replace("category-", ""));
            break;
          }
        }
      }

      if (currentActiveId !== activeCategoryId) {
        setActiveCategoryId(currentActiveId);
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => mainElement.removeEventListener("scroll", handleScroll);
    }
  }, [availableCategories, activeCategoryId]);

  const handleCategorySelect = (id: number) => {
    isScrollingRef.current = true;
    setActiveCategoryId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (availableCategories.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            No hay productos disponibles en este momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CategoryNav
        categories={availableCategories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={handleCategorySelect}
      />
      <main
        ref={mainRef}
        className="flex min-h-screen flex-col items-center p-6 md:p-12"
        style={{ overflowY: "scroll", height: "100vh" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Orden para la Mesa {tableNumber}
        </h1>
        <OrderForm
          categories={availableCategories}
          items={allMenuItems}
          tableId={tableId}
        />
      </main>
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import CategoryNav from "@/components/CategoryNav";
import { createClient } from "@/utils/supabase/client";

// Define types on the client-side as well
interface Category {
  id: number;
  name: string;
}
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
}

export default function MenuPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [tableNumber, setTableNumber] = useState<string>("");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (!tableId) {
      console.error("No tableId provided");
      return;
    }

    console.log("TableId received:", tableId, "Type:", typeof tableId);

    const getMenuData = async () => {
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
        return;
      }

      setTableNumber(tableData.table_number);
      const restaurantId = tableData.restaurant_id;

      // 2. Obtener platos solo para ese restaurante, ordenados correctamente
      const { data: menuItemsData } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        // No filtrar por is_available aquí - queremos mostrar todos pero disabled
        .order("category_id")
        .order("display_order");

      // 3. Obtener categorías disponibles de la base de datos
      const { data: categoriesData } = await supabase
        .from("menu_categories")
        .select("id, name")
        .eq("is_available", true)
        .eq("restaurant_id", restaurantId)
        .order("display_order");

      if (categoriesData) setAllCategories(categoriesData);
      if (menuItemsData) setAllMenuItems(menuItemsData);
    };

    getMenuData();
  }, [tableId]);

  const availableCategories = useMemo(() => {
    if (!allMenuItems || allMenuItems.length === 0 || !allCategories || allCategories.length === 0) return [];
    const itemCategoryIds = new Set(
      allMenuItems.map((item) => item.category_id)
    );
    return allCategories
      .filter((category) => itemCategoryIds.has(category.id))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)); // Asegurar orden
  }, [allCategories, allMenuItems]);

  useEffect(() => {
    if (availableCategories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(availableCategories[0].id);
    }
  }, [availableCategories, activeCategoryId]);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;
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
      setActiveCategoryId(currentActiveId);
    };
    const mainElement = mainRef.current;
    mainElement?.addEventListener("scroll", handleScroll);
    return () => mainElement?.removeEventListener("scroll", handleScroll);
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
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

export default function TablePage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Fetch initial data
    const getMenuData = async () => {
      const supabase = createClient();
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("id, name")
        .order("name");
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .order("name");

      if (categoriesError) console.error(categoriesError);
      if (itemsError) console.error(itemsError);

      if (categoriesData) {
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setActiveCategoryId(categoriesData[0].id);
        }
      }
      if (itemsData) setMenuItems(itemsData);
    };
    getMenuData();
  }, []);

  // Scroll spying logic
  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map((cat) =>
        document.getElementById(`category-${cat.id}`)
      );
      let currentActiveId = activeCategoryId;

      for (const el of categoryElements) {
        if (el) {
          // Check if element exists
          const rect = el.getBoundingClientRect();
          // Check if the top of the element is within the top half of the viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            const id = parseInt(el.id.replace("category-", ""));
            currentActiveId = id;
            break; // Found the active one, no need to check further
          }
        }
      }
      setActiveCategoryId(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, activeCategoryId]);

  const handleCategorySelect = (id: number) => {
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategoryId(id);
    }
  };

  return (
    <>
      <CategoryNav
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={handleCategorySelect}
      />
      <main
        ref={mainRef}
        className="flex min-h-screen flex-col items-center p-6 md:p-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Order for Table {tableId}
        </h1>
        <OrderForm
          categories={categories}
          items={menuItems}
          tableId={tableId}
        />
      </main>
    </>
  );
}

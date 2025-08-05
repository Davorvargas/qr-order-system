"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import CategoryNav from "@/components/CategoryNav";
import MenuHeader from "@/components/MenuHeader";
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
  const [restaurantName, setRestaurantName] = useState<string>("SENDEROS");
  const [restaurantId, setRestaurantId] = useState<number>(1);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [featuredImages, setFeaturedImages] = useState<string[]>([]);
  const [restaurantLogo, setRestaurantLogo] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState<string>("#1e40af");
  const [secondaryColor, setSecondaryColor] = useState<string>("#fbbf24");

  // Debug log para ver cuando cambia el estado
  useEffect(() => {
    console.log("🔄 isHeaderScrolled state changed to:", isHeaderScrolled);
  }, [isHeaderScrolled]);
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
          .select(
            "table_number, restaurant_id, restaurants(name, logo_url, background_images, primary_color, secondary_color)"
          )
          .eq("id", tableId)
          .single();

        if (tableError || !tableData) {
          console.error("Error fetching table data:", tableError);
          console.error("Table ID being searched:", tableId);
          setError("No se pudo encontrar la mesa");
          return;
        }

        setTableNumber(tableData.table_number);
        const currentRestaurantId = tableData.restaurant_id;
        setRestaurantId(currentRestaurantId);

        // Set restaurant branding data if available
        if (tableData.restaurants) {
          setRestaurantName(tableData.restaurants.name || "SENDEROS");
          setRestaurantLogo(tableData.restaurants.logo_url || "");
          setPrimaryColor(tableData.restaurants.primary_color || "#1e40af");
          setSecondaryColor(tableData.restaurants.secondary_color || "#fbbf24");

          // Use restaurant background images if available, otherwise use featured images from menu items
          if (
            tableData.restaurants.background_images &&
            tableData.restaurants.background_images.length > 0
          ) {
            setFeaturedImages(tableData.restaurants.background_images);
          }
        }

        // 2. Obtener platos solo para ese restaurante, ordenados correctamente
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", currentRestaurantId)
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
          .eq("restaurant_id", currentRestaurantId)
          .order("display_order");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          setError("Error al cargar las categorías");
          return;
        }

        setAllCategories(categoriesData || []);
        setAllMenuItems(menuItemsData || []);

        // TODO: Comentado temporalmente para usar solo la imagen de fondo del restaurante
        // Get featured images from menu items only if no restaurant background images
        // if (menuItemsData && featuredImages.length === 0) {
        //   const featured = menuItemsData
        //     .filter((item) => item.image_url)
        //     .slice(0, 3)
        //     .map((item) => item.image_url!);
        //   setFeaturedImages(featured);
        // }

        // 4. Calcular categorías disponibles
        if (menuItemsData && categoriesData) {
          const itemCategoryIds = new Set(
            menuItemsData.map((item) => item.category_id)
          );
          const filteredCategories = categoriesData
            .filter((category) => itemCategoryIds.has(category.id))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

          setAvailableCategories(filteredCategories);

          // Establecer la primera categoría como activa solo si no hay una activa
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
  }, [tableId]); // Removido activeCategoryId de las dependencias

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const shouldBeScrolled = scrollTop > 50;

      // Solo actualizar el estado si realmente cambió
      if (shouldBeScrolled !== isHeaderScrolled) {
        console.log(
          "📱 Updating header state from",
          isHeaderScrolled,
          "to",
          shouldBeScrolled
        );
        setIsHeaderScrolled(shouldBeScrolled);
      }

      if (isScrollingRef.current || availableCategories.length === 0) return;

      // Debounce para evitar demasiadas actualizaciones
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
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
      }, 100); // 100ms de debounce
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => {
        mainElement.removeEventListener("scroll", handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [availableCategories, activeCategoryId, isHeaderScrolled]);

  const handleCategorySelect = (id: number) => {
    if (id === activeCategoryId) return; // No hacer nada si ya está activa

    isScrollingRef.current = true;
    setActiveCategoryId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1500); // Aumentado a 1.5 segundos para dar más tiempo al scroll
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
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <MenuHeader
        tableNumber={tableNumber}
        restaurantName={restaurantName}
        restaurantId={restaurantId}
        featuredImages={featuredImages}
        logoUrl={restaurantLogo}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isScrolled={isHeaderScrolled}
      />

      {/* Content container que se ajusta al header */}
      <div
        className="transition-all duration-300"
        style={{
          marginTop: isHeaderScrolled ? "64px" : "192px",
        }}
      >
        <CategoryNav
          categories={availableCategories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleCategorySelect}
          isHeaderScrolled={isHeaderScrolled}
        />
        <main
          ref={mainRef}
          className="flex flex-col items-center p-4 md:p-8"
          style={{
            overflowY: "scroll",
            height: isHeaderScrolled
              ? "calc(100vh - 120px)"
              : "calc(100vh - 248px)",
          }}
        >
          <OrderForm
            categories={availableCategories}
            items={allMenuItems}
            tableId={tableId}
          />
        </main>
      </div>
    </div>
  );
}

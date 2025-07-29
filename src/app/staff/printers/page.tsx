// src/app/staff/printers/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import PrinterManager from "@/components/PrinterManager";

export const dynamic = "force-dynamic";

export default async function PrintersPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });

  // Get the current user's restaurant_id
  // First try to get from tables, then from restaurants directly
  let restaurantId: string | null = null;

  // Try to get restaurant_id from tables first
  const { data: tables } = await supabase
    .from("tables")
    .select("restaurant_id")
    .limit(1);

  if (tables && tables.length > 0) {
    restaurantId = tables[0].restaurant_id;
  } else {
    // If no tables, get the first restaurant
    const { data: restaurants, error: restaurantsError } = await supabase
      .from("restaurants")
      .select("id")
      .limit(1);

    if (restaurantsError) {
      console.error("Error fetching restaurants:", restaurantsError);
      return <div>Error loading restaurant data.</div>;
    }

    if (restaurants && restaurants.length > 0) {
      restaurantId = restaurants[0].id;
    }
  }

  let content;

  if (!restaurantId) {
    content = (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No se encontró un restaurante
        </h2>
        <p className="text-gray-600 mb-4">
          Para usar el sistema de impresoras, primero necesitas crear un
          restaurante.
        </p>
        <p className="text-sm text-gray-500">
          Contacta al administrador del sistema para configurar tu restaurante.
        </p>
      </div>
    );
  } else {
    // Fetch printers for this restaurant
    const { data: printers, error: printersError } = await supabase
      .from("printers")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at");

    if (printersError) {
      console.error("Error fetching printers:", printersError);
      return <div>Error loading printer data.</div>;
    }

    content = (
      <div className="w-full">
        <PrinterManager initialPrinters={printers || []} />
      </div>
    );
  }

  return content;
}
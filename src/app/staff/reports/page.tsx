import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import CashRegisterManager from "@/components/CashRegisterManager";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });

  let restaurantId: string | null = null;

  // Obtener restaurant_id de las tablas
  const { data: tables } = await supabase
    .from("tables")
    .select("restaurant_id")
    .limit(1);

  if (tables && tables.length > 0) {
    restaurantId = tables[0].restaurant_id;
  } else {
    // Fallback a restaurants si no hay tablas
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

  if (!restaurantId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No se encontró un restaurante
        </h2>
        <p className="text-gray-600 mb-4">
          Para usar el sistema de reportes, primero necesitas crear un
          restaurante.
        </p>
        <p className="text-sm text-gray-500">
          Contacta al administrador del sistema para configurar tu restaurante.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CashRegisterManager restaurantId={restaurantId} />
    </div>
  );
}
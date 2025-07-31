// src/app/staff/qr-codes/page.tsx
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/database.types";
import QRCodeGenerator from "@/components/QRCodeGenerator";

export const dynamic = "force-dynamic";

export default async function QRCodesPage() {
  const supabase = await createClient();

  // Get restaurant_id
  let restaurantId: string | null = null;

  const { data: tables } = await supabase
    .from("tables")
    .select("restaurant_id")
    .limit(1);

  if (tables && tables.length > 0) {
    restaurantId = tables[0].restaurant_id;
  } else {
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
          Para generar códigos QR, primero necesitas crear un restaurante y configurar las mesas.
        </p>
        <p className="text-sm text-gray-500">
          Contacta al administrador del sistema para configurar tu restaurante.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Códigos QR de Mesas</h1>
        <p className="text-gray-600 mt-2">
          Genera y administra los códigos QR para que los clientes puedan acceder al menú desde sus mesas
        </p>
      </div>
      <QRCodeGenerator restaurantId={restaurantId} />
    </div>
  );
}
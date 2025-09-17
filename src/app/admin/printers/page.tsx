// src/app/admin/printers/page.tsx
import { createClient } from "@/utils/supabase/server";
import PrinterManager from "@/components/PrinterManager";

export const dynamic = "force-dynamic";

export default async function PrintersPage() {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso no autorizado
        </h2>
        <p className="text-gray-600">
          Debes iniciar sesión para acceder a esta página.
        </p>
      </div>
    );
  }

  // Get restaurant_id from user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Error al cargar perfil
        </h2>
        <p className="text-gray-600">
          No se pudo cargar la información del usuario.
        </p>
      </div>
    );
  }

  const restaurantId = profile?.restaurant_id;

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

    content = <PrinterManager initialPrinters={printers || []} />;
  }

  return content;
}

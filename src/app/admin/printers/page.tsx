// src/app/admin/printers/page.tsx
import { createClient } from "@/utils/supabase/server";
import PrinterManager from "@/components/PrinterManager";

export const dynamic = "force-dynamic";

export default async function PrintersPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No autenticado
        </h2>
        <p className="text-gray-600">
          Por favor inicia sesión para acceder a las impresoras.
        </p>
      </div>
    );
  }

  // Obtener restaurant_id del perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.restaurant_id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No se encontró un restaurante
        </h2>
        <p className="text-gray-600 mb-4">
          Tu usuario no está asociado a un restaurante.
        </p>
        <p className="text-sm text-gray-500">
          Contacta al administrador del sistema para configurar tu restaurante.
        </p>
      </div>
    );
  }

  const restaurantId = profile.restaurant_id;

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

  return <PrinterManager initialPrinters={printers || []} />;
}

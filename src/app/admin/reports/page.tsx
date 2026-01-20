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
          Por favor inicia sesión para acceder a los reportes.
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

  return <CashRegisterManager restaurantId={restaurantId} />;
}

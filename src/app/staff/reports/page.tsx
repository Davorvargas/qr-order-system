import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/lib/database.types";
import CashRegisterManager from "@/components/CashRegisterManager";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });

  // Check authentication first
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get restaurant ID from current user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.restaurant_id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No se encontró un restaurante
        </h2>
        <p className="text-gray-600 mb-4">
          Tu perfil no está asociado a ningún restaurante.
        </p>
        <p className="text-sm text-gray-500">
          Contacta al administrador del sistema para configurar tu perfil.
        </p>
      </div>
    );
  }

  const restaurantId = profile.restaurant_id;

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
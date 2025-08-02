"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import CashRegisterManager from "@/components/CashRegisterManager";

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check authentication
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);

        // Get restaurant ID from user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Error al cargar el perfil del usuario");
          return;
        }

        if (!profile?.restaurant_id) {
          setError("Tu perfil no está asociado a ningún restaurante");
          return;
        }

        setRestaurantId(profile.restaurant_id);
      } catch (err) {
        console.error("Error in auth check:", err);
        setError("Error al verificar la autenticación");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  if (error || !restaurantId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Error al cargar los reportes
        </h2>
        <p className="text-gray-600 mb-4">
          {error || "No se pudo obtener la información del restaurante"}
        </p>
        <p className="text-sm text-gray-500">
          Contacta al administrador del sistema para configurar tu perfil.
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
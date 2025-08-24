import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Verificar rol de administrador o staff
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, restaurant_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/unauthorized");
  }

  // Obtener datos del dashboard usando RPC
  let analytics = null;
  try {
    const { data, error: analyticsError } = await supabase.rpc(
      "get_dashboard_analytics_weekly",
      {
        p_restaurant_id: profile.restaurant_id,
      }
    );

    if (analyticsError) {
      console.error("RPC function not found or error:", analyticsError);
      console.log("Fallback: Using basic queries instead");

      // Fallback: obtener datos básicos si la función RPC no existe
      const today = new Date().toISOString().split("T")[0];

      const { data: ordersToday } = await supabase
        .from("orders")
        .select("total_price")
        .eq("restaurant_id", profile.restaurant_id)
        .gte("created_at", `${today}T00:00:00`)
        .not("status", "in", "(cancelled)");

      analytics = {
        revenue_today:
          ordersToday?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
        orders_today: ordersToday?.length || 0,
        revenue_yesterday: 0,
        orders_yesterday: 0,
        total_customers: 0,
        weekly_data: [],
        top_items: [],
        low_items: [],
        payment_methods: [],
        profit_matrix: { stars: [], gems: [], popular: [], problems: [] },
      };
    } else {
      analytics = data;
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    analytics = null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <DashboardContent
        initialAnalytics={analytics}
        restaurantId={profile.restaurant_id}
      />
    </div>
  );
}

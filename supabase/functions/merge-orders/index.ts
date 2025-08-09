import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { orderIds, targetOrderId } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 1) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos 1 orden para fusionar" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetOrderId) {
      return new Response(
        JSON.stringify({ error: "Se requiere una orden objetivo para la fusión" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que todas las órdenes existan y pertenezcan a la misma mesa
    const { data: orders, error: fetchError } = await supabase
      .from("orders")
      .select("id, table_id, restaurant_id, status, total_price")
      .in("id", [...orderIds, targetOrderId]);

    if (fetchError) {
      throw fetchError;
    }

    if (orders.length !== orderIds.length + 1) {
      return new Response(
        JSON.stringify({ error: "Una o más órdenes no existen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetOrder = orders.find(o => o.id === targetOrderId);
    const sourceOrders = orders.filter(o => orderIds.includes(o.id));

    // Verificar que todas las órdenes sean de la misma mesa
    const tableId = targetOrder?.table_id;
    if (!sourceOrders.every(o => o.table_id === tableId)) {
      return new Response(
        JSON.stringify({ error: "Solo se pueden fusionar órdenes de la misma mesa" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que las órdenes no estén completadas, canceladas o ya fusionadas
    const invalidOrders = orders.filter(o => 
      o.status === "completed" || o.status === "cancelled" || o.status === "merged"
    );
    if (invalidOrders.length > 0) {
      // Determinar el tipo de error específico
      const completedOrCancelled = invalidOrders.filter(o => 
        o.status === "completed" || o.status === "cancelled"
      );
      const merged = invalidOrders.filter(o => o.status === "merged");
      
      let errorMessage = "";
      if (completedOrCancelled.length > 0 && merged.length > 0) {
        errorMessage = "No se pueden fusionar órdenes completadas, canceladas o ya fusionadas";
      } else if (merged.length > 0) {
        errorMessage = "No se pueden fusionar órdenes que ya han sido fusionadas";
      } else {
        errorMessage = "No se pueden fusionar órdenes completadas o canceladas";
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener todos los items de las órdenes fuente
    const { data: sourceItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      throw itemsError;
    }

    // Obtener items de la orden objetivo
    const { data: targetItems, error: targetItemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", targetOrderId);

    if (targetItemsError) {
      throw targetItemsError;
    }

    // Calcular nuevo total
    const sourceTotal = sourceOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const targetTotal = targetOrder?.total_price || 0;
    const newTotal = sourceTotal + targetTotal;

    // Iniciar transacción
    const { error: transactionError } = await supabase.rpc("merge_orders", {
      source_order_ids: orderIds,
      target_order_id: targetOrderId,
      new_total: newTotal
    });

    if (transactionError) {
      throw transactionError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Órdenes fusionadas exitosamente",
        mergedOrderId: targetOrderId,
        newTotal: newTotal
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error merging orders:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}); 
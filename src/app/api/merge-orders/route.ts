import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { orderIds, targetOrderId } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 1) {
      return NextResponse.json(
        { error: "Se requiere al menos 1 orden fuente para fusionar" },
        { status: 400 }
      );
    }

    if (!targetOrderId) {
      return NextResponse.json(
        { error: "Se requiere una orden objetivo para la fusión" },
        { status: 400 }
      );
    }

    // Verificar que la orden target no esté incluida en las órdenes fuente
    if (orderIds.includes(targetOrderId)) {
      return NextResponse.json(
        { error: "La orden objetivo no puede fusionarse consigo misma" },
        { status: 400 }
      );
    }

    // Llamar a la Edge Function de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuración de Supabase incompleta" },
        { status: 500 }
      );
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/merge-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        orderIds,
        targetOrderId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Error al fusionar órdenes" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in merge-orders API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 
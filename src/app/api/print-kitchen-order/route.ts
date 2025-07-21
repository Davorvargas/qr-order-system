import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    // Simplemente restablecemos la bandera de impresión.
    // El servicio de la impresora en la Raspberry Pi detectará este cambio.
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ kitchen_printed: false })
      .eq("id", orderId);

    if (error) {
      console.error("Error al resetear 'kitchen_printed':", error);
      return NextResponse.json(
        { error: "Error de base de datos al solicitar la reimpresión" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Solicitud de reimpresión de cocina enviada",
    });

  } catch (error) {
    console.error("Error en el endpoint print-kitchen-order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
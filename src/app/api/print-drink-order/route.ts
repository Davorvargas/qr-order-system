import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    // Restablecemos la bandera de impresión para que el servicio de la impresora de bebidas lo detecte.
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ drink_printed: false })
      .eq("id", orderId);

    if (error) {
      console.error("Error al resetear 'drink_printed':", error);
      return NextResponse.json(
        { error: "Error de base de datos al solicitar la reimpresión" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Solicitud de reimpresión de bebidas enviada",
    });

  } catch (error) {
    console.error("Error en el endpoint print-drink-order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    // Obtener los detalles del pedido para reimprimir
    const supabase = await createClient();
    
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        customer_name,
        total_price,
        notes,
        status,
        table:tables(table_number),
        order_items(
          id,
          quantity,
          price_at_order,
          notes,
          menu_item:menu_items(name, description)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Error al obtener datos del pedido:", orderError);
      return NextResponse.json(
        { error: "Error al obtener datos del pedido" },
        { status: 500 }
      );
    }

    // Aquí podrías integrar con el servicio de impresión
    // Por ahora, simplemente devolvemos éxito
    // En un futuro, esto se conectaría al servicio de Python para imprimir en formato 80mm

    console.log("Reimprimiendo recibo para pedido:", orderId);
    console.log("Datos del pedido:", orderData);

    return NextResponse.json({
      message: "Recibo enviado a reimpresión exitosamente",
      orderId: orderId,
    });

  } catch (error) {
    console.error("Error en el endpoint print-receipt:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
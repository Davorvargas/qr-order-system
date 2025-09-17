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
        order_type,
        customer_phone,
        customer_address,
        delivery_date,
        delivery_time,
        customer_nit_carnet,
        customer_razon_social,
        table:tables(table_number),
        order_items(
          id,
          quantity,
          price_at_order,
          notes,
          menu_item:menu_items(name, description, price),
          order_item_modifiers(
            id,
            price_at_order,
            modifier_id,
            modifiers(name, price_modifier),
            modifier_groups(name)
          )
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

    // Actualizar la bandera de impresión de recibo
    const { error: updateError } = await supabase
      .from("orders")
      .update({ receipt_printed: false }) // Reset para que la impresora lo detecte
      .eq("id", orderId);

    if (updateError) {
      console.error("Error al resetear 'receipt_printed':", updateError);
      return NextResponse.json(
        { error: "Error de base de datos al solicitar la impresión del recibo" },
        { status: 500 }
      );
    }

    console.log("Reimprimiendo recibo para pedido:", orderId);
    console.log("Datos del pedido:", orderData);

    return NextResponse.json({
      message: "Recibo enviado a impresión exitosamente",
      orderId: orderId,
    });

  } catch (error) {
    console.error("Error en el endpoint print-receipt:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
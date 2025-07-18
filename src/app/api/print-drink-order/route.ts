import { createClient } from "@/utils/supabase/server";
import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    // 1. Ejecutar el script de impresión de bebidas
    const scriptPath = path.resolve(process.cwd(), "xprinter_service.py");
    const command = `python "${scriptPath}" --print-order ${orderId}`;

    console.log(`Ejecutando comando de bebidas: ${command}`);

    await new Promise<void>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al ejecutar script de bebidas: ${error.message}`);
          console.error(`Stderr: ${stderr}`);
          reject(new Error(`Error del script de bebidas: ${stderr || error.message}`));
          return;
        }
        console.log(`Stdout: ${stdout}`);
        resolve();
      });
    });

    // 2. Actualizar el estado en Supabase
    const supabase = await createClient();
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ drink_printed: true })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Error al actualizar 'drink_printed':", updateError);
      // No devolver error, pero registrarlo
    }

    // 3. Si ambas comandas están impresas, cambiar estado a 'in_progress'
    if (updatedOrder && updatedOrder.kitchen_printed) {
      await supabase
        .from("orders")
        .update({ status: 'in_progress' })
        .eq("id", orderId);
    }

    return NextResponse.json({ message: "Comanda de bebidas enviada a la impresora" });

  } catch (error) {
    console.error("Error en el endpoint print-drink-order:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
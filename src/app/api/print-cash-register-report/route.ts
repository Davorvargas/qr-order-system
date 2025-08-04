import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (type !== "cash_register_report") {
      return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Faltan datos del reporte" }, { status: 400 });
    }

    const supabase = await createClient();

    // Crear un registro en print_jobs para que la impresora lo detecte
    const { error: insertError } = await supabase
      .from("print_jobs")
      .insert({
        job_type: "cash_register_report",
        data: data,
        status: "pending",
        priority: "high"
      });

    if (insertError) {
      console.error("Error al crear print job:", insertError);
      return NextResponse.json(
        { error: "Error al enviar el reporte a la impresora" },
        { status: 500 }
      );
    }

    console.log("Reporte de cierre de caja enviado a impresión:", data);

    return NextResponse.json({
      message: "Reporte enviado a la impresora térmica exitosamente",
      jobType: "cash_register_report"
    });

  } catch (error) {
    console.error("Error en el endpoint print-cash-register-report:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
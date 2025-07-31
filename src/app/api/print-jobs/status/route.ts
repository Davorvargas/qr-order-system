import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface PrintJobUpdateData {
  status: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

interface PrinterUpdateData {
  last_seen: string;
  status: string;
  last_error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, status, errorMessage, printerId } = await req.json();

    if (!jobId || !status) {
      return NextResponse.json(
        { error: "jobId y status son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Update print job status
    const updateData: PrintJobUpdateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'printing') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.error_message = errorMessage || 'Error desconocido';
    }

    const { error: jobError } = await supabase
      .from("print_jobs")
      .update(updateData)
      .eq("id", jobId);

    if (jobError) {
      console.error("Error updating print job:", jobError);
      return NextResponse.json(
        { error: "Error al actualizar el trabajo de impresión" },
        { status: 500 }
      );
    }

    // Update printer last_seen and status if printerId provided
    if (printerId) {
      const printerUpdateData: PrinterUpdateData = {
        last_seen: new Date().toISOString(),
        status: status === 'failed' ? 'error' : 'online'
      };

      if (status === 'failed') {
        printerUpdateData.last_error = errorMessage || 'Error en trabajo de impresión';
      }

      const { error: printerError } = await supabase
        .from("printers")
        .update(printerUpdateData)
        .eq("id", printerId);

      if (printerError) {
        console.error("Error updating printer status:", printerError);
      }
    }

    // If job completed successfully, update order print flags
    if (status === 'completed') {
      const { data: job } = await supabase
        .from("print_jobs")
        .select("order_id, print_type")
        .eq("id", jobId)
        .single();

      if (job && job.order_id > 0) { // Don't update for test jobs (order_id = 0)
        const updateField = job.print_type === 'kitchen' ? 'kitchen_printed' : 'drink_printed';
        
        const { error: orderError } = await supabase
          .from("orders")
          .update({ [updateField]: true })
          .eq("id", job.order_id);

        if (orderError) {
          console.error("Error updating order print status:", orderError);
        }
      }
    }

    return NextResponse.json({
      message: "Estado del trabajo de impresión actualizado",
      status: status
    });

  } catch (error) {
    console.error("Error en el endpoint print-jobs/status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET endpoint to fetch pending print jobs (for external services)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const printerId = url.searchParams.get('printerId');
    
    if (!printerId) {
      return NextResponse.json(
        { error: "printerId es requerido" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data: jobs, error } = await supabase
      .from("print_jobs")
      .select(`
        *,
        orders!inner(id, customer_name, total_price, created_at, table:tables(table_number), order_items(*, menu_items(name)))
      `)
      .eq("printer_id", printerId)
      .eq("status", "pending")
      .order("requested_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching pending print jobs:", error);
      return NextResponse.json(
        { error: "Error al obtener trabajos pendientes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: jobs || [],
      count: jobs?.length || 0
    });

  } catch (error) {
    console.error("Error en el endpoint print-jobs GET:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
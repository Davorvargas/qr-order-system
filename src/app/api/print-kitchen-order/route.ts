import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req: NextRequest): Promise<Response> {
  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  return new Promise<Response>((resolve) => {
    exec(`python printer_service.py --print-order ${orderId}`, (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({ error: stderr || error.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ message: 'Comanda enviada a impresión', output: stdout }));
      }
    });
  });
} 
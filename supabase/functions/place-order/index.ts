// File: supabase/functions/place-order/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// The payload interface remains the same
interface OrderPayload {
  table_id: string;
  customer_name: string;
  total_price: number;
  notes: string | null;
  source?: 'customer_qr' | 'staff_placed'; // Make source optional
  order_items: {
    menu_item_id: number;
    quantity: number;
    price_at_order: number;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: OrderPayload = await req.json();

    if (!payload.table_id || !payload.customer_name || !payload.order_items || payload.order_items.length === 0) {
      throw new Error("Missing required order information.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- REFACTORED LOGIC ---
    // Instead of inserting directly, we now call the database function
    // which handles the transaction atomically.
    const { data, error } = await supabaseAdmin.rpc('create_new_order', {
      payload,
    });

    if (error) {
      console.error('RPC Error:', error);
      throw error;
    }

    // The database function returns { "order_id": ... }
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})

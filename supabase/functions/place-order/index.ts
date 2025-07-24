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
    const { table_id, customer_name, total_price, notes, order_items } = await req.json()

    // Create a Supabase client with the Auth context of the user that called the function.
    // This way your row-level-security policies are applied.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // 1. Obtener el restaurant_id de la mesa
    const { data: tableData, error: tableError } = await supabaseClient
      .from('tables')
      .select('restaurant_id')
      .eq('id', table_id)
      .single()

    if (tableError) throw tableError
    const restaurantId = tableData.restaurant_id

    // 2. Crear el pedido principal, ahora con el restaurant_id
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        table_id: table_id,
        customer_name: customer_name,
        total_price: total_price,
        notes: notes,
        status: 'pending',
        restaurant_id: restaurantId, // <-- AÑADIDO
      })
      .select('id')
      .single()

    if (orderError) throw orderError
    const orderId = orderData.id

    // Insert order_items
    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(
        order_items.map(item => ({
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price_at_order: item.price_at_order,
          notes: item.notes ?? null,
        }))
      );

    if (itemsError) throw itemsError;

    // Return the order_id
    return new Response(JSON.stringify({ order_id: orderId }), {
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

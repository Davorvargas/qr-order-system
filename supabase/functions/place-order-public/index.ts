// File: supabase/functions/place-order-public/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// The payload interface for public orders
interface PublicOrderPayload {
  table_id: string;
  customer_name: string;
  total_price: number;
  notes: string | null;
  source?: 'customer_qr' | 'staff_placed';
  order_items: {
    menu_item_id: number | null;
    quantity: number;
    price_at_order: number;
    notes: string | null;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Allow requests without authentication
  console.log('🔓 Public function - no authentication required')

  try {
    console.log('🔄 Processing public place-order request...')
    
    const requestBody = await req.json()
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))
    
    // Validate required fields
    if (!requestBody.table_id) {
      throw new Error('table_id is required')
    }
    if (!requestBody.customer_name) {
      throw new Error('customer_name is required')
    }
    if (!requestBody.order_items || !Array.isArray(requestBody.order_items)) {
      throw new Error('order_items must be an array')
    }
    if (requestBody.order_items.length === 0) {
      throw new Error('order_items cannot be empty')
    }
    
    const { table_id, customer_name, total_price, notes, order_items, source } = requestBody

    // Create an anonymous Supabase client for public access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    console.log('🔑 Anonymous Supabase client created')
    
    // 1. Obtener el restaurant_id de la mesa (acceso público)
    console.log('🏠 Fetching table info for table_id:', table_id)
    const { data: tableData, error: tableError } = await supabaseClient
      .from('tables')
      .select('restaurant_id')
      .eq('id', table_id)
      .single()

    if (tableError) {
      console.error('❌ Table error:', tableError)
      throw tableError
    }
    const restaurantId = tableData.restaurant_id
    console.log('✅ Restaurant ID found:', restaurantId)

    // 2. Verificar si hay impresoras activas en el restaurante
    const { data: activePrinters, error: printersError } = await supabaseClient
      .from('printers')
      .select('id, type, is_active')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)

    if (printersError) throw printersError

    // Determinar el status inicial basado en las impresoras activas
    const initialStatus = (activePrinters && activePrinters.length > 0) ? 'pending' : 'in_progress'

    // 3. Crear el pedido principal
    console.log('🆕 Creating order with status:', initialStatus)
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        table_id,
        restaurant_id: restaurantId,
        customer_name,
        total_price,
        notes,
        status: initialStatus,
        source: source || 'customer_qr'
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      throw orderError
    }

    const orderId = orderData.id
    console.log('✅ Order created with ID:', orderId)

    // 4. Crear los items del pedido
    console.log('📝 Creating order items...')
    const orderItemsData = order_items.map(item => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
      notes: item.notes
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError)
      throw itemsError
    }

    console.log('✅ Order items created successfully')

    // 5. Note: Print jobs functionality is not implemented yet
    // Orders will be created with status 'pending' or 'in_progress' based on active printers
    if (activePrinters && activePrinters.length > 0) {
      console.log('🖨️ Active printers found:', activePrinters.length)
    } else {
      console.log('🖨️ No active printers found')
    }

    console.log('🎉 Order placed successfully!')
    
    return new Response(JSON.stringify({
      success: true,
      order_id: orderId,
      message: 'Order placed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Error in place-order-public:', error)
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 
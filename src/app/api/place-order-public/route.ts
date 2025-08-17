import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing public place-order request...');
    
    const requestBody = await request.json();
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    
    // Validate required fields
    if (!requestBody.table_id) {
      return NextResponse.json(
        { error: 'table_id is required' },
        { status: 400 }
      );
    }
    if (!requestBody.customer_name) {
      return NextResponse.json(
        { error: 'customer_name is required' },
        { status: 400 }
      );
    }
    if (!requestBody.order_items || !Array.isArray(requestBody.order_items)) {
      return NextResponse.json(
        { error: 'order_items must be an array' },
        { status: 400 }
      );
    }
    if (requestBody.order_items.length === 0) {
      return NextResponse.json(
        { error: 'order_items cannot be empty' },
        { status: 400 }
      );
    }
    
    const { table_id, customer_name, total_price, notes, order_items, source } = requestBody;

    // Create an anonymous Supabase client for public access
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    console.log('🔑 Anonymous Supabase client created');
    
    // 1. Obtener el restaurant_id de la mesa (acceso público)
    console.log('🏠 Fetching table info for table_id:', table_id);
    const { data: tableData, error: tableError } = await supabaseClient
      .from('tables')
      .select('restaurant_id')
      .eq('id', table_id)
      .single();

    if (tableError) {
      console.error('❌ Table error:', tableError);
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    const restaurantId = tableData.restaurant_id;
    console.log('✅ Restaurant ID found:', restaurantId);

    // 2. Verificar si hay impresoras activas en el restaurante
    const { data: activePrinters, error: printersError } = await supabaseClient
      .from('printers')
      .select('id, type, is_active')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true);

    if (printersError) {
      console.error('❌ Printers error:', printersError);
      return NextResponse.json(
        { error: 'Error checking printers' },
        { status: 500 }
      );
    }

    // Determinar el status inicial basado en las impresoras activas
    const initialStatus = (activePrinters && activePrinters.length > 0) ? 'pending' : 'in_progress';

    // 3. Crear el pedido principal
    console.log('🆕 Creating order with status:', initialStatus);
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        table_id,
        restaurant_id: restaurantId,
        customer_name,
        total_price,
        notes,
        status: initialStatus,
        source: source || 'customer_qr',
        kitchen_printed: false,  // Marcar para impresión
        drink_printed: false,    // Marcar para impresión
        is_new_order: true,      // Marcar como nueva orden para el latido
        is_preparing: false,
        is_ready: false
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Error creating order' },
        { status: 500 }
      );
    }

    const orderId = orderData.id;
    console.log('✅ Order created with ID:', orderId);

    // 4. Crear los items del pedido
    console.log('📝 Creating order items...');
    const orderItemsData = order_items.map(item => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
      notes: item.notes
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError);
      return NextResponse.json(
        { error: 'Error creating order items' },
        { status: 500 }
      );
    }

    console.log('✅ Order items created successfully');

    // 5. Note: Print jobs functionality is not implemented yet
    if (activePrinters && activePrinters.length > 0) {
      console.log('🖨️ Active printers found:', activePrinters.length);
    } else {
      console.log('🖨️ No active printers found');
    }

    console.log('🎉 Order placed successfully!');
    
    return NextResponse.json({
      success: true,
      order_id: orderId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('❌ Error in place-order-public:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
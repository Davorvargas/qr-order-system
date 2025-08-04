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
    menu_item_id: number | null; // Allow null for custom products
    quantity: number;
    price_at_order: number;
    notes: string | null;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Processing place-order request...')
    
    // Check authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('🔑 Authorization header present:', authHeader ? 'Yes' : 'No')
    if (!authHeader) {
      console.error('❌ Missing authorization header')
      return new Response(JSON.stringify({ 
        error: 'Missing authorization header',
        details: 'No authorization header was provided in the request'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
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
    
    const { table_id, customer_name, total_price, notes, order_items } = requestBody

    // Create a Supabase client with the Auth context of the user that called the function.
    // This way your row-level-security policies are applied.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    console.log('🔑 Supabase client created')
    
    // 1. Obtener el restaurant_id de la mesa
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

    // 3. Crear el pedido principal, ahora con el restaurant_id y status correcto
    console.log('🆕 Creating order with status:', initialStatus)
    const orderInsertData = {
      table_id: table_id,
      customer_name: customer_name,
      total_price: total_price,
      notes: notes,
      status: initialStatus,
      restaurant_id: restaurantId,
    }
    console.log('📝 Order data:', JSON.stringify(orderInsertData, null, 2))
    
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert(orderInsertData)
      .select('id')
      .single()

    if (orderError) {
      console.error('❌ Order creation error:', orderError)
      throw orderError
    }
    const orderId = orderData.id
    console.log('✅ Order created with ID:', orderId)

    // Insert order_items and get their IDs for modifier insertion
    console.log('📋 Inserting order items...')
    
    // Handle custom products by creating unique menu items for each one
    const itemsToInsert = []
    for (const item of order_items) {
      if (item.menu_item_id === null) {
        // This is a custom product - create a unique menu item for it
        console.log('🔧 Creating unique menu item for custom product...')
        
        // Extract custom product info from notes
        let customProductName = 'Producto Especial'
        let customProductPrice = item.price_at_order
        let originalNotes = ''
        
        if (item.notes) {
          try {
            const parsedNotes = JSON.parse(item.notes)
            if (parsedNotes.type === 'custom_product') {
              customProductName = parsedNotes.name || customProductName
              originalNotes = parsedNotes.original_notes || ''
            }
          } catch (e) {
            // If notes aren't JSON, use them as the product name
            customProductName = item.notes.substring(0, 50) // Limit length
          }
        }
        
        console.log(`📝 Creating menu item: "${customProductName}" - Bs ${customProductPrice}`)
        
        // Create a unique menu item for this custom product
        const { data: newCustomItem, error: createError } = await supabaseClient
          .from('menu_items')
          .insert({
            name: customProductName,
            price: customProductPrice,
            restaurant_id: restaurantId,
            category_id: null, // No category for custom products
            is_available: false, // Mark as unavailable so it doesn't show in regular menu
            description: `Producto especial creado el ${new Date().toLocaleDateString('es-ES')} para orden #${orderId}`
          })
          .select('id')
          .single()
        
        if (createError) {
          console.error('❌ Error creating custom product menu item:', createError)
          throw new Error(`No se pudo crear el producto especial: ${createError.message}`)
        }
        
        const customMenuItemId = newCustomItem.id
        console.log('✅ Created custom product menu item with ID:', customMenuItemId)
        
        itemsToInsert.push({
          order_id: orderId,
          menu_item_id: customMenuItemId,
          quantity: item.quantity,
          price_at_order: item.price_at_order,
          notes: originalNotes || null, // Store only the user's notes, not the JSON
        })
      } else {
        // Regular menu item
        itemsToInsert.push({
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price_at_order: item.price_at_order,
          notes: item.notes ?? null,
        })
      }
    }
    
    console.log('🔍 Items to insert:', JSON.stringify(itemsToInsert, null, 2))
    
    const { data: insertedItems, error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(itemsToInsert)
      .select('id');

    if (itemsError) {
      console.error('❌ Items insertion error:', itemsError)
      throw itemsError
    }
    console.log('✅ Items inserted:', insertedItems?.length || 0)

    // Process modifiers from notes and insert them into order_item_modifiers
    if (insertedItems) {
      for (let i = 0; i < insertedItems.length; i++) {
        const orderItem = insertedItems[i];
        const originalItem = order_items[i];
        
        // Check if the notes contain modifier information
        if (originalItem.notes) {
          try {
            // Check if notes contain JSON data
            if (originalItem.notes.startsWith('{')) {
              const parsedData = JSON.parse(originalItem.notes);
              
              // Only process modifiers if it's not a custom product and has selectedModifiers
              if (parsedData.type !== 'custom_product' && parsedData.selectedModifiers) {
                console.log('🔍 Processing modifiers for order item:', orderItem.id);
                console.log('🔍 Selected modifiers data:', JSON.stringify(parsedData.selectedModifiers, null, 2));
                
                const modifierInserts = [];
                
                for (const [groupName, selectedOptions] of Object.entries(parsedData.selectedModifiers)) {
                  console.log(`🔍 Processing group "${groupName}" with options:`, selectedOptions);
                  
                  for (const optionName of selectedOptions as string[]) {
                    console.log(`🔍 Looking for modifier: "${optionName}"`);
                    
                    // Find the modifier in the database - also filter by restaurant_id for safety
                    const { data: modifier, error: modifierError } = await supabaseClient
                      .from('modifiers')
                      .select('id, modifier_group_id, price_modifier, modifier_groups(name, restaurant_id)')
                      .eq('name', optionName)
                      .single();
                    
                    console.log(`🔍 Modifier search result:`, { modifier, error: modifierError });
                    
                    if (modifier) {
                      // Verify the modifier belongs to the correct restaurant
                      if (modifier.modifier_groups?.restaurant_id === restaurantId) {
                        modifierInserts.push({
                          order_item_id: orderItem.id,
                          modifier_id: modifier.id,
                          modifier_group_id: modifier.modifier_group_id,
                          price_at_order: modifier.price_modifier || 0
                        });
                        console.log(`✅ Added modifier to insert queue: ${optionName}`);
                      } else {
                        console.log(`❌ Modifier ${optionName} belongs to different restaurant`);
                      }
                    } else {
                      console.log(`❌ Modifier not found: ${optionName}`);
                    }
                  }
                }
                
                console.log(`🔍 Total modifiers to insert: ${modifierInserts.length}`);
                console.log(`🔍 Modifier inserts:`, JSON.stringify(modifierInserts, null, 2));
                
                if (modifierInserts.length > 0) {
                  const { error: insertError } = await supabaseClient
                    .from('order_item_modifiers')
                    .insert(modifierInserts);
                    
                  if (insertError) {
                    console.error('❌ Error inserting modifiers:', insertError);
                  } else {
                    console.log(`✅ Successfully inserted ${modifierInserts.length} modifiers`);
                  }
                }
              }
            }
          } catch (parseError) {
            // If notes aren't JSON, that's fine - they might just be regular notes
            console.log('Notes are not modifier JSON, treating as regular notes:', parseError);
          }
        }
      }
    }

    // Return the order_id
    console.log('🎉 Order placement successful! Returning order ID:', orderId)
    return new Response(JSON.stringify({ order_id: orderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Error in place-order function:', error)
    console.error('📊 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack || 'No stack trace available'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})

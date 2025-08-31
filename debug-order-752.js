const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrder752() {
  console.log('🔍 DEBUGGING ORDER 752 - NO ITEMS ISSUE');
  console.log('='.repeat(60));
  
  try {
    // 1. Check if order exists
    console.log('\n📋 STEP 1: CHECKING ORDER EXISTS');
    console.log('-'.repeat(40));
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', 752)
      .single();
      
    if (orderError) {
      console.error('❌ Error fetching order 752:', orderError);
      return;
    }
    
    if (!order) {
      console.log('❌ Order 752 not found');
      return;
    }
    
    console.log('✅ Order 752 found:');
    console.log('   ID:', order.id);
    console.log('   Status:', order.status);
    console.log('   Total Price:', order.total_price);
    console.log('   Customer:', order.customer_name);
    console.log('   Restaurant ID:', order.restaurant_id);
    console.log('   Created:', order.created_at);
    
    // 2. Check order_items directly
    console.log('\n📦 STEP 2: CHECKING ORDER_ITEMS FOR ORDER 752');
    console.log('-'.repeat(40));
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        menu_items(name, price),
        order_item_modifiers(
          id,
          price_at_order,
          modifier_id,
          modifiers(name, price_modifier),
          modifier_groups(name)
        )
      `)
      .eq('order_id', 752);
      
    if (itemsError) {
      console.error('❌ Error fetching order_items:', itemsError);
      return;
    }
    
    console.log(`📊 Found ${orderItems?.length || 0} items for order 752:`);
    
    if (orderItems && orderItems.length > 0) {
      orderItems.forEach((item, index) => {
        console.log(`   Item ${index + 1}:`);
        console.log('     ID:', item.id);
        console.log('     Menu Item ID:', item.menu_item_id);
        console.log('     Menu Item Name:', item.menu_items?.name || 'NULL');
        console.log('     Quantity:', item.quantity);
        console.log('     Price:', item.price_at_order);
        console.log('     Notes:', item.notes || 'None');
        console.log('     Modifiers:', item.order_item_modifiers?.length || 0);
      });
    } else {
      console.log('❌ NO ITEMS FOUND - This is the problem!');
    }
    
    // 3. Check complete order with join (same as frontend)
    console.log('\n🔗 STEP 3: CHECKING COMPLETE ORDER WITH JOIN (Frontend Query)');
    console.log('-'.repeat(40));
    
    const { data: completeOrder, error: completeError } = await supabase
      .from('orders')
      .select(`
        *, 
        notes,
        is_new_order,
        is_preparing, 
        is_ready,
        table:tables(table_number, restaurant_id), 
        order_items(
          *, 
          notes, 
          menu_items(name, price),
          order_item_modifiers(
            id,
            price_at_order,
            modifier_id,
            modifiers(name, price_modifier),
            modifier_groups(name)
          )
        )
      `)
      .eq('id', 752)
      .single();
      
    if (completeError) {
      console.error('❌ Error with complete query:', completeError);
      return;
    }
    
    console.log('📋 Complete Order Data:');
    console.log('   Order ID:', completeOrder?.id);
    console.log('   Items Count:', completeOrder?.order_items?.length || 0);
    
    if (completeOrder?.order_items && completeOrder.order_items.length > 0) {
      console.log('✅ Items found in complete query:');
      completeOrder.order_items.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.menu_items?.name || 'Custom'} (Qty: ${item.quantity})`);
      });
    } else {
      console.log('❌ NO ITEMS in complete query - Frontend will show "0 items"');
    }
    
    // 4. Check RLS policies
    console.log('\n🛡️  STEP 4: CHECKING ROW LEVEL SECURITY');
    console.log('-'.repeat(40));
    
    // Test with anon key (like frontend would use)
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDMxMjUsImV4cCI6MjA2NjM3OTEyNX0.qODggF1_b2mzjVFr6THKs8HUxGnSQlJPiLSLnRDJq3E');
    
    const { data: anonItems, error: anonError } = await anonSupabase
      .from('order_items')
      .select('*')
      .eq('order_id', 752);
      
    console.log('🔓 Anon access to order_items:');
    console.log('   Error:', anonError?.message || 'None');
    console.log('   Items found:', anonItems?.length || 0);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugOrder752();
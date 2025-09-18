const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateRealTimeEmptyPrinting() {
  console.log('=== INVESTIGATING REAL-TIME EMPTY PRINTING ISSUE ===');
  console.log('Focus: When was an order ACTUALLY printed empty (not after merging)');
  console.log();

  try {
    // 1. Look for orders that were created WITHOUT items from the beginning
    console.log('1. CHECKING FOR ORDERS CREATED WITHOUT ITEMS:');

    // Check orders that have no order_items at all (not due to merging)
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, customer_name, status, created_at, kitchen_printed, notes')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .order('created_at', { ascending: false })
      .limit(50);

    let ordersWithoutItems = [];

    for (const order of allOrders) {
      const { data: items } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', order.id);

      if (!items || items.length === 0) {
        ordersWithoutItems.push(order);
      }
    }

    console.log(`Found ${ordersWithoutItems.length} orders that never had any items:`);
    ordersWithoutItems.forEach(order => {
      console.log(`  Order #${order.id} - ${order.customer_name} - Status: ${order.status} - Printed: ${order.kitchen_printed}`);
      console.log(`    Created: ${order.created_at}`);
      console.log(`    Notes: ${order.notes || 'None'}`);

      if (order.kitchen_printed && !order.notes?.includes('Fusionada')) {
        console.log(`    ❌ CRITICAL: This was printed empty and NOT due to merging!`);
      }
      console.log();
    });

    // 2. Check for orders currently in the print queue that would print empty
    console.log('2. CHECKING CURRENT PRINT QUEUE FOR EMPTY ORDERS:');

    const { data: currentQueue } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .in('status', ['pending', 'in_progress'])
      .order('id');

    console.log(`Current print queue: ${currentQueue?.length || 0} orders`);

    if (currentQueue && currentQueue.length > 0) {
      currentQueue.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        console.log(`  Order #${order.id} - ${order.customer_name} - Items: ${itemCount}`);

        if (itemCount === 0) {
          console.log(`    ❌ CRITICAL: This order would print EMPTY right now!`);
          console.log(`    Created: ${order.created_at}`);
          console.log(`    Status: ${order.status}`);
        }
      });
    } else {
      console.log('  ✅ No orders currently in print queue');
    }

    // 3. Look for patterns in order creation that might create empty orders
    console.log('\n3. ANALYZING ORDER CREATION PATTERNS:');

    // Check for failed order creation processes
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .gte('created_at', '2025-09-17T00:00:00Z') // Last couple of days
      .order('created_at', { ascending: false });

    if (recentOrders) {
      console.log(`Analyzing ${recentOrders.length} recent orders for creation patterns:`);

      let emptyAtCreation = 0;
      let normalOrders = 0;

      recentOrders.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        const isEmptyAtCreation = itemCount === 0 && !order.notes?.includes('Fusionada');

        if (isEmptyAtCreation) {
          emptyAtCreation++;
          console.log(`  ❌ Order #${order.id} - ${order.customer_name} - Empty at creation!`);
          console.log(`    Created: ${order.created_at}`);
          console.log(`    Status: ${order.status}`);
          console.log(`    Printed: ${order.kitchen_printed}`);
        } else {
          normalOrders++;
        }
      });

      console.log(`\nCreation Pattern Analysis:`);
      console.log(`  Normal orders: ${normalOrders}`);
      console.log(`  Empty at creation: ${emptyAtCreation}`);
      console.log(`  Empty creation rate: ${((emptyAtCreation / (normalOrders + emptyAtCreation)) * 100).toFixed(1)}%`);
    }

    // 4. Check for database constraint or API issues
    console.log('\n4. CHECKING FOR POTENTIAL API/DATABASE ISSUES:');

    // Look for orders where order_items insert might have failed
    const { data: ordersWithNullItems } = await supabase
      .from('order_items')
      .select('*, orders(id, customer_name, created_at)')
      .is('menu_item_id', null)
      .limit(10);

    if (ordersWithNullItems && ordersWithNullItems.length > 0) {
      console.log(`Found ${ordersWithNullItems.length} order_items with null menu_item_id:`);
      ordersWithNullItems.forEach(item => {
        const order = item.orders;
        console.log(`  Order #${order.id} - ${order.customer_name}`);
        console.log(`    Item ID: ${item.id} has null menu_item_id`);
        console.log(`    This could cause display issues in printer service`);
      });
    } else {
      console.log(`  ✅ No order_items with null menu_item_id found`);
    }

    // 5. Test the exact printer service query RIGHT NOW
    console.log('\n5. SIMULATING PRINTER SERVICE QUERY RIGHT NOW:');

    const { data: simulatedQuery } = await supabase
      .from('orders')
      .select('*, notes, order_items(*, notes, menu_items(*))')
      .eq('kitchen_printed', false)
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .order('id');

    console.log(`Printer service would currently process: ${simulatedQuery?.length || 0} orders`);

    if (simulatedQuery) {
      simulatedQuery.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        const wouldPrint = ['pending', 'in_progress'].includes(order.status);

        console.log(`  Order #${order.id} - ${order.customer_name} - Status: ${order.status} - Items: ${itemCount}`);

        if (wouldPrint && itemCount === 0) {
          console.log(`    ❌ WOULD PRINT EMPTY RIGHT NOW!`);
        } else if (wouldPrint && itemCount > 0) {
          console.log(`    ✅ Would print normally`);
        } else if (!wouldPrint) {
          console.log(`    ⏸️  Would skip (status filter)`);
        }
      });
    }

    // 6. Summary and recommendations
    console.log('\n6. REAL-TIME EMPTY PRINTING ANALYSIS:');
    console.log('=====================================');

    const currentEmptyInQueue = currentQueue?.filter(o => (o.order_items?.length || 0) === 0).length || 0;

    if (currentEmptyInQueue > 0) {
      console.log(`❌ IMMEDIATE ISSUE: ${currentEmptyInQueue} orders in queue would print empty NOW`);
      console.log(`   ACTION NEEDED: Fix printer service before next order`);
    } else {
      console.log(`✅ CURRENT STATUS: No orders would print empty right now`);
    }

    console.log(`\nPOSSIBLE CAUSES FOR INTERMITTENT EMPTY TICKETS:`);
    console.log(`1. API failures during order_items creation`);
    console.log(`2. Race conditions in order creation process`);
    console.log(`3. Database constraint violations`);
    console.log(`4. Network issues during order placement`);
    console.log(`5. Menu item deletions causing join failures`);

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigateRealTimeEmptyPrinting();
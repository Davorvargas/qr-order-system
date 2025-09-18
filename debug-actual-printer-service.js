const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

// Correct Senderos restaurant ID from the actual printer service
const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugActualPrinterService() {
  console.log('=== DEBUGGING ACTUAL PRINTER SERVICE BEHAVIOR ===');
  console.log(`Using correct Senderos restaurant ID: ${SENDEROS_RESTAURANT_ID}`);
  console.log();

  try {
    // 1. Simulate EXACT query that printer service uses (line 387)
    console.log('1. SIMULATING EXACT PRINTER SERVICE QUERY:');
    console.log('Query: orders.select(*, notes, order_items(*, notes, menu_items(*)))');
    console.log('       .eq(kitchen_printed, false)');
    console.log('       .eq(restaurant_id, senderos_restaurant_id)');
    console.log('       .order(id)');
    console.log();

    const { data: ordersToProcess, error: queryError } = await supabase
      .from('orders')
      .select('*, notes, order_items(*, notes, menu_items(*))')
      .eq('kitchen_printed', false)
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .order('id');

    if (queryError) {
      console.error('❌ Query error:', queryError);
      return;
    }

    console.log(`📊 Printer service would find ${ordersToProcess?.length || 0} orders to process`);
    console.log();

    if (!ordersToProcess || ordersToProcess.length === 0) {
      console.log('✅ No orders waiting to be printed - this explains why no empty tickets recently');

      // Check if there are any recent orders that were already printed
      console.log('\n2. CHECKING RECENT PRINTED ORDERS:');
      const { data: recentPrinted } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(name))')
        .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
        .eq('kitchen_printed', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentPrinted) {
        console.log(`Found ${recentPrinted.length} recent printed orders:`);
        recentPrinted.forEach(order => {
          const itemCount = order.order_items?.length || 0;
          const status = itemCount === 0 ? '❌ EMPTY!' : '✅ Has items';
          console.log(`  Order #${order.id} - ${order.customer_name} - ${itemCount} items ${status}`);
        });
      }

      return;
    }

    // 2. Analyze each order that would be processed
    console.log('2. ANALYZING ORDERS THAT WOULD BE PROCESSED:');
    let emptyOrdersCount = 0;
    let problemOrders = [];

    for (const order of ordersToProcess) {
      const orderItems = order.order_items || [];
      const itemCount = orderItems.length;

      console.log(`\nOrder #${order.id} - ${order.customer_name}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Created: ${order.created_at}`);
      console.log(`  Order items: ${itemCount}`);

      // Check if this order would pass the status filter (line 395)
      const wouldBePrinted = order.status === 'pending' || order.status === 'in_progress';
      console.log(`  Would be printed: ${wouldBePrinted ? 'YES' : 'NO'} (status filter)`);

      if (wouldBePrinted) {
        if (itemCount === 0) {
          console.log(`  ❌ CRITICAL: This order would print EMPTY TICKET!`);
          emptyOrdersCount++;
          problemOrders.push({
            id: order.id,
            customer: order.customer_name,
            status: order.status,
            issue: 'NO_ITEMS'
          });
        } else {
          // Check for null menu items
          let hasNullMenuItems = false;
          for (const item of orderItems) {
            if (!item.menu_items) {
              hasNullMenuItems = true;
              console.log(`    ❌ Item ${item.id} has NULL menu_items (menu_item_id: ${item.menu_item_id})`);
            } else {
              console.log(`    ✅ ${item.quantity}x ${item.menu_items.name}`);
            }
          }

          if (hasNullMenuItems) {
            problemOrders.push({
              id: order.id,
              customer: order.customer_name,
              status: order.status,
              issue: 'NULL_MENU_ITEMS'
            });
          }
        }
      }
    }

    // 3. Summary of issues
    console.log('\n3. ISSUE SUMMARY:');
    console.log(`Total orders waiting: ${ordersToProcess.length}`);
    console.log(`Orders that would print empty: ${emptyOrdersCount}`);
    console.log(`Orders with problems: ${problemOrders.length}`);

    if (problemOrders.length > 0) {
      console.log('\nPROBLEMATIC ORDERS:');
      problemOrders.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer} - Issue: ${order.issue}`);
      });
    }

    // 4. Check for merged orders in the queue
    console.log('\n4. CHECKING FOR MERGED ORDERS IN PRINT QUEUE:');
    const mergedInQueue = ordersToProcess.filter(order => order.status === 'merged');
    if (mergedInQueue.length > 0) {
      console.log(`❌ Found ${mergedInQueue.length} merged orders in print queue!`);
      mergedInQueue.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer_name} - Status: merged`);
        console.log(`    This should NOT be in print queue!`);
      });
    } else {
      console.log('✅ No merged orders in print queue');
    }

    // 5. Look for recent problematic patterns
    console.log('\n5. CHECKING RECENT PRINTING PATTERNS:');

    // Check orders printed in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: recentActivity } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', true)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (recentActivity) {
      let recentEmptyCount = 0;
      console.log(`Recent activity (last 24h): ${recentActivity.length} printed orders`);

      recentActivity.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        if (itemCount === 0) {
          recentEmptyCount++;
          console.log(`  ❌ Order #${order.id} - ${order.customer_name} - EMPTY (Status: ${order.status})`);
        }
      });

      console.log(`Recent empty tickets: ${recentEmptyCount}`);

      if (recentEmptyCount === 0) {
        console.log('✅ No recent empty tickets - issue may have been resolved');
      } else {
        console.log('❌ Empty tickets are still occurring recently');
      }
    }

  } catch (error) {
    console.error('Error in debugging:', error);
  }
}

debugActualPrinterService();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigatePrinterStatusFilter() {
  console.log('=== INVESTIGATING PRINTER SERVICE STATUS FILTER ISSUE ===');
  console.log();

  try {
    // 1. Check what the actual printer service logic does
    console.log('1. PRINTER SERVICE LOGIC ANALYSIS:');
    console.log('   Line 395: if order[status] in [pending, in_progress]:');
    console.log('   This means orders with other statuses (cancelled, completed) are SKIPPED');
    console.log('   But they remain kitchen_printed: false FOREVER!');
    console.log();

    // 2. Find all orders that are stuck with kitchen_printed: false
    console.log('2. FINDING STUCK ORDERS (kitchen_printed: false):');
    const { data: stuckOrders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .order('created_at', { ascending: false });

    if (stuckOrders) {
      console.log(`Found ${stuckOrders.length} orders with kitchen_printed: false`);

      let pendingInProgress = 0;
      let otherStatuses = 0;

      stuckOrders.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        const shouldPrint = order.status === 'pending' || order.status === 'in_progress';

        if (shouldPrint) {
          pendingInProgress++;
          console.log(`  ✅ Order #${order.id} - ${order.customer_name} - Status: ${order.status} - Items: ${itemCount} - WOULD PRINT`);
        } else {
          otherStatuses++;
          console.log(`  ❌ Order #${order.id} - ${order.customer_name} - Status: ${order.status} - Items: ${itemCount} - STUCK (never prints)`);
        }
      });

      console.log(`\nSUMMARY:`);
      console.log(`  Orders that would print: ${pendingInProgress}`);
      console.log(`  Orders stuck forever: ${otherStatuses}`);
    }

    // 3. Find recent orders that changed status AFTER being created
    console.log('\n3. CHECKING FOR STATUS CHANGES THAT CAUSE STUCK ORDERS:');

    // Get recent orders that are completed/cancelled but never printed
    const { data: statusChangedOrders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (statusChangedOrders && statusChangedOrders.length > 0) {
      console.log(`Found ${statusChangedOrders.length} orders that changed status but never printed:`);

      statusChangedOrders.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        console.log(`  Order #${order.id} - ${order.customer_name}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Created: ${order.created_at}`);
        console.log(`    Items: ${itemCount}`);
        console.log(`    Problem: Status changed to ${order.status} but never got printed`);
        console.log();
      });
    }

    // 4. Check if there are merged orders that need cleanup
    console.log('4. CHECKING FOR MERGED ORDERS THAT NEED CLEANUP:');
    const { data: mergedUnprinted } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .eq('status', 'merged');

    if (mergedUnprinted && mergedUnprinted.length > 0) {
      console.log(`❌ Found ${mergedUnprinted.length} merged orders that were never marked as printed!`);
      mergedUnprinted.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer_name} - Items: ${order.order_items?.length || 0}`);
      });
    } else {
      console.log('✅ No merged orders stuck in print queue');
    }

    // 5. Look for the empty ticket pattern
    console.log('\n5. ANALYZING EMPTY TICKET PATTERN:');

    // Check for orders that were printed with 0 items in the last few days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: recentPrintedOrders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', true)
      .gte('created_at', threeDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentPrintedOrders) {
      let emptyPrintedCount = 0;
      let totalPrintedCount = recentPrintedOrders.length;

      console.log(`Checking ${totalPrintedCount} orders printed in last 3 days...`);

      recentPrintedOrders.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        if (itemCount === 0) {
          emptyPrintedCount++;
          console.log(`  ❌ Order #${order.id} - ${order.customer_name} - EMPTY PRINT - Status: ${order.status}`);
        }
      });

      console.log(`\nEMPTY TICKET ANALYSIS (last 3 days):`);
      console.log(`  Total printed orders: ${totalPrintedCount}`);
      console.log(`  Empty tickets: ${emptyPrintedCount}`);
      console.log(`  Empty ticket rate: ${((emptyPrintedCount / totalPrintedCount) * 100).toFixed(1)}%`);

      if (emptyPrintedCount === 0) {
        console.log('  ✅ No empty tickets in recent days - issue may be resolved');
      } else {
        console.log('  ❌ Empty tickets are still occurring');
      }
    }

    // 6. Recommendations
    console.log('\n6. RECOMMENDATIONS TO FIX THE ISSUES:');
    console.log();

    if (otherStatuses > 0) {
      console.log('❌ ISSUE: Orders stuck with kitchen_printed: false');
      console.log('   SOLUTION: Clean up old orders that will never print');
      console.log('   CODE FIX: Mark non-pending/in_progress orders as printed');
    }

    console.log('❌ ISSUE: No validation for empty orders before printing');
    console.log('   SOLUTION: Add validation in print_kitchen_ticket function');
    console.log('   CODE FIX: Check if order_items.length > 0 before printing');

    console.log('❌ ISSUE: Merged orders might be printed before merging completes');
    console.log('   SOLUTION: Add status check to exclude merged orders');
    console.log('   CODE FIX: Add .neq("status", "merged") to query');

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigatePrinterStatusFilter();
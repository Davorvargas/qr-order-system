const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

// CORRECT Senderos restaurant ID
const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateMergedOrders() {
  console.log('=== INVESTIGATING MERGED ORDERS AND EMPTY TICKETS ===');
  console.log();

  try {
    // 1. Find all orders with merged status
    console.log('1. CHECKING ALL MERGED ORDERS:');
    const { data: mergedOrders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', 'merged')
      .order('created_at', { ascending: false });

    if (mergedOrders && mergedOrders.length > 0) {
      console.log(`Found ${mergedOrders.length} merged orders:`);

      for (const order of mergedOrders) {
        const itemCount = order.order_items?.length || 0;
        console.log(`  Order #${order.id} - ${order.customer_name}`);
        console.log(`    Restaurant: ${order.restaurant_id}`);
        console.log(`    Items: ${itemCount}`);
        console.log(`    Kitchen Printed: ${order.kitchen_printed}`);
        console.log(`    Notes: ${order.notes || 'None'}`);

        if (itemCount === 0 && order.kitchen_printed) {
          console.log(`    ❌ CRITICAL: This order was printed but has NO ITEMS!`);
        }
        console.log();
      }
    } else {
      console.log('No merged orders found');
    }

    // 2. Find all orders that were printed but have no items
    console.log('2. CHECKING ALL PRINTED ORDERS WITH NO ITEMS (ANY RESTAURANT):');
    const { data: emptyPrintedOrders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('kitchen_printed', true)
      .order('created_at', { ascending: false })
      .limit(100);

    let emptyPrintedCount = 0;
    if (emptyPrintedOrders) {
      for (const order of emptyPrintedOrders) {
        const itemCount = order.order_items?.length || 0;
        if (itemCount === 0) {
          emptyPrintedCount++;
          console.log(`  Order #${order.id} - ${order.customer_name}`);
          console.log(`    Restaurant: ${order.restaurant_id}`);
          console.log(`    Status: ${order.status}`);
          console.log(`    Created: ${order.created_at}`);
          console.log(`    Notes: ${order.notes || 'None'}`);
          console.log(`    ❌ This would have printed as EMPTY TICKET!`);
          console.log();
        }
      }
    }

    console.log(`Total empty printed orders found: ${emptyPrintedCount}`);

    // 3. Check if there are order_items that exist but the join is failing
    console.log('\n3. TESTING JOIN QUERY VS DIRECT QUERY:');

    // Get recent orders using join
    const { data: joinOrders } = await supabase
      .from('orders')
      .select('id, order_items(id)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .order('created_at', { ascending: false })
      .limit(5);

    for (const order of joinOrders || []) {
      const joinItemCount = order.order_items?.length || 0;

      // Get same order using direct query
      const { data: directItems } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', order.id);

      const directItemCount = directItems?.length || 0;

      if (joinItemCount !== directItemCount) {
        console.log(`  Order #${order.id}:`);
        console.log(`    Join query: ${joinItemCount} items`);
        console.log(`    Direct query: ${directItemCount} items`);
        console.log(`    ❌ MISMATCH! Join query is failing`);
      }
    }

    // 4. Check for orders with deleted menu items
    console.log('\n4. CHECKING FOR ORDERS WITH DELETED MENU ITEMS:');
    const { data: orderItemsWithNullMenu } = await supabase
      .from('order_items')
      .select('*, orders(id, customer_name, kitchen_printed)')
      .is('menu_item_id', null)
      .limit(10);

    if (orderItemsWithNullMenu && orderItemsWithNullMenu.length > 0) {
      console.log(`Found ${orderItemsWithNullMenu.length} order items with null menu_item_id:`);
      orderItemsWithNullMenu.forEach(item => {
        const order = item.orders;
        console.log(`  Order #${order?.id} - ${order?.customer_name} (printed: ${order?.kitchen_printed})`);
        console.log(`    Item ID: ${item.id}, Menu Item ID: null`);
      });
    } else {
      console.log('No order items with null menu_item_id found');
    }

    // 5. Check for menu items that have been deleted
    console.log('\n5. CHECKING FOR REFERENCES TO DELETED MENU ITEMS:');
    const { data: recentOrderItems } = await supabase
      .from('order_items')
      .select('*, menu_items(id, name), orders(id, customer_name, kitchen_printed, restaurant_id)')
      .eq('orders.restaurant_id', SENDEROS_RESTAURANT_ID)
      .order('created_at', { ascending: false })
      .limit(50);

    let deletedMenuItemsCount = 0;
    if (recentOrderItems) {
      for (const item of recentOrderItems) {
        if (item.menu_item_id && !item.menu_items) {
          deletedMenuItemsCount++;
          const order = item.orders;
          console.log(`  Order #${order?.id} - ${order?.customer_name} (printed: ${order?.kitchen_printed})`);
          console.log(`    Item references deleted menu_item_id: ${item.menu_item_id}`);
        }
      }
    }

    if (deletedMenuItemsCount === 0) {
      console.log('No references to deleted menu items found');
    } else {
      console.log(`Found ${deletedMenuItemsCount} items referencing deleted menu items`);
    }

    // 6. Summary of issues
    console.log('\n=== SUMMARY OF ISSUES THAT CAUSE EMPTY TICKETS ===');
    console.log(`1. Merged orders with no items: Found ${mergedOrders?.filter(o => o.order_items?.length === 0).length || 0}`);
    console.log(`2. All empty printed orders: ${emptyPrintedCount}`);
    console.log(`3. Items with deleted menu references: ${deletedMenuItemsCount}`);

    console.log('\n=== POTENTIAL CAUSES FOR EMPTY TICKETS ===');
    console.log('1. ❌ WRONG RESTAURANT ID in printer service');
    console.log('2. ❌ Merged orders being printed before items are transferred');
    console.log('3. ❌ Orders marked as printed when database join fails');
    console.log('4. ❌ Deleted menu items causing display issues');
    console.log('5. ❌ Printer service not validating order content before printing');

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigateMergedOrders();
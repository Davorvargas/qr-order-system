const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';
const RESTAURANT_ID = 'd4503f1b-9fc5-48aa-ada6-354775e57a67'; // senderos

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateEmptyTickets() {
  console.log('=== DIAGNOSTIC: CHECKING SENDEROS ORDERS FOR EMPTY TICKETS ===');
  console.log();

  try {
    // 1. Check recent orders that were marked as printed but might have empty data
    console.log('1. CHECKING RECENT ORDERS WITH KITCHEN_PRINTED=TRUE:');
    const { data: printedOrders, error: printedError } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name)), tables(table_number)')
      .eq('restaurant_id', RESTAURANT_ID)
      .eq('kitchen_printed', true)
      .order('created_at', { ascending: false })
      .limit(15);

    if (printedError) {
      console.error('Error fetching printed orders:', printedError);
      return;
    }

    let emptyTicketCount = 0;
    let totalOrders = printedOrders.length;

    for (const order of printedOrders) {
      const orderItems = order.order_items || [];
      const hasEmptyItems = orderItems.length === 0;
      const hasNullMenuItems = orderItems.some(item => !item.menu_items);

      console.log(`Order #${order.id} - ${order.customer_name}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Created: ${order.created_at}`);
      console.log(`  Order items count: ${orderItems.length}`);

      if (hasEmptyItems) {
        console.log('  ❌ CRITICAL: NO ORDER ITEMS FOUND - THIS WOULD PRINT EMPTY!');
        emptyTicketCount++;

        // Check if order_items exist but query isn't returning them
        const { data: directItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        console.log(`  Direct order_items query returned: ${directItems?.length || 0} items`);
        if (directItems && directItems.length > 0) {
          console.log('  ❌ CRITICAL: ORDER_ITEMS EXIST BUT JOIN QUERY FAILED!');

          // Show the raw order_items
          console.log('  Raw order_items:');
          directItems.forEach(item => {
            console.log(`    Item ID: ${item.id}, Menu Item ID: ${item.menu_item_id}, Quantity: ${item.quantity}`);
          });
        }
      } else {
        // Check for items with null menu_items
        for (const item of orderItems) {
          const menuItem = item.menu_items;
          const itemName = menuItem?.name || 'NULL';
          console.log(`    - ${item.quantity}x ${itemName}`);
          if (!menuItem) {
            console.log('      ❌ CRITICAL: MENU_ITEMS IS NULL!');

            // Check if the menu_item still exists
            const { data: menuItemCheck } = await supabase
              .from('menu_items')
              .select('id, name, is_available')
              .eq('id', item.menu_item_id)
              .single();

            if (menuItemCheck) {
              console.log(`      Menu item exists: ${menuItemCheck.name} (available: ${menuItemCheck.is_available})`);
            } else {
              console.log('      ❌ MENU ITEM DELETED FROM DATABASE!');
            }
          }
        }
      }
      console.log();
    }

    console.log('2. CHECKING UNPRINTABLE ORDERS (kitchen_printed=false):');
    const { data: unprintableOrders } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name))')
      .eq('restaurant_id', RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .order('created_at', { ascending: false })
      .limit(10);

    for (const order of unprintableOrders) {
      const orderItems = order.order_items || [];
      console.log(`Order #${order.id} - ${order.customer_name}`);
      console.log(`  Order items count: ${orderItems.length}`);

      if (orderItems.length === 0) {
        console.log('  ❌ CRITICAL: NO ORDER ITEMS - WOULD PRINT EMPTY!');

        // Check if order_items exist but query isn't returning them
        const { data: directItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        console.log(`  Direct order_items query returned: ${directItems?.length || 0} items`);
        if (directItems && directItems.length > 0) {
          console.log('  ❌ CRITICAL: ORDER_ITEMS EXIST BUT JOIN QUERY FAILED!');
        }
      }
      console.log();
    }

    // 3. Check for foreign key constraint issues
    console.log('3. CHECKING FOR ORPHANED ORDER_ITEMS:');
    const { data: allOrderItems } = await supabase
      .from('order_items')
      .select('id, order_id, menu_item_id')
      .eq('menu_item_id', null);

    if (allOrderItems && allOrderItems.length > 0) {
      console.log(`❌ Found ${allOrderItems.length} order_items with null menu_item_id`);
    } else {
      console.log('✅ No orphaned order_items with null menu_item_id');
    }

    // 4. Test the exact query the printer service uses
    console.log('4. TESTING EXACT PRINTER SERVICE QUERY:');
    const { data: printerQuery } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name)), tables(table_number)')
      .eq('restaurant_id', RESTAURANT_ID)
      .eq('kitchen_printed', false);

    console.log(`Printer service would find ${printerQuery?.length || 0} orders to print`);

    if (printerQuery) {
      printerQuery.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        if (itemCount === 0) {
          console.log(`❌ Order #${order.id} would print EMPTY!`);
        }
      });
    }

    // 5. Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total printed orders checked: ${totalOrders}`);
    console.log(`Orders with empty tickets: ${emptyTicketCount}`);
    console.log(`Empty ticket rate: ${((emptyTicketCount / totalOrders) * 100).toFixed(1)}%`);

    if (emptyTicketCount > 0) {
      console.log('\n❌ CRITICAL ISSUE DETECTED:');
      console.log('Some orders are being marked as printed despite having no items to print!');
      console.log('This explains the empty tickets issue.');
    }

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigateEmptyTickets();
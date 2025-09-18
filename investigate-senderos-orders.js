const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

// CORRECT Senderos restaurant ID
const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateSenderosOrders() {
  console.log('=== INVESTIGATING SENDEROS ORDERS WITH CORRECT ID ===');
  console.log(`Restaurant ID: ${SENDEROS_RESTAURANT_ID}`);
  console.log();

  try {
    // 1. Check recent Senderos orders
    console.log('1. CHECKING RECENT SENDEROS ORDERS:');
    const { data: senderosOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name)), tables(table_number)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .order('created_at', { ascending: false })
      .limit(15);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return;
    }

    if (!senderosOrders || senderosOrders.length === 0) {
      console.log('❌ No orders found for Senderos');
      return;
    }

    console.log(`Found ${senderosOrders.length} orders for Senderos`);
    console.log();

    let emptyTicketsCount = 0;
    let nullMenuItemsCount = 0;
    let totalPrintedOrders = 0;

    for (const order of senderosOrders) {
      const orderItems = order.order_items || [];
      const isPrinted = order.kitchen_printed;

      console.log(`Order #${order.id} - ${order.customer_name}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Kitchen Printed: ${order.kitchen_printed}`);
      console.log(`  Created: ${order.created_at}`);
      console.log(`  Order items count: ${orderItems.length}`);

      if (isPrinted) {
        totalPrintedOrders++;
      }

      // Check for empty order items
      if (orderItems.length === 0) {
        console.log('  ❌ CRITICAL: NO ORDER ITEMS - WOULD RESULT IN EMPTY TICKET!');
        emptyTicketsCount++;

        // Check if order_items exist separately
        const { data: directItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (directItems && directItems.length > 0) {
          console.log(`  🔍 Direct query found ${directItems.length} order_items - JOIN FAILURE!`);
        } else {
          console.log('  🔍 Direct query also shows 0 order_items - DATA MISSING!');
        }
      } else {
        // Check each item for missing menu data
        let hasNullMenuItems = false;
        for (const item of orderItems) {
          const menuItem = item.menu_items;
          const itemName = menuItem?.name || 'NULL MENU ITEM';

          console.log(`    - ${item.quantity}x ${itemName} (Price: ${item.price_at_order || 'N/A'})`);

          if (!menuItem) {
            hasNullMenuItems = true;
            console.log('      ❌ CRITICAL: MENU ITEM IS NULL!');

            // Check if menu item exists
            const { data: menuCheck } = await supabase
              .from('menu_items')
              .select('id, name, is_available')
              .eq('id', item.menu_item_id)
              .single();

            if (menuCheck) {
              console.log(`      🔍 Menu item exists: ${menuCheck.name} (available: ${menuCheck.is_available})`);
            } else {
              console.log('      🔍 Menu item deleted from database!');
            }
          }

          if (item.notes) {
            console.log(`      Notes: ${item.notes}`);
          }
        }

        if (hasNullMenuItems && isPrinted) {
          nullMenuItemsCount++;
        }
      }

      if (order.notes) {
        console.log(`  Order notes: ${order.notes}`);
      }

      console.log();
    }

    // 2. Check printer configuration
    console.log('2. CHECKING PRINTER CONFIGURATION FOR SENDEROS:');
    const { data: printers } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID);

    if (printers && printers.length > 0) {
      console.log(`Found ${printers.length} printers:`);
      printers.forEach(printer => {
        console.log(`  ${printer.name} (${printer.type}) - Active: ${printer.is_active}`);
      });
    } else {
      console.log('❌ No printers configured for Senderos');
      console.log('This means orders should go directly to "in_progress" status');
    }

    // 3. Identify potential empty ticket scenarios
    console.log('\n3. EMPTY TICKET ANALYSIS:');
    console.log(`Total orders analyzed: ${senderosOrders.length}`);
    console.log(`Printed orders: ${totalPrintedOrders}`);
    console.log(`Orders with empty items: ${emptyTicketsCount}`);
    console.log(`Orders with null menu items: ${nullMenuItemsCount}`);

    if (emptyTicketsCount > 0) {
      console.log('\n❌ CRITICAL FINDINGS:');
      console.log(`${emptyTicketsCount} orders would produce EMPTY TICKETS!`);
      console.log('This explains the empty ticket complaints.');
    }

    if (nullMenuItemsCount > 0) {
      console.log(`${nullMenuItemsCount} printed orders had null menu items.`);
      console.log('These would show "Item desconocido" on tickets.');
    }

    // 4. Check what the actual printer service would see
    console.log('\n4. SIMULATING PRINTER SERVICE BEHAVIOR:');
    console.log('Using the WRONG restaurant ID that the printer service currently uses...');

    const WRONG_RESTAURANT_ID = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
    const { data: wrongOrders } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name)), tables(table_number)')
      .eq('restaurant_id', WRONG_RESTAURANT_ID)
      .eq('kitchen_printed', false);

    console.log(`Printer service finds ${wrongOrders?.length || 0} orders with wrong restaurant ID`);
    console.log('This explains why the printer service is not working properly!');

    // 5. Show what correct printer service query should find
    const { data: correctOrders } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name)), tables(table_number)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false);

    console.log(`\nWith CORRECT restaurant ID, printer would find ${correctOrders?.length || 0} unprintted orders`);

    if (correctOrders && correctOrders.length > 0) {
      console.log('These orders are waiting to be printed:');
      correctOrders.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer_name} (${order.order_items?.length || 0} items)`);
      });
    }

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigateSenderosOrders();
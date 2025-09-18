const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateNullMenuItems() {
  console.log('=== INVESTIGATING NULL MENU_ITEM_ID ISSUE ===');
  console.log('This could be the REAL cause of empty-looking tickets!');
  console.log();

  try {
    // 1. Get all order_items with null menu_item_id for Senderos
    console.log('1. FINDING ORDER_ITEMS WITH NULL MENU_ITEM_ID:');

    const { data: nullMenuItems } = await supabase
      .from('order_items')
      .select(`
        id, order_id, quantity, price_at_order, notes,
        orders (
          id, customer_name, status, kitchen_printed, created_at, restaurant_id
        )
      `)
      .is('menu_item_id', null);

    // Filter for Senderos orders
    const senderosNullItems = nullMenuItems?.filter(item =>
      item.orders?.restaurant_id === SENDEROS_RESTAURANT_ID
    ) || [];

    console.log(`Found ${senderosNullItems.length} order_items with null menu_item_id in Senderos:`);

    senderosNullItems.forEach(item => {
      const order = item.orders;
      console.log(`  Order #${order.id} - ${order.customer_name}`);
      console.log(`    Item ID: ${item.id}`);
      console.log(`    Quantity: ${item.quantity}`);
      console.log(`    Price: ${item.price_at_order}`);
      console.log(`    Notes: ${item.notes || 'None'}`);
      console.log(`    Order Status: ${order.status}`);
      console.log(`    Kitchen Printed: ${order.kitchen_printed}`);
      console.log(`    Created: ${order.created_at}`);

      if (order.kitchen_printed) {
        console.log(`    ❌ THIS ORDER WAS PRINTED! Could have caused empty-looking ticket`);
      }
      console.log();
    });

    // 2. Test what happens when printer service queries these orders
    console.log('2. SIMULATING PRINTER SERVICE JOIN BEHAVIOR:');

    // Test orders that have null menu_item_id items
    const affectedOrderIds = [...new Set(senderosNullItems.map(item => item.orders.id))];

    for (const orderId of affectedOrderIds) {
      console.log(`\nTesting Order #${orderId}:`);

      // This is the EXACT query the printer service uses
      const { data: printerQuery } = await supabase
        .from('orders')
        .select('*, notes, order_items(*, notes, menu_items(*))')
        .eq('id', orderId)
        .single();

      if (printerQuery) {
        const orderItems = printerQuery.order_items || [];
        console.log(`  Printer service sees ${orderItems.length} items for this order`);

        let itemsWithNullMenu = 0;
        let itemsWithValidMenu = 0;

        orderItems.forEach((item, index) => {
          if (item.menu_items === null) {
            itemsWithNullMenu++;
            console.log(`    Item ${index + 1}: ❌ NULL menu_items (quantity: ${item.quantity})`);
          } else {
            itemsWithValidMenu++;
            console.log(`    Item ${index + 1}: ✅ ${item.menu_items.name} (quantity: ${item.quantity})`);
          }
        });

        console.log(`  Summary: ${itemsWithValidMenu} valid items, ${itemsWithNullMenu} null items`);

        if (itemsWithNullMenu > 0) {
          console.log(`  ❌ ISSUE: Items with null menu_items could cause printing problems!`);
        }
      }
    }

    // 3. Check if these are custom products
    console.log('\n3. CHECKING IF NULL MENU_ITEM_ID ARE CUSTOM PRODUCTS:');

    senderosNullItems.forEach(item => {
      const notes = item.notes;
      console.log(`Order #${item.orders.id} - Item ${item.id}:`);
      console.log(`  Notes: ${notes || 'None'}`);

      if (notes && notes.includes('custom_product')) {
        console.log(`  ✅ This is a custom product - null menu_item_id is expected`);
      } else if (notes && notes.startsWith('{')) {
        try {
          const parsedNotes = JSON.parse(notes);
          if (parsedNotes.type === 'custom_product') {
            console.log(`  ✅ This is a custom product - null menu_item_id is expected`);
            console.log(`  Product name: ${parsedNotes.name || 'Unknown'}`);
          } else {
            console.log(`  ❓ JSON notes but not custom product: ${notes}`);
          }
        } catch {
          console.log(`  ❓ Invalid JSON in notes: ${notes}`);
        }
      } else {
        console.log(`  ❌ PROBLEM: null menu_item_id but not a custom product!`);
      }
      console.log();
    });

    // 4. Test current printer service behavior with these orders
    console.log('4. TESTING CURRENT PRINTER SERVICE BEHAVIOR:');

    // Check if any of these problematic orders are currently in print queue
    const problemOrderIds = senderosNullItems.map(item => item.orders.id);

    const { data: currentQueue } = await supabase
      .from('orders')
      .select('*, order_items(*, notes, menu_items(*))')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .in('id', problemOrderIds);

    if (currentQueue && currentQueue.length > 0) {
      console.log(`❌ ${currentQueue.length} orders with null menu_item_id are currently in print queue!`);
      currentQueue.forEach(order => {
        const validItems = order.order_items?.filter(item => item.menu_items !== null).length || 0;
        const nullItems = order.order_items?.filter(item => item.menu_items === null).length || 0;

        console.log(`  Order #${order.id} - ${order.customer_name}`);
        console.log(`    Valid items: ${validItems}, Null items: ${nullItems}`);

        if (validItems === 0) {
          console.log(`    ❌ CRITICAL: This order would print completely empty!`);
        } else if (nullItems > 0) {
          console.log(`    ⚠️  WARNING: This order would print with some missing items`);
        }
      });
    } else {
      console.log(`✅ No orders with null menu_item_id currently in print queue`);
    }

    // 5. Summary and solution
    console.log('\n5. NULL MENU_ITEM_ID ANALYSIS SUMMARY:');
    console.log('=====================================');

    const printedOrdersWithNullItems = senderosNullItems.filter(item => item.orders.kitchen_printed);

    console.log(`Total null menu_item_id items in Senderos: ${senderosNullItems.length}`);
    console.log(`Printed orders affected: ${printedOrdersWithNullItems.length}`);

    if (printedOrdersWithNullItems.length > 0) {
      console.log(`\n❌ POTENTIAL EMPTY TICKET CAUSE IDENTIFIED:`);
      console.log(`   ${printedOrdersWithNullItems.length} printed orders had items with null menu_item_id`);
      console.log(`   These could have appeared as empty or partial tickets`);

      console.log(`\n🛠️  SOLUTION FOR PRINTER SERVICE:`);
      console.log(`   Modify printer service to handle custom products (null menu_item_id)`);
      console.log(`   In print_kitchen_ticket function, add logic to extract product name from notes`);
      console.log(`   This is already partially implemented in lines 177-189!`);
    } else {
      console.log(`✅ No printed orders were affected by null menu_item_id issue`);
    }

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigateNullMenuItems();
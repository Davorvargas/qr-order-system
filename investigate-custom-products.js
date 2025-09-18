const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateCustomProducts() {
  console.log('=== INVESTIGATING CUSTOM PRODUCTS (PRODUCTOS ESPECIALES) ===');
  console.log('Focus: How staff-created custom items are handled in printing');
  console.log();

  try {
    // 1. Find all custom products (null menu_item_id with custom product notes)
    console.log('1. IDENTIFYING CUSTOM PRODUCTS vs CORRUPTED DATA:');

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

    console.log(`Analyzing ${senderosNullItems.length} items with null menu_item_id:`);

    let actualCustomProducts = [];
    let corruptedItems = [];
    let unknownItems = [];

    senderosNullItems.forEach(item => {
      const notes = item.notes;
      const order = item.orders;

      if (notes && notes.includes('custom_product')) {
        actualCustomProducts.push({
          ...item,
          parsedNotes: JSON.parse(notes)
        });
      } else if (!notes || notes === 'None' || notes === null) {
        corruptedItems.push(item);
      } else {
        unknownItems.push(item);
      }
    });

    console.log(`\nCATEGORIZATION:`);
    console.log(`  Actual custom products: ${actualCustomProducts.length}`);
    console.log(`  Corrupted items (no notes): ${corruptedItems.length}`);
    console.log(`  Unknown items (has notes but not custom): ${unknownItems.length}`);

    // 2. Analyze actual custom products
    console.log('\n2. ANALYZING ACTUAL CUSTOM PRODUCTS:');

    if (actualCustomProducts.length > 0) {
      actualCustomProducts.forEach(item => {
        const order = item.orders;
        const notes = item.parsedNotes;

        console.log(`Custom Product in Order #${order.id} - ${order.customer_name}:`);
        console.log(`  Product name: "${notes.name}"`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  Price: ${item.price_at_order}`);
        console.log(`  Original notes: "${notes.original_notes || 'None'}"`);
        console.log(`  Order printed: ${order.kitchen_printed}`);
        console.log(`  Order status: ${order.status}`);

        if (order.kitchen_printed) {
          console.log(`  ✅ This custom product was successfully printed`);
        }
        console.log();
      });
    } else {
      console.log('  No actual custom products found with proper structure');
    }

    // 3. Analyze corrupted items that might be failed custom products
    console.log('3. ANALYZING CORRUPTED ITEMS (POTENTIAL FAILED CUSTOM PRODUCTS):');

    if (corruptedItems.length > 0) {
      console.log(`Found ${corruptedItems.length} items with null menu_item_id and no notes:`);

      // Group by order to see patterns
      const orderGroups = {};
      corruptedItems.forEach(item => {
        const orderId = item.orders.id;
        if (!orderGroups[orderId]) {
          orderGroups[orderId] = [];
        }
        orderGroups[orderId].push(item);
      });

      for (const [orderId, items] of Object.entries(orderGroups)) {
        const order = items[0].orders;
        console.log(`\nOrder #${orderId} - ${order.customer_name}:`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Kitchen printed: ${order.kitchen_printed}`);
        console.log(`  Created: ${order.created_at}`);
        console.log(`  Corrupted items: ${items.length}`);

        items.forEach(item => {
          console.log(`    - Item ${item.id}: Qty ${item.quantity}, Price ${item.price_at_order}`);
        });

        if (order.kitchen_printed) {
          console.log(`  ❌ CRITICAL: This order was printed with corrupted custom products!`);
          console.log(`      This likely caused an empty or incomplete ticket!`);
        }
      }
    }

    // 4. Test how printer service handles these different cases
    console.log('\n4. TESTING PRINTER SERVICE HANDLING:');

    // Test a few orders with different types of null menu_item_id
    const testOrders = [
      ...actualCustomProducts.slice(0, 2).map(item => item.orders.id),
      ...corruptedItems.slice(0, 3).map(item => item.orders.id)
    ];

    for (const orderId of testOrders) {
      console.log(`\nTesting Order #${orderId}:`);

      const { data: printerQuery } = await supabase
        .from('orders')
        .select('*, notes, order_items(*, notes, menu_items(*))')
        .eq('id', orderId)
        .single();

      if (printerQuery) {
        const orderItems = printerQuery.order_items || [];

        console.log(`  Printer service query returns ${orderItems.length} items:`);

        orderItems.forEach((item, index) => {
          console.log(`    Item ${index + 1}:`);

          if (item.menu_items) {
            console.log(`      ✅ Regular item: ${item.menu_items.name}`);
          } else {
            // This is the critical path - how does printer handle null menu_items?
            console.log(`      ❓ NULL menu_items - Quantity: ${item.quantity}, Price: ${item.price_at_order}`);
            console.log(`      ❓ Notes: ${item.notes || 'None'}`);

            // Simulate printer service logic (lines 177-189 in printer_service.py)
            const item_notes = item.notes || '';
            let item_name = '';

            if (item_notes && item_notes.startsWith('{')) {
              try {
                const parsed_notes = JSON.parse(item_notes);
                if (parsed_notes.type === 'custom_product') {
                  item_name = parsed_notes.name || 'Producto Especial';
                  console.log(`      ✅ Would print as: "${item_name}"`);
                } else {
                  item_name = 'Producto Especial';
                  console.log(`      ⚠️  Would print as: "${item_name}" (generic)`);
                }
              } catch {
                item_name = 'Producto Especial';
                console.log(`      ⚠️  Would print as: "${item_name}" (JSON parse failed)`);
              }
            } else {
              item_name = 'Producto Especial';
              console.log(`      ❌ Would print as: "${item_name}" (no notes - PROBLEM!)`);
            }
          }
        });
      }
    }

    // 5. Check current print queue for custom product issues
    console.log('\n5. CHECKING CURRENT PRINT QUEUE FOR CUSTOM PRODUCT ISSUES:');

    const { data: currentQueue } = await supabase
      .from('orders')
      .select('*, order_items(*, notes, menu_items(*))')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .order('id');

    let ordersWithCustomProductIssues = [];

    if (currentQueue && currentQueue.length > 0) {
      currentQueue.forEach(order => {
        const customProductItems = order.order_items?.filter(item =>
          !item.menu_items && item.notes
        ) || [];

        const corruptedCustomItems = order.order_items?.filter(item =>
          !item.menu_items && (!item.notes || item.notes === 'None')
        ) || [];

        if (customProductItems.length > 0 || corruptedCustomItems.length > 0) {
          ordersWithCustomProductIssues.push({
            order,
            customProductItems,
            corruptedCustomItems
          });
        }
      });

      if (ordersWithCustomProductIssues.length > 0) {
        console.log(`❌ Found ${ordersWithCustomProductIssues.length} orders in print queue with custom product issues:`);

        ordersWithCustomProductIssues.forEach(({ order, customProductItems, corruptedCustomItems }) => {
          console.log(`\n  Order #${order.id} - ${order.customer_name}:`);
          console.log(`    Status: ${order.status}`);
          console.log(`    Valid custom products: ${customProductItems.length}`);
          console.log(`    Corrupted custom items: ${corruptedCustomItems.length}`);

          if (corruptedCustomItems.length > 0) {
            console.log(`    ❌ CRITICAL: ${corruptedCustomItems.length} corrupted custom items would print as "Producto Especial"`);
          }
        });
      } else {
        console.log('✅ No orders with custom product issues in current print queue');
      }
    } else {
      console.log('✅ Print queue is empty');
    }

    // 6. Summary and recommendations
    console.log('\n6. CUSTOM PRODUCTS ANALYSIS SUMMARY:');
    console.log('=====================================');

    console.log(`Total null menu_item_id items: ${senderosNullItems.length}`);
    console.log(`Actual custom products: ${actualCustomProducts.length}`);
    console.log(`Corrupted items (likely failed custom products): ${corruptedItems.length}`);
    console.log(`Unknown items: ${unknownItems.length}`);

    const printedCorruptedItems = corruptedItems.filter(item => item.orders.kitchen_printed);
    console.log(`Printed orders with corrupted custom items: ${printedCorruptedItems.length}`);

    if (printedCorruptedItems.length > 0) {
      console.log('\n❌ ROOT CAUSE IDENTIFIED:');
      console.log('   Custom products are being created without proper notes structure');
      console.log('   These print as generic "Producto Especial" or cause empty-looking tickets');
      console.log('\n🛠️  SOLUTIONS NEEDED:');
      console.log('   1. Fix custom product creation to always include proper notes JSON');
      console.log('   2. Improve printer service to handle corrupted custom products gracefully');
      console.log('   3. Add validation in staff interface when creating custom products');
    }

  } catch (error) {
    console.error('Error in investigation:', error);
  }
}

investigateCustomProducts();
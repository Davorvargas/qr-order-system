const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const SENDEROS_RESTAURANT_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixCorruptedCustomProducts() {
  console.log('=== FIXING CORRUPTED CUSTOM PRODUCTS ===');
  console.log('This will fix orders that would print empty due to corrupted custom products');
  console.log();

  try {
    // 1. Find all corrupted custom products (null menu_item_id but no proper notes)
    console.log('1. FINDING CORRUPTED CUSTOM PRODUCTS...');

    const { data: corruptedItems } = await supabase
      .from('order_items')
      .select(`
        id, order_id, quantity, price_at_order, notes,
        orders!inner (
          id, customer_name, status, kitchen_printed, restaurant_id
        )
      `)
      .is('menu_item_id', null)
      .eq('orders.restaurant_id', SENDEROS_RESTAURANT_ID);

    // Filter for items that are corrupted (null menu_item_id but no custom product structure)
    const actuallyCorrupted = corruptedItems?.filter(item => {
      const notes = item.notes;
      if (!notes || notes === 'None' || notes === null) {
        return true; // No notes = corrupted
      }

      try {
        const parsed = JSON.parse(notes);
        return parsed.type !== 'custom_product'; // Has notes but not a custom product = corrupted
      } catch {
        return true; // Invalid JSON = corrupted
      }
    }) || [];

    console.log(`Found ${actuallyCorrupted.length} corrupted custom products`);

    if (actuallyCorrupted.length === 0) {
      console.log('✅ No corrupted custom products found!');
    } else {
      // Show what we found
      console.log('\nCorrupted items details:');
      actuallyCorrupted.forEach(item => {
        const order = item.orders;
        console.log(`  Item ${item.id} in Order #${order.id} - ${order.customer_name}`);
        console.log(`    Quantity: ${item.quantity}, Price: ${item.price_at_order}`);
        console.log(`    Current notes: ${item.notes || 'NULL'}`);
        console.log(`    Order status: ${order.status}, Printed: ${order.kitchen_printed}`);
        console.log();
      });

      // 2. Fix each corrupted item
      console.log('2. FIXING CORRUPTED ITEMS...');

      let fixedCount = 0;
      let errorCount = 0;

      for (const item of actuallyCorrupted) {
        try {
          const order = item.orders;

          // Create proper custom product notes structure
          const fixedNotes = JSON.stringify({
            type: "custom_product",
            name: `Producto Especial (Bs. ${item.price_at_order || 0})`,
            original_notes: `Producto recuperado - Orden #${order.id}`
          });

          console.log(`Fixing item ${item.id} in order #${order.id} - ${order.customer_name}`);

          const { error } = await supabase
            .from('order_items')
            .update({ notes: fixedNotes })
            .eq('id', item.id);

          if (error) {
            console.error(`❌ Error fixing item ${item.id}:`, error);
            errorCount++;
          } else {
            console.log(`✅ Fixed item ${item.id}`);
            fixedCount++;
          }

        } catch (error) {
          console.error(`❌ Error processing item ${item.id}:`, error);
          errorCount++;
        }
      }

      console.log(`\nFixing Summary:`);
      console.log(`Fixed items: ${fixedCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Total processed: ${actuallyCorrupted.length}`);
    }

    // 3. Clean up orders that should not be in print queue
    console.log('\n3. CLEANING UP STUCK ORDERS...');

    // Mark completed/cancelled/merged orders as printed so they don't stay in queue forever
    const { data: stuckOrders, error: stuckError } = await supabase
      .from('orders')
      .update({ kitchen_printed: true })
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .in('status', ['completed', 'cancelled', 'merged'])
      .select('id, customer_name, status');

    if (stuckError) {
      console.error('❌ Error cleaning up stuck orders:', stuckError);
    } else {
      console.log(`✅ Cleaned up ${stuckOrders?.length || 0} stuck orders`);
      if (stuckOrders && stuckOrders.length > 0) {
        stuckOrders.forEach(order => {
          console.log(`  - Order #${order.id} - ${order.customer_name} (${order.status})`);
        });
      }
    }

    // 4. Verify current print queue
    console.log('\n4. VERIFYING CURRENT PRINT QUEUE...');

    const { data: currentQueue } = await supabase
      .from('orders')
      .select('id, customer_name, status, order_items(*)')
      .eq('restaurant_id', SENDEROS_RESTAURANT_ID)
      .eq('kitchen_printed', false)
      .in('status', ['pending', 'in_progress']);

    console.log(`Current print queue: ${currentQueue?.length || 0} orders`);

    if (currentQueue && currentQueue.length > 0) {
      let hasEmptyRisk = false;

      currentQueue.forEach(order => {
        const itemCount = order.order_items?.length || 0;
        const corruptedItems = order.order_items?.filter(item =>
          !item.menu_item_id && (!item.notes || item.notes === 'None' ||
          (item.notes && !item.notes.includes('custom_product')))
        ).length || 0;

        console.log(`  Order #${order.id} - ${order.customer_name}: ${itemCount} items, ${corruptedItems} corrupted`);

        if (itemCount === 0) {
          console.log(`    ❌ CRITICAL: No items - would print empty!`);
          hasEmptyRisk = true;
        } else if (corruptedItems > 0) {
          console.log(`    ⚠️  WARNING: ${corruptedItems} items might print as generic "Producto Especial"`);
          hasEmptyRisk = true;
        } else {
          console.log(`    ✅ Safe to print`);
        }
      });

      if (!hasEmptyRisk) {
        console.log('\n✅ ALL ORDERS IN QUEUE ARE SAFE TO PRINT!');
      } else {
        console.log('\n❌ Some orders still have risks - may need manual review');
      }
    } else {
      console.log('✅ Print queue is empty - no immediate risk');
    }

    // 5. Summary for staff communication
    console.log('\n=== SUMMARY FOR STAFF COMMUNICATION ===');
    console.log(`Fixed ${actuallyCorrupted.length} corrupted custom products`);
    console.log(`Cleaned up ${stuckOrders?.length || 0} stuck orders`);
    console.log(`Current print queue: ${currentQueue?.length || 0} orders`);
    console.log();
    console.log('✅ NEXT STEPS:');
    console.log('1. Empty ticket issue should be resolved');
    console.log('2. Ask staff to report specific orders that print incorrectly');
    console.log('3. Monitor for any new custom product creation issues');
    console.log();
    console.log('🎉 CLEANUP COMPLETE!');

  } catch (error) {
    console.error('❌ Error in cleanup process:', error);
  }
}

fixCorruptedCustomProducts();
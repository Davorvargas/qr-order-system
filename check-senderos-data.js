const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSenderosData() {
  console.log('=== CHECKING SENDEROS RESTAURANT DATA ===');
  console.log();

  try {
    // 1. First, find the actual Senderos restaurant
    console.log('1. SEARCHING FOR SENDEROS RESTAURANT:');
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', '%senderos%');

    if (restaurants && restaurants.length > 0) {
      restaurants.forEach(restaurant => {
        console.log(`Found restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
      });
    } else {
      console.log('❌ No restaurant with "senderos" in name found');

      // Show all restaurants
      const { data: allRestaurants } = await supabase
        .from('restaurants')
        .select('id, name')
        .limit(10);

      console.log('\nAll restaurants in database:');
      allRestaurants?.forEach(r => {
        console.log(`  ${r.name} (${r.id})`);
      });
    }

    // 2. Check the hardcoded restaurant ID from the printer service
    const HARDCODED_ID = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
    console.log(`\n2. CHECKING HARDCODED RESTAURANT ID: ${HARDCODED_ID}`);

    const { data: hardcodedRestaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', HARDCODED_ID)
      .single();

    if (hardcodedRestaurant) {
      console.log(`✅ Restaurant found: ${hardcodedRestaurant.name}`);
    } else {
      console.log('❌ Hardcoded restaurant ID not found');
    }

    // 3. Check for any orders at all, regardless of restaurant
    console.log('\n3. CHECKING ALL RECENT ORDERS:');
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, restaurant_id, customer_name, created_at, kitchen_printed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (allOrders && allOrders.length > 0) {
      console.log(`Found ${allOrders.length} recent orders:`);
      allOrders.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer_name} (Restaurant: ${order.restaurant_id}) - Printed: ${order.kitchen_printed}`);
      });

      // Group by restaurant to see which restaurants have orders
      const ordersByRestaurant = {};
      allOrders.forEach(order => {
        if (!ordersByRestaurant[order.restaurant_id]) {
          ordersByRestaurant[order.restaurant_id] = 0;
        }
        ordersByRestaurant[order.restaurant_id]++;
      });

      console.log('\nOrders by restaurant:');
      for (const [restaurantId, count] of Object.entries(ordersByRestaurant)) {
        console.log(`  ${restaurantId}: ${count} orders`);
      }
    } else {
      console.log('❌ No orders found in database');
    }

    // 4. Check specifically for orders with the Senderos restaurant ID
    console.log('\n4. CHECKING ORDERS FOR SENDEROS RESTAURANT:');
    const { data: senderosOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', HARDCODED_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (senderosOrders && senderosOrders.length > 0) {
      console.log(`Found ${senderosOrders.length} orders for Senderos:`);
      senderosOrders.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer_name} - Status: ${order.status} - Kitchen Printed: ${order.kitchen_printed}`);
      });
    } else {
      console.log('❌ No orders found for Senderos restaurant');
    }

    // 5. Check printer configuration for Senderos
    console.log('\n5. CHECKING PRINTER CONFIGURATION:');
    const { data: printers } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', HARDCODED_ID);

    if (printers && printers.length > 0) {
      console.log(`Found ${printers.length} printers for Senderos:`);
      printers.forEach(printer => {
        console.log(`  ${printer.name} (${printer.type}) - Active: ${printer.is_active}`);
      });
    } else {
      console.log('❌ No printers configured for Senderos');
    }

    // 6. Check for archived orders
    console.log('\n6. CHECKING ARCHIVED ORDERS:');
    const { data: archivedOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', HARDCODED_ID)
      .eq('archived', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (archivedOrders && archivedOrders.length > 0) {
      console.log(`Found ${archivedOrders.length} archived orders for Senderos:`);
      archivedOrders.forEach(order => {
        console.log(`  Order #${order.id} - ${order.customer_name} - Status: ${order.status}`);
      });
    } else {
      console.log('No archived orders found for Senderos');
    }

  } catch (error) {
    console.error('Error in data check:', error);
  }
}

checkSenderosData();
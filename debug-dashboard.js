const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugDashboard() {
  console.log('🔍 Debugging Dashboard - Orders Not Showing');
  console.log('=====================================');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log('📅 Today filter:', today.toISOString());
  
  // Test the exact same query as the dashboard
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, notes, table:tables(table_number, restaurant_id), order_items(*, notes, menu_items(name, price))')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log(`✅ Found ${orders?.length || 0} orders for today`);
  
  if (orders && orders.length > 0) {
    console.log('\n📋 Orders Summary:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.id}:`);
      console.log(`   - Customer: ${order.customer_name}`);
      console.log(`   - Status: ${order.status}`);
      console.log(`   - Table: ${order.table?.table_number || 'N/A'}`);
      console.log(`   - Total: $${order.total_price}`);
      console.log(`   - Items: ${order.order_items?.length || 0}`);
      console.log(`   - Created: ${order.created_at}`);
      console.log('');
    });
    
    console.log('✅ Data looks good! The issue might be in the React component rendering.');
    console.log('💡 Suggestions:');
    console.log('1. Check browser console for React errors');
    console.log('2. Verify OrderList component is receiving the data');
    console.log('3. Check if there are any filtering issues in the component');
    
  } else {
    console.log('❌ No orders found for today');
    
    // Check for orders on other dates
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, created_at, customer_name, status')
      .order('created_at', { ascending: false })
      .limit(10);
      
    console.log('\n📋 Recent orders (any date):');
    allOrders?.forEach(order => {
      console.log(`- Order #${order.id}: ${order.customer_name} (${order.created_at})`);
    });
  }
}

debugDashboard();
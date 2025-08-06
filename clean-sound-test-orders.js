const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanSoundTestOrders() {
  console.log('🧹 LIMPIANDO ÓRDENES DE PRUEBA DE SONIDO');
  console.log('='.repeat(45));
  
  try {
    // Contar órdenes antes de limpiar
    const { data: ordersBefore, error: countError } = await supabase
      .from('orders')
      .select('id, customer_name, restaurant_id')
      .or('customer_name.ilike.%PRUEBA SONIDO%')
      .eq('archived', false);
      
    if (countError) {
      console.error('❌ Error contando órdenes:', countError);
      return;
    }
    
    console.log(`📊 Órdenes de prueba encontradas: ${ordersBefore?.length || 0}`);
    if (ordersBefore && ordersBefore.length > 0) {
      ordersBefore.forEach(order => {
        console.log(`   #${order.id}: ${order.customer_name} - Restaurant: ${order.restaurant_id}`);
      });
    }
    
    // Eliminar order_items primero
    console.log('\n🗑️  Eliminando order_items...');
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', ordersBefore?.map(o => o.id) || []);
      
    if (itemsError) {
      console.error('❌ Error eliminando order_items:', itemsError);
    } else {
      console.log('✅ Order_items eliminados');
    }
    
    // Eliminar órdenes
    console.log('🗑️  Eliminando órdenes...');
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .in('id', ordersBefore?.map(o => o.id) || []);
      
    if (ordersError) {
      console.error('❌ Error eliminando órdenes:', ordersError);
    } else {
      console.log('✅ Órdenes eliminadas');
    }
    
    console.log('\n🎯 LIMPIEZA COMPLETADA');
    console.log('='.repeat(25));
    console.log(`✅ ${ordersBefore?.length || 0} órdenes de prueba eliminadas`);
    console.log('✅ Base de datos limpia');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar limpieza
cleanSoundTestOrders(); 
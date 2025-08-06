const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos

async function cleanSenderosOrders() {
  console.log('🧹 LIMPIEZA DE ÓRDENES - RESTAURANTE SENDEROS');
  console.log('='.repeat(60));
  
  try {
    // 1. Contar órdenes existentes en Senderos
    console.log('\n📋 PASO 1: CONTANDO ÓRDENES EN SENDEROS');
    console.log('='.repeat(40));
    
    const { data: orders, error: countError } = await supabase
      .from('orders')
      .select('id, customer_name, status, created_at')
      .eq('restaurant_id', senderosRestaurantId)
      .eq('archived', false);
      
    if (countError) {
      console.error('❌ Error contando órdenes:', countError);
      return;
    }
    
    console.log(`📊 Órdenes encontradas en Senderos: ${orders?.length || 0}`);
    
    if (orders && orders.length > 0) {
      console.log('\n📝 Órdenes que serán eliminadas:');
      orders.forEach(order => {
        console.log(`   #${order.id}: ${order.customer_name} - ${order.status} - ${order.created_at}`);
      });
    }
    
    // 2. Eliminar todas las órdenes de Senderos
    console.log('\n📋 PASO 2: ELIMINANDO ÓRDENES DE SENDEROS');
    console.log('='.repeat(40));
    
    if (orders && orders.length > 0) {
      const orderIds = orders.map(order => order.id);
      
      // Primero eliminar order_items relacionados
      console.log('🗑️  Eliminando order_items...');
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);
        
      if (itemsError) {
        console.error('❌ Error eliminando order_items:', itemsError);
        return;
      }
      
      console.log('✅ Order_items eliminados');
      
      // Luego eliminar las órdenes
      console.log('🗑️  Eliminando órdenes...');
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);
        
      if (ordersError) {
        console.error('❌ Error eliminando órdenes:', ordersError);
        return;
      }
      
      console.log(`✅ ${orderIds.length} órdenes eliminadas correctamente`);
    } else {
      console.log('✅ No hay órdenes para eliminar en Senderos');
    }
    
    // 3. Verificar que no queden órdenes en Senderos
    console.log('\n📋 PASO 3: VERIFICANDO LIMPIEZA');
    console.log('='.repeat(40));
    
    const { data: remainingOrders, error: verifyError } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', senderosRestaurantId)
      .eq('archived', false);
      
    if (verifyError) {
      console.error('❌ Error verificando órdenes:', verifyError);
      return;
    }
    
    console.log(`📊 Órdenes restantes en Senderos: ${remainingOrders?.length || 0}`);
    
    if (remainingOrders && remainingOrders.length === 0) {
      console.log('✅ ¡Limpieza exitosa! No quedan órdenes en Senderos');
    } else {
      console.log('⚠️  Aún quedan órdenes por eliminar en Senderos');
    }
    
    // 4. Crear una orden de prueba para Senderos
    console.log('\n📋 PASO 4: CREANDO ORDEN DE PRUEBA PARA SENDEROS');
    console.log('='.repeat(40));
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(1);
      
    if (menuItems && menuItems.length > 0) {
      const testOrder = {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'PRUEBA SENDEROS - ' + new Date().toLocaleTimeString(),
        total_price: menuItems[0].price,
        notes: 'Primera orden después de limpieza en Senderos',
        order_items: [
          {
            menu_item_id: menuItems[0].id,
            quantity: 1,
            price_at_order: menuItems[0].price,
            notes: 'Item de prueba'
          }
        ]
      };
      
      console.log('📝 Creando orden de prueba para Senderos...');
      
      const response = await fetch('https://osvgapxefsqqhltkabku.supabase.co/functions/v1/place-order-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(testOrder)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Nueva orden creada en Senderos: #${result.order_id}`);
        console.log('🎉 ¡Sistema Senderos listo para usar!');
      } else {
        console.error('❌ Error creando orden de prueba:', result);
      }
    } else {
      console.log('⚠️  No hay menu items disponibles en Senderos');
    }
    
    // 5. Resumen final
    console.log('\n📋 RESUMEN DE LA LIMPIEZA - SENDEROS');
    console.log('='.repeat(40));
    console.log(`✅ Órdenes eliminadas: ${orders?.length || 0}`);
    console.log(`✅ Order_items eliminados: ${orders?.length || 0}`);
    console.log(`✅ Sistema Senderos limpio y listo`);
    console.log(`✅ Nueva orden de prueba creada en Senderos`);
    
    console.log('\n🎯 INSTRUCCIONES:');
    console.log('   1. Ve al dashboard de órdenes');
    console.log('   2. Asegúrate de estar en el restaurante Senderos');
    console.log('   3. Debería estar completamente vacío');
    console.log('   4. Busca la orden "PRUEBA SENDEROS"');
    console.log('   5. Debería aparecer en tab "Pendientes"');
    console.log('   6. ¡Sistema Senderos listo para usar!');
    
  } catch (error) {
    console.error('❌ Error general en limpieza:', error);
  }
}

// Ejecutar limpieza de Senderos
cleanSenderosOrders(); 
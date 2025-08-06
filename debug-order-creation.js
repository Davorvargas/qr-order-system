const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos

async function debugOrderCreation() {
  console.log('🔍 DIAGNÓSTICO DE CREACIÓN DE ÓRDENES');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar todas las órdenes en Senderos
    console.log('\n📋 PASO 1: VERIFICANDO ÓRDENES EN SENDEROS');
    console.log('='.repeat(40));
    
    const { data: senderosOrders, error: senderosError } = await supabase
      .from('orders')
      .select('id, customer_name, status, restaurant_id, created_at')
      .eq('restaurant_id', senderosRestaurantId)
      .eq('archived', false)
      .order('created_at', { ascending: false });
      
    if (senderosError) {
      console.error('❌ Error obteniendo órdenes de Senderos:', senderosError);
      return;
    }
    
    console.log(`📊 Órdenes en Senderos: ${senderosOrders?.length || 0}`);
    if (senderosOrders && senderosOrders.length > 0) {
      senderosOrders.forEach(order => {
        console.log(`   #${order.id}: ${order.customer_name} - ${order.status} - ${order.created_at}`);
      });
    }
    
    // 2. Verificar todas las órdenes recientes (últimas 10)
    console.log('\n📋 PASO 2: VERIFICANDO ÓRDENES RECIENTES');
    console.log('='.repeat(40));
    
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, customer_name, status, restaurant_id, created_at')
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (recentError) {
      console.error('❌ Error obteniendo órdenes recientes:', recentError);
      return;
    }
    
    console.log(`📊 Órdenes recientes: ${recentOrders?.length || 0}`);
    if (recentOrders && recentOrders.length > 0) {
      recentOrders.forEach(order => {
        console.log(`   #${order.id}: ${order.customer_name} - ${order.status} - Restaurant: ${order.restaurant_id} - ${order.created_at}`);
      });
    }
    
    // 3. Verificar la mesa que estamos usando
    console.log('\n📋 PASO 3: VERIFICANDO MESA DE PRUEBA');
    console.log('='.repeat(40));
    
    const tableId = '861b499b-8294-4a83-b7b1-dcd316334db5'; // Mesa 1
    const { data: tableData, error: tableError } = await supabase
      .from('tables')
      .select('id, table_number, restaurant_id')
      .eq('id', tableId)
      .single();
      
    if (tableError) {
      console.error('❌ Error obteniendo mesa:', tableError);
      return;
    }
    
    console.log(`📊 Mesa encontrada: ${tableData.table_number} - Restaurant: ${tableData.restaurant_id}`);
    
    // 4. Crear una orden de prueba simple
    console.log('\n📋 PASO 4: CREANDO ORDEN DE PRUEBA');
    console.log('='.repeat(40));
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(1);
      
    if (menuItems && menuItems.length > 0) {
      const testOrder = {
        table_id: tableId,
        customer_name: 'PRUEBA DIAGNÓSTICO - ' + new Date().toLocaleTimeString(),
        total_price: menuItems[0].price,
        notes: 'Orden de diagnóstico',
        order_items: [
          {
            menu_item_id: menuItems[0].id,
            quantity: 1,
            price_at_order: menuItems[0].price,
            notes: 'Item de prueba'
          }
        ]
      };
      
      console.log('📝 Creando orden de prueba...');
      console.log('📦 Payload:', JSON.stringify(testOrder, null, 2));
      
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
        console.log(`✅ Orden creada: #${result.order_id}`);
        
        // Verificar la orden creada
        const { data: createdOrder, error: fetchError } = await supabase
          .from('orders')
          .select('id, customer_name, status, restaurant_id, created_at')
          .eq('id', result.order_id)
          .single();
          
        if (fetchError) {
          console.error('❌ Error obteniendo orden creada:', fetchError);
        } else {
          console.log(`✅ Orden verificada: #${createdOrder.id} - Restaurant: ${createdOrder.restaurant_id} - Status: ${createdOrder.status}`);
        }
      } else {
        console.error('❌ Error creando orden:', result);
      }
    } else {
      console.log('⚠️  No hay menu items disponibles');
    }
    
    console.log('\n🎯 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(30));
    console.log('✅ Verificación completada');
    console.log('✅ Orden de prueba creada');
    console.log('✅ Verificar en dashboard si aparece');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
debugOrderCreation(); 
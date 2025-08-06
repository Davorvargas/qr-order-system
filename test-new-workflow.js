const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos

async function testNewWorkflow() {
  console.log('🧪 PROBANDO NUEVO FLUJO DE TRABAJO - SENDEROS');
  console.log('='.repeat(55));
  
  try {
    // Obtener menu items de Senderos
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(5);
      
    if (menuError) {
      console.error('❌ Error obteniendo menu items:', menuError);
      return;
    }
    
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No hay menu items disponibles en Senderos');
      return;
    }
    
    console.log(`📋 Menu items disponibles: ${menuItems.length}`);
    
    // Crear órdenes de prueba para cada estado
    const testOrders = [
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: '🔴 NUEVA - Cliente 1',
        status: 'pending',
        items: 2
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: '🔵 EN PREPARACIÓN - Cliente 2',
        status: 'in_progress',
        items: 3
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: '🟢 SERVIDO EN MESA - Cliente 3',
        status: 'served',
        items: 4
      }
    ];
    
    console.log('\n📝 Creando órdenes de prueba para cada estado...');
    console.log('='.repeat(45));
    
    for (let i = 0; i < testOrders.length; i++) {
      const testOrder = testOrders[i];
      const orderItems = [];
      let totalPrice = 0;
      
      // Crear items para esta orden
      for (let j = 0; j < testOrder.items; j++) {
        const menuItem = menuItems[j % menuItems.length];
        orderItems.push({
          menu_item_id: menuItem.id,
          quantity: 1,
          price_at_order: menuItem.price,
          notes: `Item ${j + 1} de ${testOrder.items}`
        });
        totalPrice += menuItem.price;
      }
      
      const orderPayload = {
        table_id: testOrder.table_id,
        customer_name: testOrder.customer_name,
        total_price: totalPrice,
        notes: `Orden de prueba #${i + 1} - ${testOrder.status} - ${testOrder.items} items`,
        order_items: orderItems
      };
      
      console.log(`📋 Creando orden: ${testOrder.customer_name} (${testOrder.items} items)`);
      
      const response = await fetch('https://osvgapxefsqqhltkabku.supabase.co/functions/v1/place-order-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Orden creada: #${result.order_id} - ${testOrder.customer_name}`);
        
        // Si la orden debe estar en un estado específico, actualizarla
        if (testOrder.status !== 'pending') {
          console.log(`🔄 Actualizando orden #${result.order_id} a estado: ${testOrder.status}`);
          
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: testOrder.status })
            .eq('id', result.order_id);
            
          if (updateError) {
            console.error(`❌ Error actualizando estado: ${updateError.message}`);
          } else {
            console.log(`✅ Estado actualizado a: ${testOrder.status}`);
          }
        }
      } else {
        console.error(`❌ Error creando orden: ${testOrder.customer_name}`, result);
      }
      
      // Pequeña pausa entre órdenes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎯 RESUMEN DEL NUEVO FLUJO - SENDEROS');
    console.log('='.repeat(45));
    console.log(`✅ Órdenes creadas: ${testOrders.length}`);
    console.log(`✅ Estados probados: pending, in_progress, served`);
    console.log(`✅ Todas en Mesa 1 para agrupación`);
    console.log(`✅ Nuevo flujo implementado`);
    
    console.log('\n🔍 INSTRUCCIONES PARA VERIFICAR:');
    console.log('   1. Ve al dashboard de órdenes en Senderos');
    console.log('   2. Verifica los tabs: "Nuevas", "En Preparación", "Servido en Mesa"');
    console.log('   3. En "Nuevas": debería estar la orden 🔴 NUEVA');
    console.log('   4. En "En Preparación": debería estar la orden 🔵 EN PREPARACIÓN');
    console.log('   5. En "Servido en Mesa": debería estar la orden 🟢 SERVIDO EN MESA');
    console.log('   6. Prueba los botones: COMENZAR A PREPARAR → MARCAR COMO SERVIDO → COBRAR Y CERRAR');
    console.log('   7. Verifica que el layout mantenga máximo 4 columnas');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba del nuevo flujo
testNewWorkflow(); 
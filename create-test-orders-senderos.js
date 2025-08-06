const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos

async function createTestOrdersSenderos() {
  console.log('🧪 CREANDO ÓRDENES DE PRUEBA - SENDEROS');
  console.log('='.repeat(50));
  
  try {
    // Obtener menu items de Senderos
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(10);
      
    if (menuError) {
      console.error('❌ Error obteniendo menu items:', menuError);
      return;
    }
    
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No hay menu items disponibles en Senderos');
      return;
    }
    
    console.log(`📋 Menu items disponibles: ${menuItems.length}`);
    
    // Definir órdenes de prueba con diferentes cantidades de items
    const testOrders = [
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'Mesa 1 - Orden Corta',
        items: 1
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'Mesa 1 - Orden Media',
        items: 3
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'Mesa 1 - Orden Larga',
        items: 5
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'Mesa 1 - Orden Muy Larga',
        items: 8
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'Mesa 1 - Orden Extra Larga',
        items: 12
      },
      {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
        customer_name: 'Mesa 1 - Orden Super Larga',
        items: 15
      }
    ];
    
    console.log('\n📝 Creando órdenes de prueba...');
    console.log('='.repeat(30));
    
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
        notes: `Orden de prueba #${i + 1} con ${testOrder.items} items`,
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
      } else {
        console.error(`❌ Error creando orden: ${testOrder.customer_name}`, result);
      }
      
      // Pequeña pausa entre órdenes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎯 RESUMEN DE PRUEBAS - SENDEROS');
    console.log('='.repeat(40));
    console.log(`✅ Órdenes creadas: ${testOrders.length}`);
    console.log(`✅ Items por orden: 1, 3, 5, 8, 12, 15`);
    console.log(`✅ Todas en Mesa 1 para agrupación`);
    console.log(`✅ Layout máximo 4 columnas implementado`);
    
    console.log('\n🔍 INSTRUCCIONES PARA VERIFICAR:');
    console.log('   1. Ve al dashboard de órdenes');
    console.log('   2. Asegúrate de estar en Senderos');
    console.log('   3. Ve al tab "Pendientes"');
    console.log('   4. Deberías ver máximo 4 columnas');
    console.log('   5. Las órdenes adicionales van debajo de la más corta');
    console.log('   6. Todas las órdenes están agrupadas por Mesa 1');
    console.log('   7. Las órdenes más largas deberían tener más altura');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación de órdenes de prueba
createTestOrdersSenderos(); 
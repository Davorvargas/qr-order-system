const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos
const senderosTableId = 'cf06cf5e-f263-4397-a9b9-e184c35e89c0'; // Mesa 1 de Senderos

async function crearOrdenesPruebaLayout() {
  console.log('📋 CREANDO ÓRDENES DE PRUEBA PARA LAYOUT');
  console.log('='.repeat(50));
  
  try {
    // Obtener menu items de Senderos
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(10); // Obtener más items para variedad
      
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No hay menu items en Senderos');
      return;
    }
    
    console.log(`📋 Menu items disponibles: ${menuItems.length}`);
    menuItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - Bs. ${item.price}`);
    });
    
    // Definir órdenes de prueba con diferentes cantidades de items
    const ordenesPrueba = [
      {
        customerName: '🍕 Orden Simple - 1 item',
        items: [menuItems[0]],
        notes: 'Orden de prueba para layout simple'
      },
      {
        customerName: '🍔 Orden Media - 3 items',
        items: [menuItems[0], menuItems[1], menuItems[2]],
        notes: 'Orden de prueba para layout medio'
      },
      {
        customerName: '🍽️ Orden Grande - 5 items',
        items: [menuItems[0], menuItems[1], menuItems[2], menuItems[3], menuItems[4]],
        notes: 'Orden de prueba para layout grande'
      },
      {
        customerName: '🎉 Orden Familiar - 8 items',
        items: menuItems.slice(0, 8),
        notes: 'Orden de prueba para layout familiar'
      },
      {
        customerName: '🏆 Orden Fiesta - 12 items',
        items: menuItems.slice(0, 12),
        notes: 'Orden de prueba para layout fiesta'
      },
      {
        customerName: '👑 Orden VIP - 15 items',
        items: menuItems.slice(0, 15),
        notes: 'Orden de prueba para layout VIP'
      },
      {
        customerName: '🌟 Orden Especial - 2 items',
        items: [menuItems[0], menuItems[1]],
        notes: 'Orden con comentarios especiales para probar layout'
      },
      {
        customerName: '🎯 Orden Rápida - 1 item',
        items: [menuItems[0]],
        notes: 'Para llevar - urgente'
      }
    ];
    
    console.log('\n📝 CREANDO ÓRDENES DE PRUEBA...');
    console.log('='.repeat(40));
    
    let ordenesCreadas = 0;
    
    for (let i = 0; i < ordenesPrueba.length; i++) {
      const orden = ordenesPrueba[i];
      
      // Calcular total
      const totalPrice = orden.items.reduce((sum, item) => sum + item.price, 0);
      
      // Crear payload de la orden
      const testOrder = {
        table_id: senderosTableId,
        customer_name: orden.customerName,
        total_price: totalPrice,
        notes: orden.notes,
        order_items: orden.items.map(item => ({
          menu_item_id: item.id,
          quantity: 1,
          price_at_order: item.price,
          notes: `Item de prueba ${item.name}`
        }))
      };
      
      console.log(`\n📦 Creando orden ${i + 1}/${ordenesPrueba.length}:`);
      console.log(`   Cliente: ${orden.customerName}`);
      console.log(`   Items: ${orden.items.length}`);
      console.log(`   Total: Bs. ${totalPrice.toFixed(2)}`);
      
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
        console.log(`   ✅ Orden creada: #${result.order_id}`);
        ordenesCreadas++;
        
        // Esperar un poco entre órdenes para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`   ❌ Error creando orden: ${result.error || 'Error desconocido'}`);
      }
    }
    
    console.log('\n🎯 RESUMEN DE CREACIÓN');
    console.log('='.repeat(30));
    console.log(`✅ Órdenes creadas exitosamente: ${ordenesCreadas}/${ordenesPrueba.length}`);
    
    console.log('\n🔍 INSTRUCCIONES PARA VERIFICAR LAYOUT:');
    console.log('   1. Ve al dashboard de Senderos');
    console.log('   2. Observa las diferentes órdenes creadas');
    console.log('   3. Verifica que el layout se adapta a diferentes cantidades de items');
    console.log('   4. Comprueba que las órdenes se muestran en máximo 4 columnas');
    console.log('   5. Verifica que las órdenes adicionales fluyen debajo de la más corta');
    console.log('   6. Observa que las órdenes con más items ocupan más altura');
    
    console.log('\n📊 ÓRDENES CREADAS:');
    ordenesPrueba.forEach((orden, index) => {
      console.log(`   ${index + 1}. ${orden.customerName} - ${orden.items.length} items`);
    });
    
    console.log('\n🎉 ¡Órdenes de prueba creadas para verificar layout!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación de órdenes
crearOrdenesPruebaLayout(); 
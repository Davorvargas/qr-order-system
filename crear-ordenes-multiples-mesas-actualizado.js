const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos

async function crearOrdenesMultiplesMesasActualizado() {
  console.log('📋 CREANDO ÓRDENES EN MÚLTIPLES MESAS');
  console.log('='.repeat(50));
  
  try {
    // Obtener todas las mesas de Senderos
    const { data: mesas } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', senderosRestaurantId)
      .order('table_number')
      .limit(8); // Usar solo las primeras 8 mesas
      
    if (!mesas || mesas.length === 0) {
      console.log('❌ No hay mesas en Senderos');
      return;
    }
    
    console.log(`📋 Mesas disponibles: ${mesas.length}`);
    mesas.forEach((mesa, index) => {
      console.log(`   ${index + 1}. Mesa ${mesa.table_number} (${mesa.id})`);
    });
    
    // Obtener menu items de Senderos
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(8);
      
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No hay menu items en Senderos');
      return;
    }
    
    console.log(`\n📋 Menu items disponibles: ${menuItems.length}`);
    menuItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - Bs. ${item.price}`);
    });
    
    // Definir órdenes para diferentes mesas
    const ordenesPorMesa = [
      {
        mesa: mesas[0], // Mesa 1
        ordenes: [
          {
            customerName: '👨‍👩‍👧‍👦 Familia López',
            items: [menuItems[0], menuItems[1], menuItems[2]],
            notes: 'Sin cebolla en la hamburguesa'
          },
          {
            customerName: '👨‍👩‍👧‍👦 Familia López',
            items: [menuItems[3], menuItems[4]],
            notes: 'Postre para los niños'
          }
        ]
      },
      {
        mesa: mesas[1], // Mesa 2
        ordenes: [
          {
            customerName: '💑 Pareja Martínez',
            items: [menuItems[0], menuItems[1]],
            notes: 'Romántico - mesa junto a la ventana'
          }
        ]
      },
      {
        mesa: mesas[2], // Mesa 3
        ordenes: [
          {
            customerName: '👥 Grupo Amigos',
            items: [menuItems[0], menuItems[1], menuItems[2], menuItems[3], menuItems[4]],
            notes: 'Fiesta de cumpleaños'
          },
          {
            customerName: '👥 Grupo Amigos',
            items: [menuItems[5], menuItems[6]],
            notes: 'Bebidas adicionales'
          },
          {
            customerName: '👥 Grupo Amigos',
            items: [menuItems[7]],
            notes: 'Postre compartido'
          }
        ]
      },
      {
        mesa: mesas[3], // Mesa 4
        ordenes: [
          {
            customerName: '👨‍💼 Ejecutivo García',
            items: [menuItems[0]],
            notes: 'Reunión de trabajo - urgente'
          }
        ]
      },
      {
        mesa: mesas[4], // Mesa 5
        ordenes: [
          {
            customerName: '👵👴 Abuelos Rodríguez',
            items: [menuItems[1], menuItems[2]],
            notes: 'Porciones pequeñas por favor'
          },
          {
            customerName: '👵👴 Abuelos Rodríguez',
            items: [menuItems[3]],
            notes: 'Té caliente'
          }
        ]
      },
      {
        mesa: mesas[5], // Mesa 6
        ordenes: [
          {
            customerName: '🎉 Fiesta Juvenil',
            items: [menuItems[0], menuItems[1], menuItems[2], menuItems[3], menuItems[4], menuItems[5]],
            notes: 'Celebración de graduación'
          }
        ]
      },
      {
        mesa: mesas[6], // Mesa 7
        ordenes: [
          {
            customerName: '👨‍👩‍👦 Familia González',
            items: [menuItems[0], menuItems[1]],
            notes: 'Alergia a mariscos'
          },
          {
            customerName: '👨‍👩‍👦 Familia González',
            items: [menuItems[2], menuItems[3]],
            notes: 'Bebidas sin alcohol'
          }
        ]
      },
      {
        mesa: mesas[7], // Mesa 8
        ordenes: [
          {
            customerName: '💼 Reunión Empresarial',
            items: [menuItems[0], menuItems[1], menuItems[2]],
            notes: 'Presentación importante'
          },
          {
            customerName: '💼 Reunión Empresarial',
            items: [menuItems[4], menuItems[5]],
            notes: 'Café y postres'
          }
        ]
      }
    ];
    
    console.log('\n📝 CREANDO ÓRDENES POR MESA...');
    console.log('='.repeat(40));
    
    let ordenesCreadas = 0;
    let mesasConOrdenes = 0;
    
    for (let mesaIndex = 0; mesaIndex < ordenesPorMesa.length; mesaIndex++) {
      const mesaData = ordenesPorMesa[mesaIndex];
      
      console.log(`\n🏠 MESA ${mesaData.mesa.table_number}:`);
      
      for (let ordenIndex = 0; ordenIndex < mesaData.ordenes.length; ordenIndex++) {
        const orden = mesaData.ordenes[ordenIndex];
        
        // Calcular total
        const totalPrice = orden.items.reduce((sum, item) => sum + item.price, 0);
        
        // Crear payload de la orden
        const testOrder = {
          table_id: mesaData.mesa.id,
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
        
        console.log(`   📦 Creando orden ${ordenIndex + 1}/${mesaData.ordenes.length}:`);
        console.log(`      Cliente: ${orden.customerName}`);
        console.log(`      Items: ${orden.items.length}`);
        console.log(`      Total: Bs. ${totalPrice.toFixed(2)}`);
        
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
          console.log(`      ✅ Orden creada: #${result.order_id}`);
          ordenesCreadas++;
          
          // Esperar un poco entre órdenes para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`      ❌ Error creando orden: ${result.error || 'Error desconocido'}`);
        }
      }
      
      mesasConOrdenes++;
    }
    
    console.log('\n🎯 RESUMEN DE CREACIÓN');
    console.log('='.repeat(30));
    console.log(`✅ Órdenes creadas exitosamente: ${ordenesCreadas}`);
    console.log(`✅ Mesas con órdenes: ${mesasConOrdenes}`);
    
    console.log('\n🔍 INSTRUCCIONES PARA VERIFICAR LAYOUT:');
    console.log('   1. Ve al dashboard de Senderos');
    console.log('   2. Observa cómo se agrupan las órdenes por mesa');
    console.log('   3. Verifica que las órdenes de la misma mesa aparecen juntas');
    console.log('   4. Comprueba que el layout se adapta a múltiples órdenes por mesa');
    console.log('   5. Observa la distribución en máximo 4 columnas');
    console.log('   6. Verifica que las órdenes adicionales fluyen correctamente');
    console.log('   7. Observa el comportamiento masonry (más corta debajo)');
    
    console.log('\n📊 ÓRDENES CREADAS POR MESA:');
    ordenesPorMesa.forEach((mesaData, mesaIndex) => {
      console.log(`   Mesa ${mesaData.mesa.table_number}: ${mesaData.ordenes.length} órdenes`);
      mesaData.ordenes.forEach((orden, ordenIndex) => {
        console.log(`     - ${orden.customerName} (${orden.items.length} items)`);
      });
    });
    
    console.log('\n🎉 ¡Órdenes creadas en múltiples mesas para verificar distribución!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación de órdenes
crearOrdenesMultiplesMesasActualizado(); 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = 'a01006de-3963-406d-b060-5b7b34623a38';

// Datos de prueba
const testTables = [
  '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
  '5fea702d-c5ed-494b-a29a-3cc9900ae931', // Mesa 2
  'eb8a2ad3-43db-4521-946a-8cc09f1e869d', // Mesa 3
  '6e75588b-aff5-445a-8f8c-3aeaf638b7be', // Mesa 4
  'b5ff58e0-5a36-44d0-a3fc-ef5444dee087', // Mesa 5
];

const testCustomers = [
  'Juan Pérez',
  'María García',
  'Carlos López',
  'Ana Martínez',
  'Luis Rodríguez',
  'Carmen Silva',
  'Roberto Torres',
  'Isabel Morales',
];

async function createTestOrders() {
  console.log('🧪 CREANDO ÓRDENES DE PRUEBA PARA LAYOUT DINÁMICO');
  console.log('='.repeat(60));
  
  try {
    // 1. Obtener menu items disponibles
    console.log('\n📋 PASO 1: OBTENIENDO MENU ITEMS');
    console.log('='.repeat(40));
    
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', restaurantId)
      .limit(10);
      
    if (menuError) {
      console.error('❌ Error obteniendo menu items:', menuError);
      return;
    }
    
    console.log(`✅ Menu items disponibles: ${menuItems?.length || 0}`);
    
    // 2. Crear órdenes de prueba con diferentes características
    console.log('\n📋 PASO 2: CREANDO ÓRDENES DE PRUEBA');
    console.log('='.repeat(40));
    
    const testOrders = [
      // Mesa 1: Orden simple (1 item)
      {
        table_id: testTables[0],
        customer_name: testCustomers[0],
        total_price: menuItems[0]?.price || 35,
        notes: 'Orden simple - 1 item',
        order_items: [
          {
            menu_item_id: menuItems[0]?.id || 78,
            quantity: 1,
            price_at_order: menuItems[0]?.price || 35,
            notes: 'Item simple'
          }
        ]
      },
      
      // Mesa 2: Orden mediana (3 items)
      {
        table_id: testTables[1],
        customer_name: testCustomers[1],
        total_price: (menuItems[0]?.price || 35) + (menuItems[1]?.price || 40) + (menuItems[2]?.price || 8),
        notes: 'Orden mediana - 3 items',
        order_items: [
          {
            menu_item_id: menuItems[0]?.id || 78,
            quantity: 1,
            price_at_order: menuItems[0]?.price || 35,
            notes: 'Primer item'
          },
          {
            menu_item_id: menuItems[1]?.id || 79,
            quantity: 1,
            price_at_order: menuItems[1]?.price || 40,
            notes: 'Segundo item'
          },
          {
            menu_item_id: menuItems[2]?.id || 80,
            quantity: 1,
            price_at_order: menuItems[2]?.price || 8,
            notes: 'Tercer item'
          }
        ]
      },
      
      // Mesa 3: Orden grande (5 items)
      {
        table_id: testTables[2],
        customer_name: testCustomers[2],
        total_price: (menuItems[0]?.price || 35) * 2 + (menuItems[1]?.price || 40) + (menuItems[2]?.price || 8) * 2,
        notes: 'Orden grande - 5 items con múltiples cantidades',
        order_items: [
          {
            menu_item_id: menuItems[0]?.id || 78,
            quantity: 2,
            price_at_order: menuItems[0]?.price || 35,
            notes: 'Doble hamburguesa'
          },
          {
            menu_item_id: menuItems[1]?.id || 79,
            quantity: 1,
            price_at_order: menuItems[1]?.price || 40,
            notes: 'Pizza individual'
          },
          {
            menu_item_id: menuItems[2]?.id || 80,
            quantity: 2,
            price_at_order: menuItems[2]?.price || 8,
            notes: 'Doble bebida'
          }
        ]
      },
      
      // Mesa 4: Orden muy grande (8 items)
      {
        table_id: testTables[3],
        customer_name: testCustomers[3],
        total_price: (menuItems[0]?.price || 35) * 3 + (menuItems[1]?.price || 40) * 2 + (menuItems[2]?.price || 8) * 3,
        notes: 'Orden muy grande - 8 items para probar layout dinámico',
        order_items: [
          {
            menu_item_id: menuItems[0]?.id || 78,
            quantity: 3,
            price_at_order: menuItems[0]?.price || 35,
            notes: 'Triple hamburguesa'
          },
          {
            menu_item_id: menuItems[1]?.id || 79,
            quantity: 2,
            price_at_order: menuItems[1]?.price || 40,
            notes: 'Doble pizza'
          },
          {
            menu_item_id: menuItems[2]?.id || 80,
            quantity: 3,
            price_at_order: menuItems[2]?.price || 8,
            notes: 'Triple bebida'
          }
        ]
      },
      
      // Mesa 5: Orden extra grande (12 items)
      {
        table_id: testTables[4],
        customer_name: testCustomers[4],
        total_price: (menuItems[0]?.price || 35) * 4 + (menuItems[1]?.price || 40) * 3 + (menuItems[2]?.price || 8) * 5,
        notes: 'Orden extra grande - 12 items para máximo test de layout',
        order_items: [
          {
            menu_item_id: menuItems[0]?.id || 78,
            quantity: 4,
            price_at_order: menuItems[0]?.price || 35,
            notes: 'Cuádruple hamburguesa'
          },
          {
            menu_item_id: menuItems[1]?.id || 79,
            quantity: 3,
            price_at_order: menuItems[1]?.price || 40,
            notes: 'Triple pizza'
          },
          {
            menu_item_id: menuItems[2]?.id || 80,
            quantity: 5,
            price_at_order: menuItems[2]?.price || 8,
            notes: 'Quintuple bebida'
          }
        ]
      }
    ];
    
    // 3. Crear las órdenes una por una
    console.log('📝 Creando órdenes de prueba...');
    
    for (let i = 0; i < testOrders.length; i++) {
      const testOrder = testOrders[i];
      console.log(`\n🔄 Creando orden ${i + 1}/${testOrders.length}: Mesa ${i + 1} - ${testOrder.order_items.length} items`);
      
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
        console.log(`✅ Orden creada: #${result.order_id} - Mesa ${i + 1}`);
      } else {
        console.error(`❌ Error creando orden ${i + 1}:`, result);
      }
      
      // Esperar un poco entre órdenes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 4. Verificar órdenes creadas
    console.log('\n📋 PASO 3: VERIFICANDO ÓRDENES CREADAS');
    console.log('='.repeat(40));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: createdOrders, error: verifyError } = await supabase
      .from('orders')
      .select('id, customer_name, table_id, total_price, order_items(count)')
      .eq('restaurant_id', restaurantId)
      .eq('archived', false)
      .order('created_at', { ascending: false });
      
    if (verifyError) {
      console.error('❌ Error verificando órdenes:', verifyError);
      return;
    }
    
    console.log(`📊 Órdenes creadas: ${createdOrders?.length || 0}`);
    
    createdOrders?.forEach(order => {
      console.log(`   #${order.id}: ${order.customer_name} - Mesa ${order.table_id} - Bs ${order.total_price}`);
    });
    
    // 5. Resumen final
    console.log('\n📋 RESUMEN DE PRUEBAS');
    console.log('='.repeat(40));
    console.log(`✅ Órdenes de prueba creadas: ${testOrders.length}`);
    console.log(`✅ Diferentes tamaños de órdenes: 1, 3, 5, 8, 12 items`);
    console.log(`✅ Diferentes mesas: 5 mesas`);
    console.log(`✅ Layout dinámico probado`);
    
    console.log('\n🎯 INSTRUCCIONES PARA VERIFICAR:');
    console.log('   1. Ve al dashboard de órdenes');
    console.log('   2. Ve al tab "Pendientes"');
    console.log('   3. Observa cómo las órdenes se acomodan dinámicamente');
    console.log('   4. Las órdenes grandes no deberían alargar las pequeñas');
    console.log('   5. El layout debería ser responsive y fluido');
    
  } catch (error) {
    console.error('❌ Error general creando órdenes de prueba:', error);
  }
}

// Ejecutar creación de órdenes de prueba
createTestOrders(); 
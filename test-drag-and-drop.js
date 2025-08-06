const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDragAndDropFunctionality() {
  console.log('🧪 TEST: FUNCIONALIDAD DE DRAG AND DROP');
  console.log('========================================');

  try {
    // 1. Verificar que hay órdenes disponibles para fusionar
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, table_id, status, total_price, restaurant_id')
      .in('status', ['pending', 'in_progress'])
      .limit(10);

    if (ordersError) {
      console.error('❌ Error al obtener órdenes:', ordersError);
      return;
    }

    if (!orders || orders.length < 2) {
      console.log('⚠️  No hay suficientes órdenes para probar la fusión');
      console.log('   Crea al menos 2 órdenes pendientes o en progreso');
      return;
    }

    console.log(`✅ Encontradas ${orders.length} órdenes válidas para fusión`);

    // 2. Agrupar órdenes por mesa
    const ordersByTable = {};
    orders.forEach(order => {
      if (!ordersByTable[order.table_id]) {
        ordersByTable[order.table_id] = [];
      }
      ordersByTable[order.table_id].push(order);
    });

    // 3. Encontrar mesas con múltiples órdenes
    const tablesWithMultipleOrders = Object.entries(ordersByTable)
      .filter(([tableId, tableOrders]) => tableOrders.length >= 2)
      .map(([tableId, tableOrders]) => ({ tableId, orders: tableOrders }));

    if (tablesWithMultipleOrders.length === 0) {
      console.log('⚠️  No hay mesas con múltiples órdenes para fusionar');
      console.log('   Crea múltiples órdenes en la misma mesa');
      return;
    }

    console.log(`✅ Encontradas ${tablesWithMultipleOrders.length} mesas con múltiples órdenes`);

    // 4. Mostrar ejemplos de órdenes que se pueden fusionar
    tablesWithMultipleOrders.forEach(({ tableId, orders }) => {
      console.log(`\n📋 Mesa ${tableId}:`);
      orders.forEach(order => {
        console.log(`   - Orden #${order.id}: Bs ${order.total_price?.toFixed(2) || '0.00'} (${order.status})`);
      });
      
      const total = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      console.log(`   💰 Total combinado: Bs ${total.toFixed(2)}`);
    });

    // 5. Verificar que la función merge_orders existe
    const { data: functionExists, error: functionError } = await supabase
      .rpc('merge_orders', {
        source_order_ids: [orders[0].id],
        target_order_id: orders[1].id,
        new_total: (orders[0].total_price || 0) + (orders[1].total_price || 0)
      });

    if (functionError) {
      console.log('❌ Error al verificar función merge_orders:', functionError.message);
      if (functionError.message.includes('function merge_orders')) {
        console.log('   La función merge_orders no está disponible');
        console.log('   Ejecuta: npx supabase db push');
      }
    } else {
      console.log('✅ Función merge_orders está disponible');
    }

    // 6. Verificar Edge Function
    console.log('\n🔧 Verificando Edge Function...');
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/merge-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          orderIds: [orders[0].id],
          targetOrderId: orders[1].id
        })
      });

      if (response.ok) {
        console.log('✅ Edge Function merge-orders está funcionando');
      } else {
        console.log('⚠️  Edge Function merge-orders no responde correctamente');
      }
    } catch (error) {
      console.log('❌ Error al verificar Edge Function:', error.message);
    }

    console.log('\n📝 INSTRUCCIONES PARA PROBAR:');
    console.log('1. Ve al dashboard de staff');
    console.log('2. Busca órdenes con borde morado (arrastrables)');
    console.log('3. Haz clic y arrastra una orden sobre otra de la misma mesa');
    console.log('4. Confirma la fusión en el modal');
    console.log('5. Verifica que las órdenes se hayan fusionado');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testDragAndDropFunctionality(); 
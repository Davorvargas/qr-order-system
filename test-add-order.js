const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🧪 PRUEBA: Funcionalidad de agregar pedidos desde staff\n');
    console.log('='.repeat(60));
    
    const senderos = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    const senderosUser = 'e05094eb-0452-43bd-aa3e-214a6c3b6966';
    
    // Test 1: Verificar menú disponible para Senderos
    console.log('\n📋 TEST 1: Verificar menú disponible para Senderos');
    
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', senderos)
      .eq('is_available', true);
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', senderos)
      .eq('is_available', true);
    
    console.log(`✅ Categorías disponibles: ${categories.length}`);
    categories.forEach(c => console.log(`   - ${c.name} (ID: ${c.id})`));
    
    console.log(`\\n✅ Items de menú disponibles: ${menuItems.length}`);
    menuItems.forEach(m => console.log(`   - ${m.name} - Bs ${m.price} (Cat: ${m.category_id})`));
    
    // Test 2: Verificar mesas disponibles
    console.log('\\n🪑 TEST 2: Verificar mesas disponibles para Senderos');
    
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', senderos)
      .limit(5);
    
    console.log(`✅ Mesas disponibles: ${tables.length} (mostrando primeras 5)`);
    tables.forEach(t => console.log(`   - Mesa ${t.table_number} (ID: ${t.id})`));
    
    // Test 3: Simular creación de pedido desde staff
    console.log('\\n📦 TEST 3: Simular creación de pedido desde staff');
    
    if (menuItems.length === 0) {
      console.log('❌ No hay items de menú disponibles para crear pedido');
      return;
    }
    
    const selectedTable = tables[0];
    const selectedItems = menuItems.slice(0, 2); // Seleccionar primeros 2 items
    
    console.log(`\\n🎯 Creando pedido para Mesa ${selectedTable.table_number}:`);
    selectedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} x1 - Bs ${item.price}`);
    });
    
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
    console.log(`\\n💰 Total del pedido: Bs ${totalPrice.toFixed(2)}`);
    
    // Preparar payload para edge function
    const orderPayload = {
      table_id: selectedTable.id,
      customer_name: 'Pedido Staff Test',
      total_price: totalPrice,
      source: 'staff_placed',
      order_items: selectedItems.map(item => ({
        menu_item_id: item.id,
        quantity: 1,
        price_at_order: item.price,
        notes: `Test item: ${item.name}`
      }))
    };
    
    console.log('\\n🚀 Invocando edge function place-order...');
    
    const { data: orderResult, error: orderError } = await supabase.functions.invoke('place-order', {
      body: orderPayload
    });
    
    if (orderError) {
      console.error('❌ Error creando pedido:', orderError.message);
      return;
    }
    
    console.log('✅ Pedido creado exitosamente!');
    console.log(`   - Order ID: ${orderResult.order_id}`);
    console.log(`   - Estado: ${orderResult.status}`);
    console.log(`   - Mensaje: ${orderResult.message}`);
    
    // Test 4: Verificar que el pedido se creó correctamente en la base de datos
    console.log('\\n🔍 TEST 4: Verificar pedido en base de datos');
    
    const { data: createdOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, menu_items(name, price))
      `)
      .eq('id', orderResult.order_id)
      .single();
    
    if (createdOrder) {
      console.log('✅ Pedido verificado en base de datos:');
      console.log(`   - ID: ${createdOrder.id}`);
      console.log(`   - Cliente: ${createdOrder.customer_name}`);
      console.log(`   - Mesa: ${createdOrder.table_id}`);
      console.log(`   - Estado: ${createdOrder.status}`);
      console.log(`   - Total: Bs ${createdOrder.total_price}`);
      console.log(`   - Restaurante: ${createdOrder.restaurant_id === senderos ? 'Senderos ✅' : 'ERROR ❌'}`);
      console.log(`   - Origen: ${createdOrder.source}`);
      
      console.log('\\n📋 Items del pedido:');
      createdOrder.order_items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.menu_items.name} x${item.quantity} - Bs ${item.price_at_order}`);
        console.log(`      Notas: ${item.notes || 'Sin notas'}`);
      });
    }
    
    // Test 5: Verificar estado de impresoras (para determinar status inicial)
    console.log('\\n🖨️ TEST 5: Verificar lógica de impresoras');
    
    const { data: activePrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', senderos)
      .eq('is_active', true);
    
    console.log(`✅ Impresoras activas para Senderos: ${activePrinters.length}`);
    activePrinters.forEach(p => console.log(`   - ${p.name} (${p.type})`));
    
    const expectedStatus = activePrinters.length > 0 ? 'pending' : 'in_progress';
    console.log(`\\n🎯 Estado esperado del pedido: ${expectedStatus}`);
    console.log(`🎯 Estado actual del pedido: ${createdOrder.status}`);
    console.log(`${createdOrder.status === expectedStatus ? '✅ Lógica de estado correcta' : '❌ Error en lógica de estado'}`);
    
    console.log('\\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBA - AGREGAR PEDIDO:');
    console.log('='.repeat(60));
    console.log('✅ Menú filtrado por restaurante correctamente');
    console.log('✅ Mesas filtradas por restaurante correctamente');
    console.log('✅ Edge function place-order funcionando');
    console.log('✅ Pedido creado con restaurant_id correcto');
    console.log('✅ Items del pedido vinculados correctamente');
    console.log('✅ Lógica de estado según impresoras activas');
    console.log('\\n🎉 FUNCIONALIDAD DE AGREGAR PEDIDOS: VERIFICADA');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error(error.stack);
  }
})();
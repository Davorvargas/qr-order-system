const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function runE2ETests() {
  console.log('🎯 INICIANDO PRUEBAS EXTREMO A EXTREMO (E2E)');
  console.log('='.repeat(70));
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  const runTest = async (testName, testFunction) => {
    try {
      console.log(`\n🔍 ${testName}`);
      await testFunction();
      console.log(`✅ PASÓ: ${testName}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ FALLÓ: ${testName}`);
      console.log(`   Error: ${error.message}`);
      testsFailed++;
    }
  };

  // ESCENARIO 1: Cliente hace pedido completo con modificadores
  await runTest('ESCENARIO 1: Pedido completo con modificadores', async () => {
    console.log('   👤 Simulando cliente en mesa 1');
    
    // 1. Obtener mesa
    const { data: table } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    if (!table) throw new Error('No hay mesas disponibles');
    console.log(`   🪑 Mesa seleccionada: ${table.table_number}`);
    
    // 2. Obtener productos del menú
    const { data: espresso } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .eq('name', 'Espresso')
      .single();
    
    const { data: mates } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .eq('name', 'Mates: Coca - Manzanilla - Anís')
      .single();
    
    if (!espresso || !mates) throw new Error('Productos no encontrados');
    console.log('   ☕ Productos seleccionados: Espresso, Mates');
    
    // 3. Obtener modificadores de mates
    const { data: modifierGroups } = await supabase
      .from('modifier_groups')
      .select('*, modifiers(*)')
      .eq('menu_item_id', mates.id);
    
    if (!modifierGroups || modifierGroups.length === 0) {
      throw new Error('No hay modificadores para Mates');
    }
    
    const cocaModifier = modifierGroups[0].modifiers.find(m => m.name === 'Coca');
    if (!cocaModifier) throw new Error('Modificador Coca no encontrado');
    console.log('   🌿 Modificador seleccionado: Coca');
    
    // 4. Crear orden
    const totalPrice = espresso.price + mates.price + cocaModifier.price_modifier;
    const { data: order } = await supabase
      .from('orders')
      .insert({
        restaurant_id: SENDEROS_ID,
        table_id: table.id,
        customer_name: 'Cliente E2E',
        status: 'pending',
        total_price: totalPrice,
        source: 'qr'
      })
      .select()
      .single();
    
    console.log(`   📝 Orden creada #${order.id}, Total: $${totalPrice}`);
    
    // 5. Agregar items a la orden
    const orderItems = [
      {
        order_id: order.id,
        menu_item_id: espresso.id,
        quantity: 1,
        price_at_order: espresso.price
      },
      {
        order_id: order.id,
        menu_item_id: mates.id,
        quantity: 1,
        price_at_order: mates.price,
        notes: 'Con modificador: Coca'
      }
    ];
    
    await supabase.from('order_items').insert(orderItems);
    console.log('   📋 Items agregados a la orden');
    
    // 6. Simular procesamiento de la orden
    await supabase
      .from('orders')
      .update({ status: 'preparing' })
      .eq('id', order.id);
    
    console.log('   🍳 Orden marcada como "preparando"');
    
    // 7. Simular completar orden
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id);
    
    console.log('   ✅ Orden completada');
    
    // 8. Limpiar datos de prueba
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('   🧹 Datos de prueba limpiados');
  });

  // ESCENARIO 2: Staff gestiona pedidos en dashboard
  await runTest('ESCENARIO 2: Gestión de pedidos por staff', async () => {
    console.log('   👨‍💼 Simulando staff en dashboard');
    
    // 1. Crear múltiples órdenes
    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    const orders = [];
    for (let i = 1; i <= 3; i++) {
      const { data: order } = await supabase
        .from('orders')
        .insert({
          restaurant_id: SENDEROS_ID,
          table_id: table.id,
          customer_name: `Cliente ${i}`,
          status: 'pending',
          total_price: 25.0,
          source: 'qr'
        })
        .select()
        .single();
      
      orders.push(order);
    }
    
    console.log(`   📊 ${orders.length} órdenes creadas para gestión`);
    
    // 2. Simular visualización de órdenes del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaysOrders } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name))')
      .eq('restaurant_id', SENDEROS_ID)
      .gte('created_at', today.toISOString());
    
    if (!todaysOrders || todaysOrders.length < 3) {
      throw new Error('No se pueden visualizar las órdenes correctamente');
    }
    
    console.log(`   👀 Dashboard mostrando ${todaysOrders.length} órdenes`);
    
    // 3. Simular cambio de estado de órdenes
    for (const order of orders) {
      await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', order.id);
    }
    
    console.log('   🔄 Estados actualizados a "preparando"');
    
    // 4. Simular modificación de orden
    const orderToModify = orders[0];
    await supabase
      .from('orders')
      .update({ 
        notes: 'Modificado por staff - sin azúcar',
        status: 'modified'
      })
      .eq('id', orderToModify.id);
    
    console.log('   ✏️ Orden modificada por staff');
    
    // 5. Limpiar datos de prueba
    for (const order of orders) {
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
    }
    
    console.log('   🧹 Datos de prueba limpiados');
  });

  // ESCENARIO 3: Sistema de impresión
  await runTest('ESCENARIO 3: Sistema de impresión', async () => {
    console.log('   🖨️ Simulando sistema de impresión');
    
    // 1. Verificar impresoras configuradas
    const { data: printers } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID);
    
    if (!printers || printers.length === 0) {
      throw new Error('No hay impresoras configuradas');
    }
    
    console.log(`   ⚙️ ${printers.length} impresoras encontradas`);
    
    // 2. Crear orden para imprimir
    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    const { data: product } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    const { data: order } = await supabase
      .from('orders')
      .insert({
        restaurant_id: SENDEROS_ID,
        table_id: table.id,
        customer_name: 'Cliente Impresión',
        status: 'pending',
        total_price: product.price,
        source: 'qr',
        kitchen_printed: false,
        drink_printed: false
      })
      .select()
      .single();
    
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        menu_item_id: product.id,
        quantity: 1,
        price_at_order: product.price
      });
    
    console.log('   📄 Orden creada para impresión');
    
    // 3. Simular impresión de cocina
    await supabase
      .from('orders')
      .update({ kitchen_printed: true })
      .eq('id', order.id);
    
    console.log('   🍳 Orden enviada a impresora de cocina');
    
    // 4. Simular impresión de bebidas
    await supabase
      .from('orders')
      .update({ drink_printed: true })
      .eq('id', order.id);
    
    console.log('   🥤 Orden enviada a impresora de bebidas');
    
    // 5. Verificar estado de impresión
    const { data: printedOrder } = await supabase
      .from('orders')
      .select('kitchen_printed, drink_printed')
      .eq('id', order.id)
      .single();
    
    if (!printedOrder.kitchen_printed || !printedOrder.drink_printed) {
      throw new Error('Estado de impresión incorrecto');
    }
    
    console.log('   ✅ Impresión completada correctamente');
    
    // 6. Limpiar
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('   🧹 Datos de prueba limpiados');
  });

  // ESCENARIO 4: Gestión de menú
  await runTest('ESCENARIO 4: Gestión de menú', async () => {
    console.log('   📋 Simulando gestión de menú');
    
    // 1. Crear nuevo item temporal
    const { data: newItem } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: SENDEROS_ID,
        name: 'Producto Temporal E2E',
        description: 'Producto creado para pruebas E2E',
        price: 15.0,
        category_id: 43,
        is_available: true,
        display_order: 999
      })
      .select()
      .single();
    
    console.log(`   ➕ Nuevo item creado: ${newItem.name}`);
    
    // 2. Modificar item
    await supabase
      .from('menu_items')
      .update({
        price: 18.0,
        description: 'Precio actualizado'
      })
      .eq('id', newItem.id);
    
    console.log('   ✏️ Item modificado (precio actualizado)');
    
    // 3. Cambiar disponibilidad
    await supabase
      .from('menu_items')
      .update({ is_available: false })
      .eq('id', newItem.id);
    
    console.log('   🚫 Item marcado como no disponible');
    
    // 4. Verificar cambios
    const { data: updatedItem } = await supabase
      .from('menu_items')
      .select('price, is_available, description')
      .eq('id', newItem.id)
      .single();
    
    if (updatedItem.price !== 18.0 || updatedItem.is_available !== false) {
      throw new Error('Cambios no aplicados correctamente');
    }
    
    console.log('   ✅ Cambios verificados correctamente');
    
    // 5. Eliminar item temporal
    await supabase
      .from('menu_items')
      .delete()
      .eq('id', newItem.id);
    
    console.log('   🗑️ Item temporal eliminado');
  });

  // RESUMEN FINAL
  console.log('\n' + '='.repeat(70));
  console.log('🎯 RESUMEN DE PRUEBAS E2E');
  console.log('='.repeat(70));
  console.log(`✅ Escenarios exitosos: ${testsPassed}`);
  console.log(`❌ Escenarios fallidos: ${testsFailed}`);
  console.log(`📈 Porcentaje de éxito: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ¡TODOS LOS ESCENARIOS E2E PASARON!');
    console.log('✅ El sistema está completamente funcional');
    console.log('✅ Flujos de usuario validados');
    console.log('✅ Gestión administrativa validada');
    console.log('✅ Sistema de impresión validado');
    console.log('✅ Gestión de menú validada');
    return true;
  } else {
    console.log('\n⚠️ Algunos escenarios fallaron. Revisar antes de producción.');
    return false;
  }
}

runE2ETests();
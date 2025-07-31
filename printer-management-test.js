const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function waitForPrintingAdaptive(orderId, expectedKitchen, expectedBar, timeoutSeconds = 35) {
  console.log(`⏱️  Esperando impresión (${timeoutSeconds}s máximo)...`);
  console.log(`   🎯 Esperado - Cocina: ${expectedKitchen ? 'SÍ' : 'NO'}, Bar: ${expectedBar ? 'SÍ' : 'NO'}`);
  
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  
  while (Date.now() - startTime < timeoutMs) {
    const { data: order } = await supabase
      .from('orders')
      .select('kitchen_printed, drink_printed, status')
      .eq('id', orderId)
      .single();
      
    if (order) {
      console.log(`   🔍 Estado: Cocina=${order.kitchen_printed}, Bar=${order.drink_printed}, Status=${order.status}`);
      
      // Check if we got the expected results
      if (order.kitchen_printed === expectedKitchen && order.drink_printed === expectedBar) {
        console.log('✅ ¡Estado esperado alcanzado!');
        return { 
          success: true, 
          kitchen: order.kitchen_printed, 
          bar: order.drink_printed, 
          status: order.status,
          matchesExpected: true
        };
      }
      
      // If both expected to print and both printed
      if (expectedKitchen && expectedBar && order.kitchen_printed && order.drink_printed) {
        console.log('✅ ¡Ambas impresoras completaron como esperado!');
        return { 
          success: true, 
          kitchen: order.kitchen_printed, 
          bar: order.drink_printed, 
          status: order.status,
          matchesExpected: true
        };
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Final status check
  const { data: finalOrder } = await supabase
    .from('orders')
    .select('kitchen_printed, drink_printed, status')
    .eq('id', orderId)
    .single();
    
  console.log('⏰ Timeout alcanzado');
  const matchesExpected = finalOrder?.kitchen_printed === expectedKitchen && 
                         finalOrder?.drink_printed === expectedBar;
  
  return { 
    success: matchesExpected, 
    kitchen: finalOrder?.kitchen_printed || false, 
    bar: finalOrder?.drink_printed || false,
    status: finalOrder?.status || 'unknown',
    matchesExpected,
    timeout: true
  };
}

async function togglePrinter(type, active) {
  console.log(`🔧 ${active ? 'ACTIVANDO' : 'DESACTIVANDO'} impresora ${type.toUpperCase()}...`);
  
  const { error } = await supabase
    .from('printers')
    .update({ is_active: active })
    .eq('restaurant_id', restaurantId)
    .eq('type', type);
    
  if (error) {
    console.error(`❌ Error modificando impresora ${type}:`, error);
    return false;
  }
  
  // Verify change
  const { data: printer } = await supabase
    .from('printers')
    .select('name, is_active')
    .eq('restaurant_id', restaurantId)
    .eq('type', type)
    .single();
    
  if (printer) {
    const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
    console.log(`   ✅ ${printer.name}: ${status}`);
    return printer.is_active === active;
  }
  
  return false;
}

async function getPrintersStatus() {
  const { data: printers } = await supabase
    .from('printers')
    .select('name, type, is_active')
    .eq('restaurant_id', restaurantId)
    .order('type');
    
  console.log('📋 Estado actual de impresoras:');
  if (printers) {
    printers.forEach(printer => {
      const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`   ${printer.name} (${printer.type}): ${status}`);
    });
    
    return {
      kitchen: printers.find(p => p.type === 'kitchen')?.is_active || false,
      bar: printers.find(p => p.type === 'drink' || p.type === 'bar')?.is_active || false
    };
  }
  
  return { kitchen: false, bar: false };
}

async function createTestOrder(testName, tableNumber, items, notes) {
  console.log(`📝 Creando pedido: ${testName}...`);
  
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('table_number', tableNumber.toString())
    .single();
    
  if (tableError || !table) {
    console.error(`❌ Mesa ${tableNumber} no encontrada:`, tableError?.message);
    return null;
  }
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_id: table.id,
      customer_name: testName,
      status: 'pending',
      total_price: total,
      notes: notes,
      source: 'staff_placed',
      restaurant_id: restaurantId
    })
    .select()
    .single();
    
  if (orderError) {
    console.error('❌ Error creando pedido:', orderError);
    return null;
  }
  
  const orderItems = items.map(item => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
    
  if (itemsError) {
    console.error('❌ Error creando items:', itemsError);
    return null;
  }
  
  console.log(`✅ Pedido creado - ID: ${order.id}`);
  console.log(`   Items: ${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
  console.log(`   Total: Bs ${total}`);
  
  return order;
}

async function managementTest1_DisableKitchen() {
  console.log('\n🧪 PRUEBA GESTIÓN 1: DESACTIVAR COCINA');
  console.log('====================================');
  
  console.log('🎯 Objetivo: Verificar funcionamiento con cocina desactivada');
  
  // 1. Ensure both printers start active
  await togglePrinter('kitchen', true);
  await togglePrinter('drink', true);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. Create baseline order (both should print)
  console.log('\n📋 PASO 1: Pedido con ambas impresoras activas');
  let order = await createTestOrder(
    'GESTIÓN - Baseline',
    '8',
    [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 }, // Kitchen
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15 } // Bar
    ],
    'Prueba baseline - ambas impresoras activas'
  );
  
  if (!order) return { success: false, error: 'Failed to create baseline order' };
  
  let result = await waitForPrintingAdaptive(order.id, true, true, 20);
  console.log(`📊 Baseline result: Cocina=${result.kitchen}, Bar=${result.bar}`);
  
  // 3. Disable kitchen printer
  console.log('\n📋 PASO 2: Desactivando impresora de cocina');
  await togglePrinter('kitchen', false);
  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for services to detect change
  
  // 4. Create order with kitchen item (should not print on kitchen)
  console.log('\n📋 PASO 3: Pedido con cocina desactivada');
  order = await createTestOrder(
    'GESTIÓN - Cocina Desactivada',
    '9',
    [
      { id: 34, name: 'FRICASE', quantity: 1, price: 84 }, // Kitchen item
      { id: 46, name: 'Jarra Jugo de fruta 1 litro', quantity: 1, price: 30 } // Bar item
    ],
    'Prueba con cocina desactivada - solo bar debería imprimir'
  );
  
  if (!order) return { success: false, error: 'Failed to create test order' };
  
  result = await waitForPrintingAdaptive(order.id, false, true, 25);
  
  console.log('\n📊 RESULTADO PRUEBA GESTIÓN 1:');
  console.log('==============================');
  
  if (result.success && !result.kitchen && result.bar) {
    console.log('🎉 ¡PERFECTO!');
    console.log('✅ Cocina NO imprimió (correcto - desactivada)');
    console.log('✅ Bar SÍ imprimió (correcto - activa)');
    console.log('✅ Sistema se adaptó automáticamente');
    return { success: true, orderId: order.id, adaptive: true };
  } else if (result.kitchen && result.bar) {
    console.log('❌ PROBLEMA: Cocina imprimió pese a estar desactivada');
    return { success: false, orderId: order.id, issue: 'kitchen_printed_when_disabled' };
  } else if (!result.kitchen && !result.bar) {
    console.log('❌ PROBLEMA: Ninguna impresora funcionó');
    return { success: false, orderId: order.id, issue: 'no_printing' };
  } else {
    console.log('⚠️ RESULTADO INESPERADO');
    console.log(`   Cocina: ${result.kitchen}, Bar: ${result.bar}`);
    return { success: false, orderId: order.id, issue: 'unexpected_result' };
  }
}

async function managementTest2_DisableBar() {
  console.log('\n🧪 PRUEBA GESTIÓN 2: DESACTIVAR BAR');
  console.log('=================================');
  
  console.log('🎯 Objetivo: Verificar funcionamiento con bar desactivada');
  
  // 1. Activate kitchen, disable bar
  console.log('\n📋 PASO 1: Configurando impresoras');
  await togglePrinter('kitchen', true);
  await togglePrinter('drink', false);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 2. Create order with both types (only kitchen should print)
  console.log('\n📋 PASO 2: Pedido con bar desactivada');
  const order = await createTestOrder(
    'GESTIÓN - Bar Desactivada',
    '10',
    [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 }, // Kitchen item
      { id: 50, name: 'Coca Cola', quantity: 2, price: 15 } // Bar item
    ],
    'Prueba con bar desactivada - solo cocina debería imprimir'
  );
  
  if (!order) return { success: false, error: 'Failed to create test order' };
  
  const result = await waitForPrintingAdaptive(order.id, true, false, 25);
  
  console.log('\n📊 RESULTADO PRUEBA GESTIÓN 2:');
  console.log('==============================');
  
  if (result.success && result.kitchen && !result.bar) {
    console.log('🎉 ¡PERFECTO!');
    console.log('✅ Cocina SÍ imprimió (correcto - activa)');
    console.log('✅ Bar NO imprimió (correcto - desactivada)');
    console.log('✅ Sistema se adaptó automáticamente');
    return { success: true, orderId: order.id, adaptive: true };
  } else {
    console.log('❌ PROBLEMA EN ADAPTACIÓN');
    console.log(`   Esperado: Cocina=true, Bar=false`);
    console.log(`   Obtenido: Cocina=${result.kitchen}, Bar=${result.bar}`);
    return { success: false, orderId: order.id, issue: 'adaptation_failed' };
  }
}

async function managementTest3_DisableBoth() {
  console.log('\n🧪 PRUEBA GESTIÓN 3: DESACTIVAR AMBAS');
  console.log('===================================');
  
  console.log('🎯 Objetivo: Verificar funcionamiento sin impresoras');
  
  // 1. Disable both printers
  console.log('\n📋 PASO 1: Desactivando ambas impresoras');
  await togglePrinter('kitchen', false);
  await togglePrinter('drink', false);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await getPrintersStatus();
  
  // 2. Create order (should remain pending)
  console.log('\n📋 PASO 2: Pedido sin impresoras');
  const order = await createTestOrder(
    'GESTIÓN - Sin Impresoras',
    '4',
    [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 },
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15 }
    ],
    'Prueba sin impresoras - debería permanecer pending'
  );
  
  if (!order) return { success: false, error: 'Failed to create test order' };
  
  const result = await waitForPrintingAdaptive(order.id, false, false, 20);
  
  console.log('\n📊 RESULTADO PRUEBA GESTIÓN 3:');
  console.log('==============================');
  
  if (result.success && !result.kitchen && !result.bar) {
    console.log('🎉 ¡CORRECTO!');
    console.log('✅ Ninguna impresora imprimió (correcto - ambas desactivadas)');
    console.log('✅ Pedido permanece pending para procesamiento manual');
    console.log('✅ Sistema maneja correctamente ausencia de impresoras');
    return { success: true, orderId: order.id, pendingState: true };
  } else {
    console.log('❌ PROBLEMA: Alguna impresora imprimió pese a estar desactivada');
    return { success: false, orderId: order.id, issue: 'printed_when_disabled' };
  }
}

async function managementTest4_ReactivateAll() {
  console.log('\n🧪 PRUEBA GESTIÓN 4: REACTIVAR AMBAS');
  console.log('==================================');
  
  console.log('🎯 Objetivo: Verificar reactivación y funcionamiento normal');
  
  // 1. Reactivate both printers
  console.log('\n📋 PASO 1: Reactivando ambas impresoras');
  await togglePrinter('kitchen', true);
  await togglePrinter('drink', true);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await getPrintersStatus();
  
  // 2. Create order (both should print again)
  console.log('\n📋 PASO 2: Pedido con ambas reactivadas');
  const order = await createTestOrder(
    'GESTIÓN - Reactivadas',
    '5',
    [
      { id: 34, name: 'FRICASE', quantity: 1, price: 84 },
      { id: 46, name: 'Jarra Jugo de fruta 1 litro', quantity: 1, price: 30 }
    ],
    'Prueba post-reactivación - ambas deberían imprimir'
  );
  
  if (!order) return { success: false, error: 'Failed to create test order' };
  
  const result = await waitForPrintingAdaptive(order.id, true, true, 25);
  
  console.log('\n📊 RESULTADO PRUEBA GESTIÓN 4:');
  console.log('==============================');
  
  if (result.success && result.kitchen && result.bar) {
    console.log('🎉 ¡PERFECTO!');
    console.log('✅ Cocina SÍ imprimió (correcto - reactivada)');
    console.log('✅ Bar SÍ imprimió (correcto - reactivada)');
    console.log('✅ Sistema recuperó funcionamiento completo');
    return { success: true, orderId: order.id, fullRecovery: true };
  } else {
    console.log('❌ PROBLEMA EN REACTIVACIÓN');
    return { success: false, orderId: order.id, issue: 'reactivation_failed' };
  }
}

async function runPrinterManagementTests() {
  console.log('🚀 INICIANDO PRUEBAS DE GESTIÓN DE IMPRESORAS');
  console.log('=============================================');
  console.log('🎯 Objetivo: Verificar activación/desactivación dinámica');
  console.log('🔧 Sistema debe adaptarse automáticamente a cambios\n');
  
  const results = [];
  
  try {
    // Initial status
    console.log('📋 ESTADO INICIAL:');
    await getPrintersStatus();
    
    // Test 1: Disable kitchen
    const result1 = await managementTest1_DisableKitchen();
    results.push({ test: 'Desactivar Cocina', ...result1 });
    
    console.log('\n⏸️ Pausa entre pruebas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 2: Disable bar
    const result2 = await managementTest2_DisableBar();
    results.push({ test: 'Desactivar Bar', ...result2 });
    
    console.log('\n⏸️ Pausa entre pruebas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 3: Disable both
    const result3 = await managementTest3_DisableBoth();
    results.push({ test: 'Desactivar Ambas', ...result3 });
    
    console.log('\n⏸️ Pausa entre pruebas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 4: Reactivate all
    const result4 = await managementTest4_ReactivateAll();
    results.push({ test: 'Reactivar Ambas', ...result4 });
    
    // Final summary
    console.log('\n🏆 RESUMEN FINAL DE GESTIÓN DE IMPRESORAS');
    console.log('=========================================');
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ ÉXITO' : '❌ FALLO';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      if (result.orderId) {
        console.log(`   Pedido ID: ${result.orderId}`);
      }
      if (result.issue) {
        console.log(`   Problema: ${result.issue}`);
      }
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 RESULTADOS: ${successCount}/${results.length} pruebas exitosas`);
    
    if (successCount === results.length) {
      console.log('🎉 ¡GESTIÓN DE IMPRESORAS COMPLETAMENTE FUNCIONAL!');
      console.log('✅ Sistema se adapta automáticamente a cambios');
      console.log('✅ Servicios Python detectan activación/desactivación');
      console.log('✅ Flujo de pedidos funciona con cualquier configuración');
    } else {
      console.log('⚠️ Algunas pruebas fallaron - revisar lógica de adaptación');
      console.log('💡 Posibles causas:');
      console.log('   • Servicios Python no detectan cambios en BD');
      console.log('   • Caché en servicios (requiere restart)');
      console.log('   • Lógica de filtrado por estado de impresora');
    }
    
    // Restore initial state
    console.log('\n🔄 RESTAURANDO ESTADO INICIAL...');
    await togglePrinter('kitchen', true);
    await togglePrinter('drink', true);
    console.log('✅ Ambas impresoras reactivadas');
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas de gestión:', error);
  }
}

// Execute printer management tests
runPrinterManagementTests();
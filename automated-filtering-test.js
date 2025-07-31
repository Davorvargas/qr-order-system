const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

// Configuración de categorías (debe coincidir con los servicios Python)
const KITCHEN_CATEGORIES = [4, 5, 6, 7, 8, 14, 15, 16, 17];
const BAR_CATEGORIES = [9, 10, 11, 12, 13];

async function ensurePrintersActive() {
  console.log('🔧 ASEGURANDO QUE AMBAS IMPRESORAS ESTÉN ACTIVAS...');
  
  const { error } = await supabase
    .from('printers')
    .update({ is_active: true })
    .eq('restaurant_id', restaurantId);
    
  if (error) {
    console.error('❌ Error activando impresoras:', error);
    return false;
  }
  
  const { data: printers } = await supabase
    .from('printers')
    .select('name, type, is_active')
    .eq('restaurant_id', restaurantId);
    
  console.log('📋 Estado de impresoras:');
  printers?.forEach(printer => {
    const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
    console.log(`   ${printer.name} (${printer.type}): ${status}`);
  });
  
  return true;
}

async function createTestOrder(orderData) {
  const { data: table } = await supabase
    .from('tables')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('table_number', orderData.table.toString())
    .single();
    
  if (!table) {
    throw new Error(`Mesa ${orderData.table} no encontrada`);
  }
  
  const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_id: table.id,
      customer_name: orderData.name,
      status: 'pending',
      total_price: total,
      notes: orderData.description,
      source: 'staff_placed',
      restaurant_id: restaurantId
    })
    .select()
    .single();
    
  if (orderError) {
    throw new Error(`Error creando pedido: ${orderError.message}`);
  }
  
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
    
  if (itemsError) {
    throw new Error(`Error creando items: ${itemsError.message}`);
  }
  
  return order.id;
}

async function waitAndMonitorOrder(orderId, testName, expectedKitchen, expectedBar, timeoutSeconds = 30) {
  console.log(`\n⏱️  MONITOREANDO: ${testName}`);
  console.log(`   🎯 Esperado: Cocina=${expectedKitchen}, Bar=${expectedBar}`);
  console.log(`   ⏰ Timeout: ${timeoutSeconds}s`);
  
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  let lastState = { kitchen: false, bar: false };
  let changes = [];
  
  while (Date.now() - startTime < timeoutMs) {
    const { data: order } = await supabase
      .from('orders')
      .select('kitchen_printed, drink_printed, status')
      .eq('id', orderId)
      .single();
      
    if (order) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Detectar cambios
      if (order.kitchen_printed !== lastState.kitchen || order.drink_printed !== lastState.bar) {
        const change = {
          time: elapsed,
          kitchen: order.kitchen_printed,
          bar: order.drink_printed,
          status: order.status
        };
        changes.push(change);
        
        console.log(`   [${elapsed}s] 🔄 Cambio: Cocina=${order.kitchen_printed}, Bar=${order.drink_printed}, Estado=${order.status}`);
        
        lastState = { kitchen: order.kitchen_printed, bar: order.drink_printed };
        
        // Verificar si llegamos al estado esperado
        if (order.kitchen_printed === expectedKitchen && order.drink_printed === expectedBar) {
          console.log(`   ✅ Estado esperado alcanzado en ${elapsed}s`);
          return {
            success: true,
            kitchen: order.kitchen_printed,
            bar: order.drink_printed,
            status: order.status,
            timeElapsed: elapsed,
            changes
          };
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Timeout alcanzado
  const { data: finalOrder } = await supabase
    .from('orders')
    .select('kitchen_printed, drink_printed, status')
    .eq('id', orderId)
    .single();
    
  console.log(`   ⏰ Timeout alcanzado - Estado final: Cocina=${finalOrder.kitchen_printed}, Bar=${finalOrder.drink_printed}`);
  
  return {
    success: finalOrder.kitchen_printed === expectedKitchen && finalOrder.drink_printed === expectedBar,
    kitchen: finalOrder.kitchen_printed,
    bar: finalOrder.drink_printed,
    status: finalOrder.status,
    timeElapsed: timeoutSeconds,
    changes,
    timeout: true
  };
}

async function testKitchenOnlyFiltering() {
  console.log('\n🧪 TEST 1: FILTRADO SOLO COCINA');
  console.log('==============================');
  
  const orderData = {
    name: 'FILTRADO TEST - Solo Cocina',
    table: 1,
    description: 'Test de filtrado: solo items de cocina',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93, category: 'Carne de Res' },
      { id: 34, name: 'FRICASE', quantity: 1, price: 84, category: 'Carne de Cerdo' }
    ]
  };
  
  console.log('📝 Creando pedido solo con items de cocina...');
  console.log(`   Items: ${orderData.items.map(i => i.name).join(', ')}`);
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    
    const result = await waitAndMonitorOrder(orderId, 'Solo Cocina', true, false, 25);
    
    return {
      testName: 'Solo Cocina',
      orderId,
      expected: { kitchen: true, bar: false },
      actual: { kitchen: result.kitchen, bar: result.bar },
      success: result.success,
      timeElapsed: result.timeElapsed,
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ Error en test de solo cocina: ${error.message}`);
    return {
      testName: 'Solo Cocina',
      success: false,
      error: error.message
    };
  }
}

async function testBarOnlyFiltering() {
  console.log('\n🧪 TEST 2: FILTRADO SOLO BAR');
  console.log('============================');
  
  const orderData = {
    name: 'FILTRADO TEST - Solo Bar',
    table: 2,
    description: 'Test de filtrado: solo items de bar',
    items: [
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15, category: 'Gaseosas' },
      { id: 46, name: 'Jarra Jugo de fruta', quantity: 1, price: 30, category: 'Jugos' }
    ]
  };
  
  console.log('📝 Creando pedido solo con items de bar...');
  console.log(`   Items: ${orderData.items.map(i => i.name).join(', ')}`);
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    
    const result = await waitAndMonitorOrder(orderId, 'Solo Bar', false, true, 25);
    
    return {
      testName: 'Solo Bar',
      orderId,
      expected: { kitchen: false, bar: true },
      actual: { kitchen: result.kitchen, bar: result.bar },
      success: result.success,
      timeElapsed: result.timeElapsed,
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ Error en test de solo bar: ${error.message}`);
    return {
      testName: 'Solo Bar',
      success: false,
      error: error.message
    };
  }
}

async function testMixedFiltering() {
  console.log('\n🧪 TEST 3: FILTRADO MIXTO');
  console.log('=========================');
  
  const orderData = {
    name: 'FILTRADO TEST - Mixto',
    table: 3,
    description: 'Test de filtrado: items de cocina y bar',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93, category: 'Carne de Res' },
      { id: 50, name: 'Coca Cola', quantity: 2, price: 15, category: 'Gaseosas' }
    ]
  };
  
  console.log('📝 Creando pedido mixto (cocina + bar)...');
  console.log(`   Items: ${orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    
    const result = await waitAndMonitorOrder(orderId, 'Mixto', true, true, 30);
    
    return {
      testName: 'Mixto',
      orderId,
      expected: { kitchen: true, bar: true },
      actual: { kitchen: result.kitchen, bar: result.bar },
      success: result.success,
      timeElapsed: result.timeElapsed,
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ Error en test mixto: ${error.message}`);
    return {
      testName: 'Mixto',
      success: false,
      error: error.message
    };
  }
}

async function testPrinterDeactivation() {
  console.log('\n🧪 TEST 4: DESACTIVACIÓN DE IMPRESORAS');
  console.log('=====================================');
  
  console.log('🔧 Desactivando impresora de cocina...');
  await supabase
    .from('printers')
    .update({ is_active: false })
    .eq('restaurant_id', restaurantId)
    .eq('type', 'kitchen');
  
  // Wait for services to detect change
  console.log('⏸️  Esperando 5s para que servicios detecten el cambio...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const orderData = {
    name: 'FILTRADO TEST - Cocina Desactivada',
    table: 4,
    description: 'Test con cocina desactivada',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93, category: 'Carne de Res' },
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15, category: 'Gaseosas' }
    ]
  };
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    console.log('🎯 Esperado: Solo bar debería imprimir (cocina desactivada)');
    
    const result = await waitAndMonitorOrder(orderId, 'Cocina Desactivada', false, true, 25);
    
    // Reactivar cocina para siguiente test
    console.log('🔧 Reactivando impresora de cocina...');
    await supabase
      .from('printers')
      .update({ is_active: true })
      .eq('restaurant_id', restaurantId)
      .eq('type', 'kitchen');
    
    return {
      testName: 'Cocina Desactivada',
      orderId,
      expected: { kitchen: false, bar: true },
      actual: { kitchen: result.kitchen, bar: result.bar },
      success: result.success,
      timeElapsed: result.timeElapsed,
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ Error en test de desactivación: ${error.message}`);
    return {
      testName: 'Cocina Desactivada',
      success: false,
      error: error.message
    };
  }
}

async function runAutomatedFilteringTests() {
  console.log('🤖 INICIANDO PRUEBAS AUTOMATIZADAS DE FILTRADO');
  console.log('===============================================');
  console.log('🎯 Objetivo: Verificar filtrado correcto después de implementar cambios');
  console.log('📋 Se ejecutarán 4 tests de filtrado\n');
  
  // Ensure printers are active initially
  const printersReady = await ensurePrintersActive();
  if (!printersReady) {
    console.error('❌ No se pudieron activar las impresoras');
    return;
  }
  
  console.log('⏸️  Pausa de 3s para estabilización...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = [];
  
  try {
    // Test 1: Kitchen only
    const result1 = await testKitchenOnlyFiltering();
    results.push(result1);
    
    console.log('\n⏸️  Pausa entre tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 2: Bar only  
    const result2 = await testBarOnlyFiltering();
    results.push(result2);
    
    console.log('\n⏸️  Pausa entre tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 3: Mixed
    const result3 = await testMixedFiltering();
    results.push(result3);
    
    console.log('\n⏸️  Pausa entre tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 4: Deactivation
    const result4 = await testPrinterDeactivation();
    results.push(result4);
    
    // Generate final report
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE FINAL DE PRUEBAS AUTOMATIZADAS');
    console.log('=========================================');
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ ÉXITO' : '❌ FALLO';
      console.log(`\n${index + 1}. ${result.testName}: ${status}`);
      
      if (result.orderId) {
        console.log(`   Pedido ID: ${result.orderId}`);
      }
      
      if (result.expected && result.actual) {
        console.log(`   Esperado: Cocina=${result.expected.kitchen}, Bar=${result.expected.bar}`);
        console.log(`   Obtenido: Cocina=${result.actual.kitchen}, Bar=${result.actual.bar}`);
        
        if (result.timeElapsed) {
          console.log(`   Tiempo: ${result.timeElapsed}s`);
        }
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.changes && result.changes.length > 0) {
        console.log(`   Cambios detectados: ${result.changes.length}`);
        result.changes.forEach(change => {
          console.log(`     [${change.time}s] Cocina=${change.kitchen}, Bar=${change.bar}`);
        });
      }
    });
    
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    console.log(`\n🏆 RESULTADOS FINALES:`);
    console.log(`   Exitosas: ${successCount}/${totalTests}`);
    console.log(`   Porcentaje: ${Math.round((successCount/totalTests)*100)}%`);
    
    if (successCount === totalTests) {
      console.log('\n🎉 ¡FILTRADO COMPLETAMENTE FUNCIONAL!');
      console.log('✅ Los servicios Python respetan categorías');
      console.log('✅ Los servicios Python respetan estado is_active');
      console.log('✅ Sistema de impresión distribuido optimizado');
    } else {
      console.log('\n⚠️  FILTRADO PARCIALMENTE FUNCIONAL');
      console.log('💡 Revisar implementación de servicios Python');
      
      const failedTests = results.filter(r => !r.success);
      console.log('\n🔧 Tests fallidos:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}`);
        if (test.actual && test.expected) {
          console.log(`     - Esperado: Cocina=${test.expected.kitchen}, Bar=${test.expected.bar}`);
          console.log(`     - Obtenido: Cocina=${test.actual.kitchen}, Bar=${test.actual.bar}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas automatizadas:', error);
  }
}

// Execute automated tests
runAutomatedFilteringTests();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

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
      notes: orderData.notes,
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

async function waitForPrinting(orderId, testName, timeoutSeconds = 30) {
  console.log(`⏱️  MONITOREANDO: ${testName}`);
  console.log(`   🎯 Esperando: kitchen_printed = true`);
  console.log(`   ⏰ Timeout: ${timeoutSeconds}s`);
  
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  let lastPrinted = false;
  
  while (Date.now() - startTime < timeoutMs) {
    const { data: order } = await supabase
      .from('orders')
      .select('kitchen_printed, status')
      .eq('id', orderId)
      .single();
      
    if (order) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Detectar cambio
      if (order.kitchen_printed !== lastPrinted) {
        console.log(`   [${elapsed}s] 🔄 CAMBIO: kitchen_printed=${order.kitchen_printed}, status=${order.status}`);
        lastPrinted = order.kitchen_printed;
        
        // Si se imprimió, éxito
        if (order.kitchen_printed) {
          console.log(`   ✅ ¡Impresión completada en ${elapsed}s!`);
          return {
            success: true,
            printed: true,
            status: order.status,
            timeElapsed: elapsed
          };
        }
      } else {
        console.log(`   [${elapsed}s] ⏳ Esperando... (kitchen_printed=${order.kitchen_printed})`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Timeout
  const { data: finalOrder } = await supabase
    .from('orders')
    .select('kitchen_printed, status')
    .eq('id', orderId)
    .single();
    
  console.log(`   ⏰ Timeout - Estado final: kitchen_printed=${finalOrder.kitchen_printed}`);
  
  return {
    success: finalOrder.kitchen_printed,
    printed: finalOrder.kitchen_printed,
    status: finalOrder.status,
    timeElapsed: timeoutSeconds,
    timeout: true
  };
}

async function testBasicPrinting() {
  console.log('🧪 TEST 1: IMPRESIÓN BÁSICA');
  console.log('============================');
  
  const orderData = {
    name: 'PRUEBA - Impresión Básica',
    table: 1,
    notes: 'Test de impresión básica con una sola impresora',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 },
      { id: 50, name: 'Coca Cola', quantity: 2, price: 15 }
    ]
  };
  
  console.log('📝 Creando pedido de prueba...');
  console.log(`   Items: ${orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    
    const result = await waitForPrinting(orderId, 'Impresión Básica', 25);
    
    return {
      testName: 'Impresión Básica',
      orderId,
      success: result.success,
      printed: result.printed,
      timeElapsed: result.timeElapsed,
      timeout: result.timeout
    };
  } catch (error) {
    console.error(`❌ Error en test básico: ${error.message}`);
    return {
      testName: 'Impresión Básica',
      success: false,
      error: error.message
    };
  }
}

async function testPrinterDeactivation() {
  console.log('\n🧪 TEST 2: IMPRESORA DESACTIVADA');
  console.log('=================================');
  
  console.log('🔧 Desactivando impresora...');
  await supabase
    .from('printers')
    .update({ is_active: false })
    .eq('restaurant_id', restaurantId)
    .eq('type', 'kitchen');
  
  console.log('⏸️  Esperando 5s para que el servicio detecte el cambio...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const orderData = {
    name: 'PRUEBA - Impresora Desactivada',
    table: 2,
    notes: 'Test con impresora desactivada - no debería imprimir',
    items: [
      { id: 34, name: 'FRICASE', quantity: 1, price: 84 }
    ]
  };
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    console.log('🎯 Esperado: NO debería imprimir (impresora desactivada)');
    
    const result = await waitForPrinting(orderId, 'Impresora Desactivada', 20);
    
    // Reactivar impresora
    console.log('\n🔧 Reactivando impresora...');
    await supabase
      .from('printers')
      .update({ is_active: true })
      .eq('restaurant_id', restaurantId)
      .eq('type', 'kitchen');
    
    return {
      testName: 'Impresora Desactivada',
      orderId,
      success: !result.printed, // Éxito si NO imprimió
      printed: result.printed,
      timeElapsed: result.timeElapsed,
      expectedNoPrint: true
    };
  } catch (error) {
    console.error(`❌ Error en test de desactivación: ${error.message}`);
    return {
      testName: 'Impresora Desactivada',
      success: false,
      error: error.message
    };
  }
}

async function testReactivation() {
  console.log('\n🧪 TEST 3: REACTIVACIÓN');
  console.log('=======================');
  
  console.log('⏸️  Esperando 3s para estabilización...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const orderData = {
    name: 'PRUEBA - Reactivación',
    table: 3,
    notes: 'Test después de reactivar impresora',
    items: [
      { id: 46, name: 'Jarra Jugo de fruta', quantity: 1, price: 30 }
    ]
  };
  
  console.log('📝 Creando pedido después de reactivación...');
  
  try {
    const orderId = await createTestOrder(orderData);
    console.log(`✅ Pedido creado - ID: ${orderId}`);
    console.log('🎯 Esperado: SÍ debería imprimir (impresora reactivada)');
    
    const result = await waitForPrinting(orderId, 'Reactivación', 25);
    
    return {
      testName: 'Reactivación',
      orderId,
      success: result.success,
      printed: result.printed,
      timeElapsed: result.timeElapsed
    };
  } catch (error) {
    console.error(`❌ Error en test de reactivación: ${error.message}`);
    return {
      testName: 'Reactivación',
      success: false,
      error: error.message
    };
  }
}

async function testMultipleOrders() {
  console.log('\n🧪 TEST 4: MÚLTIPLES PEDIDOS');
  console.log('=============================');
  
  const orders = [
    {
      name: 'PRUEBA - Multi 1',
      table: 4,
      notes: 'Primer pedido de prueba múltiple',
      items: [{ id: 39, name: 'CHARQUE', quantity: 1, price: 93 }]
    },
    {
      name: 'PRUEBA - Multi 2',
      table: 5,
      notes: 'Segundo pedido de prueba múltiple',
      items: [{ id: 50, name: 'Coca Cola', quantity: 1, price: 15 }]
    }
  ];
  
  console.log('📝 Creando múltiples pedidos...');
  
  try {
    const orderIds = [];
    
    // Crear pedidos
    for (const orderData of orders) {
      const orderId = await createTestOrder(orderData);
      orderIds.push(orderId);
      console.log(`✅ Pedido creado - ID: ${orderId} (${orderData.name})`);
    }
    
    console.log('\n⏱️  Monitoreando impresión de múltiples pedidos...');
    
    // Monitorear ambos pedidos
    const results = [];
    for (let i = 0; i < orderIds.length; i++) {
      const result = await waitForPrinting(orderIds[i], `Multi ${i + 1}`, 20);
      results.push(result);
    }
    
    const allPrinted = results.every(r => r.success);
    
    return {
      testName: 'Múltiples Pedidos',
      orderIds,
      success: allPrinted,
      results,
      totalOrders: orderIds.length,
      printedOrders: results.filter(r => r.success).length
    };
  } catch (error) {
    console.error(`❌ Error en test múltiple: ${error.message}`);
    return {
      testName: 'Múltiples Pedidos',
      success: false,
      error: error.message
    };
  }
}

async function runSinglePrinterTests() {
  console.log('🤖 INICIANDO PRUEBAS DE IMPRESORA ÚNICA');
  console.log('=======================================');
  console.log('🖨️  Sistema: Star Micronics BSC10 (Raspberry Pi)');
  console.log('🎯 Objetivo: Verificar funcionamiento simplificado\n');
  
  // Verificar configuración
  const { data: printer } = await supabase
    .from('printers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .single();
  
  if (!printer) {
    console.error('❌ No se encontró impresora configurada');
    return;
  }
  
  console.log('📋 IMPRESORA CONFIGURADA:');
  console.log(`   ${printer.name} (${printer.type}): ${printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA'}`);
  
  if (!printer.is_active) {
    console.log('🔧 Activando impresora...');
    await supabase
      .from('printers')
      .update({ is_active: true })
      .eq('id', printer.id);
  }
  
  console.log('\n⏸️  Pausa inicial de 3s...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = [];
  
  try {
    // Test 1: Impresión básica
    const result1 = await testBasicPrinting();
    results.push(result1);
    
    console.log('\n⏸️  Pausa entre tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 2: Impresora desactivada
    const result2 = await testPrinterDeactivation();
    results.push(result2);
    
    console.log('\n⏸️  Pausa entre tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 3: Reactivación
    const result3 = await testReactivation();
    results.push(result3);
    
    console.log('\n⏸️  Pausa entre tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 4: Múltiples pedidos
    const result4 = await testMultipleOrders();
    results.push(result4);
    
    // Reporte final
    console.log('\n' + '='.repeat(50));
    console.log('📊 REPORTE FINAL - SISTEMA DE UNA IMPRESORA');
    console.log('===========================================');
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ ÉXITO' : '❌ FALLO';
      console.log(`\n${index + 1}. ${result.testName}: ${status}`);
      
      if (result.orderId) {
        console.log(`   Pedido ID: ${result.orderId}`);
      }
      
      if (result.orderIds) {
        console.log(`   Pedidos IDs: ${result.orderIds.join(', ')}`);
      }
      
      if (result.printed !== undefined) {
        console.log(`   Imprimió: ${result.printed ? 'SÍ' : 'NO'}`);
      }
      
      if (result.timeElapsed) {
        console.log(`   Tiempo: ${result.timeElapsed}s`);
      }
      
      if (result.expectedNoPrint) {
        console.log(`   Resultado esperado: NO imprimir`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.totalOrders) {
        console.log(`   Total pedidos: ${result.totalOrders}`);
        console.log(`   Impresos: ${result.printedOrders}`);
      }
    });
    
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    console.log(`\n🏆 RESULTADOS FINALES:`);
    console.log(`   Exitosas: ${successCount}/${totalTests}`);
    console.log(`   Porcentaje: ${Math.round((successCount/totalTests)*100)}%`);
    
    if (successCount === totalTests) {
      console.log('\n🎉 ¡SISTEMA DE IMPRESORA ÚNICA COMPLETAMENTE FUNCIONAL!');
      console.log('✅ Impresión básica: OK');
      console.log('✅ Respeta activación/desactivación: OK');
      console.log('✅ Reactivación: OK');
      console.log('✅ Múltiples pedidos: OK');
      console.log('🚀 Sistema listo para producción');
    } else {
      console.log('\n⚠️  SISTEMA PARCIALMENTE FUNCIONAL');
      console.log('💡 Revisar configuración del servicio Python');
      
      const failedTests = results.filter(r => !r.success);
      console.log('\n🔧 Tests fallidos:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error);
  }
}

// Ejecutar pruebas
runSinglePrinterTests();
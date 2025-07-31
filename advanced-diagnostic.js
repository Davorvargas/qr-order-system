const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function createDiagnosticOrder(testName, items, expectedBehavior) {
  console.log(`\n🧪 CREANDO PEDIDO DIAGNÓSTICO: ${testName}`);
  console.log('='.repeat(50));
  
  const { data: table } = await supabase
    .from('tables')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('table_number', '1')
    .single();
    
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const { data: order } = await supabase
    .from('orders')
    .insert({
      table_id: table.id,
      customer_name: testName,
      status: 'pending',
      total_price: total,
      notes: `DIAGNÓSTICO AVANZADO: ${expectedBehavior}`,
      source: 'staff_placed',
      restaurant_id: restaurantId
    })
    .select()
    .single();
  
  const orderItems = items.map(item => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price
  }));
  
  await supabase.from('order_items').insert(orderItems);
  
  console.log(`✅ Pedido creado - ID: ${order.id}`);
  console.log(`   Items: ${items.map(i => `${i.quantity}x ${i.name} (${i.type})`).join(', ')}`);
  console.log(`   Total: Bs ${total}`);
  console.log(`   Comportamiento esperado: ${expectedBehavior}`);
  
  return order.id;
}

async function monitorOrderBehavior(orderId, testName, timeoutSeconds = 30) {
  console.log(`\n⏱️  MONITOREANDO PEDIDO ${orderId} (${timeoutSeconds}s)...`);
  
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  const checkInterval = 2000; // 2 seconds
  
  let lastKitchen = false;
  let lastBar = false;
  let checkCount = 0;
  
  while (Date.now() - startTime < timeoutMs) {
    checkCount++;
    
    const { data: order } = await supabase
      .from('orders')
      .select('kitchen_printed, drink_printed, status, updated_at')
      .eq('id', orderId)
      .single();
      
    if (order) {
      const timeElapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Detect changes
      if (order.kitchen_printed !== lastKitchen || order.drink_printed !== lastBar) {
        const kitchenChange = order.kitchen_printed !== lastKitchen ? 
          (order.kitchen_printed ? '❌→✅' : '✅→❌') : '   ';
        const barChange = order.drink_printed !== lastBar ? 
          (order.drink_printed ? '❌→✅' : '✅→❌') : '   ';
          
        console.log(`   [${timeElapsed}s] CAMBIO DETECTADO!`);
        console.log(`      Cocina: ${kitchenChange} | Bar: ${barChange}`);
        console.log(`      Estado: ${order.status}`);
        
        lastKitchen = order.kitchen_printed;
        lastBar = order.drink_printed;
      } else {
        // No changes
        console.log(`   [${timeElapsed}s] Sin cambios: Cocina=${order.kitchen_printed}, Bar=${order.drink_printed}, Status=${order.status}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  // Final state
  const { data: finalOrder } = await supabase
    .from('orders')
    .select('kitchen_printed, drink_printed, status')
    .eq('id', orderId)
    .single();
    
  console.log(`\n📊 ESTADO FINAL DEL PEDIDO ${orderId}:`);
  console.log(`   Cocina: ${finalOrder.kitchen_printed ? '✅ IMPRIMIÓ' : '❌ NO IMPRIMIÓ'}`);
  console.log(`   Bar: ${finalOrder.drink_printed ? '✅ IMPRIMIÓ' : '❌ NO IMPRIMIÓ'}`);
  console.log(`   Estado: ${finalOrder.status}`);
  console.log(`   Verificaciones realizadas: ${checkCount}`);
  
  return {
    kitchen: finalOrder.kitchen_printed,
    bar: finalOrder.drink_printed,
    status: finalOrder.status,
    checks: checkCount
  };
}

async function runAdvancedDiagnostic() {
  console.log('🔬 DIAGNÓSTICO AVANZADO - COMPORTAMIENTO DE SERVICIOS');
  console.log('====================================================');
  
  // Get current printer status
  const { data: printers } = await supabase
    .from('printers')
    .select('name, type, is_active')
    .eq('restaurant_id', restaurantId);
    
  console.log('\n📋 ESTADO ACTUAL DE IMPRESORAS:');
  printers?.forEach(printer => {
    const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
    console.log(`   ${printer.name} (${printer.type}): ${status}`);
  });
  
  const kitchenActive = printers?.find(p => p.type === 'kitchen')?.is_active;
  const barActive = printers?.find(p => p.type === 'drink' || p.type === 'bar')?.is_active;
  
  console.log(`\n🎯 CONFIGURACIÓN PARA PRUEBAS:`);
  console.log(`   Cocina: ${kitchenActive ? 'ACTIVA' : 'INACTIVA'}`);
  console.log(`   Bar: ${barActive ? 'ACTIVA' : 'INACTIVA'}`);
  
  // Test 1: Pure kitchen item
  console.log('\n' + '='.repeat(60));
  console.log('🧪 PRUEBA 1: ITEM SOLO DE COCINA');
  
  const order1 = await createDiagnosticOrder(
    'DIAGNÓSTICO - Solo Cocina',
    [{ id: 39, name: 'CHARQUE', quantity: 1, price: 93, type: 'cocina' }],
    `Solo cocina debería imprimir (${kitchenActive ? 'ACTIVA' : 'INACTIVA'})`
  );
  
  const result1 = await monitorOrderBehavior(order1, 'Solo Cocina', 25);
  
  // Test 2: Pure bar item
  console.log('\n' + '='.repeat(60));
  console.log('🧪 PRUEBA 2: ITEM SOLO DE BAR');
  
  const order2 = await createDiagnosticOrder(
    'DIAGNÓSTICO - Solo Bar',
    [{ id: 50, name: 'Coca Cola', quantity: 1, price: 15, type: 'bar' }],
    `Solo bar debería imprimir (${barActive ? 'ACTIVA' : 'INACTIVA'})`
  );
  
  const result2 = await monitorOrderBehavior(order2, 'Solo Bar', 25);
  
  // Analysis
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ANÁLISIS DE RESULTADOS');
  console.log('=========================');
  
  console.log('\n📊 ITEM SOLO DE COCINA:');
  console.log(`   Cocina imprimió: ${result1.kitchen ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   Bar imprimió: ${result1.bar ? '✅ SÍ' : '❌ NO'}`);
  
  if (result1.kitchen && result1.bar) {
    console.log('   🚨 PROBLEMA: Ambas imprimieron (bar no debería)');
    console.log('   📝 Servicios NO filtran por tipo de item');
  } else if (result1.kitchen && !result1.bar) {
    console.log('   ✅ CORRECTO: Solo cocina imprimió');
  } else if (!result1.kitchen && result1.bar) {
    console.log('   🚨 EXTRAÑO: Solo bar imprimió item de cocina');
  } else {
    console.log('   🚨 PROBLEMA: Ninguna imprimió (ambas inactivas?)');
  }
  
  console.log('\n📊 ITEM SOLO DE BAR:');
  console.log(`   Cocina imprimió: ${result2.kitchen ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   Bar imprimió: ${result2.bar ? '✅ SÍ' : '❌ NO'}`);
  
  if (result2.kitchen && result2.bar) {
    console.log('   🚨 PROBLEMA: Ambas imprimieron (cocina no debería)');
    console.log('   📝 Servicios NO filtran por tipo de item');
  } else if (!result2.kitchen && result2.bar) {
    console.log('   ✅ CORRECTO: Solo bar imprimió');
  } else if (result2.kitchen && !result2.bar) {
    console.log('   🚨 EXTRAÑO: Solo cocina imprimió item de bar');
  } else {
    console.log('   🚨 PROBLEMA: Ninguna imprimió (ambas inactivas?)');
  }
  
  // Final diagnosis
  console.log('\n🎯 DIAGNÓSTICO FINAL:');
  console.log('====================');
  
  const bothPrintKitchen = result1.kitchen && result2.kitchen;
  const bothPrintBar = result1.bar && result2.bar;
  
  if (bothPrintKitchen && bothPrintBar) {
    console.log('🚨 PROBLEMA CONFIRMADO: AMBOS SERVICIOS IMPRIMEN TODO');
    console.log('📝 Los servicios Python:');
    console.log('   ❌ NO consultan tabla printers (is_active)');
    console.log('   ❌ NO filtran por tipo de item');
    console.log('   ❌ Imprimen TODOS los pedidos siempre');
    console.log('   ✅ SÍ actualizan flags kitchen_printed/drink_printed');
    
    console.log('\n💡 CORRECCIONES NECESARIAS:');
    console.log('1. printer_service.py (Raspberry Pi):');
    console.log('   • Verificar is_active antes de imprimir');
    console.log('   • Filtrar solo items de cocina/comida');
    console.log('2. xprinter_service.py (Windows Tablet):');
    console.log('   • Verificar is_active antes de imprimir');
    console.log('   • Filtrar solo items de bar/bebidas');
    
  } else {
    console.log('✅ SERVICIOS TIENEN ALGÚN FILTRADO');
    console.log('Revisar implementación específica...');
  }
  
  return {
    kitchenPrintsEverything: bothPrintKitchen,
    barPrintsEverything: bothPrintBar,
    noFiltering: bothPrintKitchen && bothPrintBar
  };
}

// Execute advanced diagnostic
runAdvancedDiagnostic().then(diagnosis => {
  console.log('\n🏁 DIAGNÓSTICO AVANZADO COMPLETADO');
  console.log('Información detallada generada para corrección de servicios');
});
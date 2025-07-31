const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function waitForPrinting(orderId, timeoutSeconds = 30) {
  console.log(`⏱️  Esperando impresión automática (${timeoutSeconds}s máximo)...`);
  
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
      
      if (order.kitchen_printed && order.drink_printed) {
        console.log('✅ ¡Ambas impresoras completaron la impresión!');
        return { success: true, kitchen: true, bar: true, status: order.status };
      }
      
      if (order.kitchen_printed && !order.drink_printed) {
        console.log('🟡 Cocina impresa, esperando bar...');
      }
      
      if (!order.kitchen_printed && order.drink_printed) {
        console.log('🟡 Bar impreso, esperando cocina...');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  }
  
  // Final status check
  const { data: finalOrder } = await supabase
    .from('orders')
    .select('kitchen_printed, drink_printed, status')
    .eq('id', orderId)
    .single();
    
  console.log('⏰ Timeout alcanzado');
  return { 
    success: false, 
    kitchen: finalOrder?.kitchen_printed || false, 
    bar: finalOrder?.drink_printed || false,
    status: finalOrder?.status || 'unknown'
  };
}

async function realPrinterTest1_Connectivity() {
  console.log('🧪 PRUEBA REAL 1: CONECTIVIDAD COMPLETA');
  console.log('======================================');
  
  console.log('🎯 Objetivo: Verificar que ambas impresoras físicas funcionan');
  console.log('📋 Creando pedido con items de cocina Y bar...\n');
  
  try {
    // Get table
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', '1')
      .single();
      
    if (tableError || !table) {
      console.error('❌ Mesa 1 no encontrada:', tableError?.message);
      return;
    }
    
    // Create test order with both types
    const testOrder = {
      customer_name: 'PRUEBA REAL - Conectividad',
      items: [
        { id: 39, name: 'CHARQUE', quantity: 1, price: 93 }, // Kitchen item
        { id: 50, name: 'Coca Cola', quantity: 2, price: 15 } // Bar item
      ],
      notes: 'PRUEBA REAL: Verificación de impresoras físicas - Raspberry Pi + Windows Tablet'
    };
    
    const total = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: table.id,
        customer_name: testOrder.customer_name,
        status: 'pending',
        total_price: total,
        notes: testOrder.notes,
        source: 'staff_placed',
        restaurant_id: restaurantId
      })
      .select()
      .single();
      
    if (orderError) {
      console.error('❌ Error creando pedido:', orderError);
      return;
    }
    
    // Create order items  
    const orderItems = testOrder.items.map(item => ({
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
      return;
    }
    
    console.log(`✅ PEDIDO CREADO - ID: ${order.id}`);
    console.log(`   Cliente: ${testOrder.customer_name}`);
    console.log(`   Total: Bs ${total}`);
    console.log(`   Items: ${testOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
    
    console.log('\n🖨️  INICIANDO PROCESO DE IMPRESIÓN AUTOMÁTICA...');
    console.log('================================================');
    console.log('🍳 Raspberry Pi debería recibir notificación e imprimir CHARQUE');
    console.log('🥤 Windows Tablet debería recibir notificación e imprimir Coca Cola');
    
    // Wait for automatic printing
    const result = await waitForPrinting(order.id, 45); // 45 seconds timeout
    
    console.log('\n📊 RESULTADO DE PRUEBA REAL 1:');
    console.log('==============================');
    
    if (result.success) {
      console.log('🎉 ¡ÉXITO COMPLETO!');
      console.log('✅ Raspberry Pi (Cocina): FUNCIONANDO');
      console.log('✅ Windows Tablet (Bar): FUNCIONANDO'); 
      console.log('✅ Comunicación Supabase: FUNCIONANDO');
      console.log('✅ Servicios Python: FUNCIONANDO');
      console.log(`✅ Estado final del pedido: ${result.status}`);
    } else {
      console.log('⚠️  IMPRESIÓN PARCIAL O FALLO');
      console.log(`${result.kitchen ? '✅' : '❌'} Raspberry Pi (Cocina): ${result.kitchen ? 'FUNCIONANDO' : 'NO RESPONDIÓ'}`);
      console.log(`${result.bar ? '✅' : '❌'} Windows Tablet (Bar): ${result.bar ? 'FUNCIONANDO' : 'NO RESPONDIÓ'}`);
      console.log(`📋 Estado final del pedido: ${result.status}`);
      
      console.log('\n🔧 POSIBLES CAUSAS:');
      if (!result.kitchen) {
        console.log('🍳 Raspberry Pi:');
        console.log('   • Servicio printer_service.py no está corriendo');
        console.log('   • Star Micronics BSC10 desconectada');
        console.log('   • Sin conexión WiFi a Supabase');
        console.log('   • Error en el código del servicio');
      }
      if (!result.bar) {
        console.log('🥤 Windows Tablet:');
        console.log('   • Servicio xprinter_service.py no está corriendo');
        console.log('   • Xprinter XP-T80A desconectada');
        console.log('   • Sin conexión WiFi a Supabase');
        console.log('   • Error en el código del servicio');
      }
    }
    
    return { orderId: order.id, ...result };
    
  } catch (error) {
    console.error('❌ Error en prueba real:', error);
    return { success: false, error: error.message };
  }
}

async function realPrinterTest2_KitchenOnly() {
  console.log('\n🧪 PRUEBA REAL 2: SOLO COCINA');
  console.log('=============================');
  
  console.log('🎯 Objetivo: Verificar impresión solo en Raspberry Pi');
  console.log('📋 Creando pedido SOLO con items de cocina...\n');
  
  try {
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', '2')
      .single();
      
    if (tableError || !table) {
      console.error('❌ Mesa 2 no encontrada:', tableError?.message);
      return;
    }
      
    const testOrder = {
      customer_name: 'PRUEBA REAL - Solo Cocina',
      items: [
        { id: 34, name: 'FRICASE', quantity: 1, price: 84 } // Only kitchen item
      ],
      notes: 'PRUEBA REAL: Solo Raspberry Pi debería imprimir'
    };
    
    const total = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const { data: order } = await supabase
      .from('orders')
      .insert({
        table_id: table.id,
        customer_name: testOrder.customer_name,
        status: 'pending',
        total_price: total,
        notes: testOrder.notes,
        source: 'staff_placed',
        restaurant_id: restaurantId
      })
      .select()
      .single();
    
    await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        menu_item_id: testOrder.items[0].id,
        quantity: testOrder.items[0].quantity,
        price_at_order: testOrder.items[0].price
      }]);
    
    console.log(`✅ PEDIDO CREADO - ID: ${order.id}`);
    console.log(`   Solo item de cocina: ${testOrder.items[0].name}`);
    
    console.log('\n🍳 ESPERANDO IMPRESIÓN EN RASPBERRY PI...');
    
    const result = await waitForPrinting(order.id, 30);
    
    console.log('\n📊 RESULTADO DE PRUEBA REAL 2:');
    console.log('==============================');
    
    if (result.kitchen && !result.bar) {
      console.log('🎉 ¡PERFECTO!');
      console.log('✅ Solo Raspberry Pi imprimió (correcto)');
      console.log('✅ Windows Tablet no imprimió (correcto)');
    } else if (result.kitchen && result.bar) {
      console.log('⚠️  Ambos imprimieron (verificar lógica)');
    } else if (!result.kitchen) {
      console.log('❌ Raspberry Pi no imprimió (problema)');
    }
    
    return { orderId: order.id, ...result };
    
  } catch (error) {
    console.error('❌ Error en prueba real 2:', error);
    return { success: false, error: error.message };
  }
}

async function realPrinterTest3_BarOnly() {
  console.log('\n🧪 PRUEBA REAL 3: SOLO BAR');
  console.log('==========================');
  
  console.log('🎯 Objetivo: Verificar impresión solo en Windows Tablet');
  console.log('📋 Creando pedido SOLO con items de bar...\n');
  
  try {
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', '3')
      .single();
      
    if (tableError || !table) {
      console.error('❌ Mesa 3 no encontrada:', tableError?.message);
      return;
    }
      
    const testOrder = {
      customer_name: 'PRUEBA REAL - Solo Bar',
      items: [
        { id: 46, name: 'Jarra Jugo de fruta 1 litro', quantity: 1, price: 30 } // Only bar item
      ],
      notes: 'PRUEBA REAL: Solo Windows Tablet debería imprimir'
    };
    
    const total = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const { data: order } = await supabase
      .from('orders')
      .insert({
        table_id: table.id,
        customer_name: testOrder.customer_name,
        status: 'pending',
        total_price: total,
        notes: testOrder.notes,
        source: 'staff_placed',
        restaurant_id: restaurantId
      })
      .select()
      .single();
    
    await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        menu_item_id: testOrder.items[0].id,
        quantity: testOrder.items[0].quantity,
        price_at_order: testOrder.items[0].price
      }]);
    
    console.log(`✅ PEDIDO CREADO - ID: ${order.id}`);
    console.log(`   Solo item de bar: ${testOrder.items[0].name}`);
    
    console.log('\n🥤 ESPERANDO IMPRESIÓN EN WINDOWS TABLET...');
    
    const result = await waitForPrinting(order.id, 30);
    
    console.log('\n📊 RESULTADO DE PRUEBA REAL 3:');
    console.log('==============================');
    
    if (!result.kitchen && result.bar) {
      console.log('🎉 ¡PERFECTO!');
      console.log('✅ Solo Windows Tablet imprimió (correcto)');
      console.log('✅ Raspberry Pi no imprimió (correcto)');
    } else if (result.kitchen && result.bar) {
      console.log('⚠️  Ambos imprimieron (verificar lógica)');
    } else if (!result.bar) {
      console.log('❌ Windows Tablet no imprimió (problema)');
    }
    
    return { orderId: order.id, ...result };
    
  } catch (error) {
    console.error('❌ Error en prueba real 3:', error);
    return { success: false, error: error.message };
  }
}

async function runRealPrinterTests() {
  console.log('🚀 INICIANDO PRUEBAS CON IMPRESORAS REALES');
  console.log('==========================================');
  console.log('🏗️  Hardware: Raspberry Pi + Windows Tablet');
  console.log('🖨️  Impresoras: Star Micronics BSC10 + Xprinter XP-T80A');
  console.log('🔗 Conexión: USB + WiFi Supabase');
  console.log('⚡ Servicios: Python automáticos\n');
  
  const results = [];
  
  try {
    // Test 1: Full connectivity
    const result1 = await realPrinterTest1_Connectivity();
    results.push({ test: 'Conectividad Completa', ...result1 });
    
    // Wait between tests
    console.log('\n⏸️  Pausa de 5 segundos entre pruebas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 2: Kitchen only
    const result2 = await realPrinterTest2_KitchenOnly();
    results.push({ test: 'Solo Cocina', ...result2 });
    
    // Wait between tests
    console.log('\n⏸️  Pausa de 5 segundos entre pruebas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 3: Bar only
    const result3 = await realPrinterTest3_BarOnly();
    results.push({ test: 'Solo Bar', ...result3 });
    
    // Summary
    console.log('\n🏆 RESUMEN FINAL DE PRUEBAS REALES');
    console.log('==================================');
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ ÉXITO' : '❌ FALLO';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      if (result.orderId) {
        console.log(`   Pedido ID: ${result.orderId}`);
      }
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 RESULTADOS: ${successCount}/${results.length} pruebas exitosas`);
    
    if (successCount === results.length) {
      console.log('🎉 ¡SISTEMA DE IMPRESIÓN REAL COMPLETAMENTE FUNCIONAL!');
    } else {
      console.log('⚠️  Algunas pruebas fallaron - revisar servicios');
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas reales:', error);
  }
}

// Execute real printer tests
runRealPrinterTests();
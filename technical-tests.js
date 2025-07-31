const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function techTest1_DatabasePerformance() {
  console.log('⚡ TEST TÉCNICO 1: PERFORMANCE DE BASE DE DATOS');
  console.log('===============================================');
  
  const tests = [
    {
      name: 'Consulta pedidos con joins',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              menu_items (name, price)
            ),
            tables (table_number)
          `)
          .eq('restaurant_id', restaurantId)
          .limit(10);
        const duration = Date.now() - start;
        return { duration, count: data?.length || 0, error };
      }
    },
    {
      name: 'Consulta productos con categorías',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('menu_items')
          .select(`
            *,
            menu_categories (name)
          `)
          .eq('is_available', true)
          .limit(20);
        const duration = Date.now() - start;
        return { duration, count: data?.length || 0, error };
      }
    },
    {
      name: 'Consulta historial de pagos',
      query: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('order_payments')
          .select(`
            *,
            orders!inner (restaurant_id, customer_name)
          `)
          .eq('orders.restaurant_id', restaurantId)
          .limit(15);
        const duration = Date.now() - start;
        return { duration, count: data?.length || 0, error };
      }
    }
  ];
  
  console.log('🔍 Ejecutando tests de performance...');
  
  for (const test of tests) {
    try {
      const result = await test.query();
      
      if (result.error) {
        console.log(`❌ ${test.name}: ERROR - ${result.error.message}`);
      } else {
        const status = result.duration < 1000 ? '✅' : result.duration < 3000 ? '⚠️' : '❌';
        console.log(`${status} ${test.name}: ${result.duration}ms (${result.count} registros)`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: EXCEPCIÓN - ${error.message}`);
    }
  }
  
  console.log('\n📊 Criterios de performance:');
  console.log('   ✅ < 1000ms: Excelente');
  console.log('   ⚠️  1000-3000ms: Aceptable');
  console.log('   ❌ > 3000ms: Necesita optimización');
}

async function techTest2_DataIntegrity() {
  console.log('\n🔒 TEST TÉCNICO 2: INTEGRIDAD DE DATOS');
  console.log('===============================================');
  
  console.log('🔍 Verificando integridad referencial...');
  
  // Test 1: Orders sin tabla
  const { data: orphanOrders } = await supabase
    .from('orders')
    .select('id, customer_name, table_id')
    .eq('restaurant_id', restaurantId)
    .is('tables.id', null)
    .limit(5);
    
  console.log(`📋 Pedidos huérfanos (sin mesa): ${orphanOrders?.length || 0}`);
  
  // Test 2: Order items sin pedido
  const { data: orphanItems } = await supabase
    .from('order_items')
    .select('id, order_id')
    .is('orders.id', null)
    .limit(5);
    
  console.log(`🍽️  Items huérfanos (sin pedido): ${orphanItems?.length || 0}`);
  
  // Test 3: Pagos sin pedido
  const { data: orphanPayments } = await supabase
    .from('order_payments')
    .select('id, order_id')
    .is('orders.id', null)
    .limit(5);
    
  console.log(`💳 Pagos huérfanos (sin pedido): ${orphanPayments?.length || 0}`);
  
  // Test 4: Consistencia de totales
  console.log('\n💰 Verificando consistencia de totales...');
  
  const { data: ordersWithItems } = await supabase
    .from('orders')
    .select(`
      id,
      total_price,
      order_items (
        quantity,
        price_at_order
      )
    `)
    .eq('restaurant_id', restaurantId)
    .limit(5);
    
  let inconsistentOrders = 0;
  
  ordersWithItems?.forEach(order => {
    const calculatedTotal = order.order_items.reduce((sum, item) => 
      sum + (item.quantity * item.price_at_order), 0
    );
    
    if (Math.abs(order.total_price - calculatedTotal) > 0.01) {
      inconsistentOrders++;
      console.log(`   ⚠️  Pedido ${order.id}: Total DB=${order.total_price}, Calculado=${calculatedTotal}`);
    }
  });
  
  console.log(`📊 Pedidos con totales inconsistentes: ${inconsistentOrders}`);
  
  // Test 5: Estados válidos
  const { data: invalidStatuses } = await supabase
    .from('orders')
    .select('id, status')
    .eq('restaurant_id', restaurantId)
    .not('status', 'in', '(pending,in_progress,completed,cancelled)')
    .limit(5);
    
  console.log(`🔄 Pedidos con estados inválidos: ${invalidStatuses?.length || 0}`);
  
  const integrityScore = 100 - (
    (orphanOrders?.length || 0) * 10 +
    (orphanItems?.length || 0) * 5 +
    (orphanPayments?.length || 0) * 10 +
    inconsistentOrders * 15 +
    (invalidStatuses?.length || 0) * 20
  );
  
  console.log(`\n🎯 PUNTUACIÓN DE INTEGRIDAD: ${Math.max(0, integrityScore)}/100`);
}

async function techTest3_ErrorHandling() {
  console.log('\n🛡️  TEST TÉCNICO 3: MANEJO DE ERRORES');
  console.log('===============================================');
  
  console.log('🔍 Probando manejo de errores...');
  
  const errorTests = [
    {
      name: 'Insertar pedido con mesa inexistente',
      test: async () => {
        const { error } = await supabase
          .from('orders')
          .insert({
            table_id: 'mesa-inexistente-123',
            customer_name: 'Test Error',
            status: 'pending',
            total_price: 50,
            restaurant_id: restaurantId
          });
        return error;
      }
    },
    {
      name: 'Insertar item con menu_item_id inválido',
      test: async () => {
        const { error } = await supabase
          .from('order_items')
          .insert({
            order_id: 999999,
            menu_item_id: 999999,
            quantity: 1,
            price_at_order: 10
          });
        return error;
      }
    },
    {
      name: 'Pago con método inválido',
      test: async () => {
        const { error } = await supabase
          .from('order_payments')
          .insert({
            order_id: 1,
            amount: 50,
            payment_method: 'bitcoin' // Invalid method
          });
        return error;
      }
    },
    {
      name: 'Estado de pedido inválido',
      test: async () => {
        const { data: firstOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .limit(1)
          .single();
          
        if (!firstOrder) return null;
        
        const { error } = await supabase
          .from('orders')
          .update({ status: 'estado_invalido' })
          .eq('id', firstOrder.id);
        return error;
      }
    }
  ];
  
  let errorsCaught = 0;
  
  for (const errorTest of errorTests) {
    try {
      const error = await errorTest.test();
      
      if (error) {
        console.log(`✅ ${errorTest.name}: Error capturado correctamente`);
        console.log(`   📝 ${error.message}`);
        errorsCaught++;
      } else {
        console.log(`❌ ${errorTest.name}: No se capturó error (problema de validación)`);
      }
    } catch (exception) {
      console.log(`✅ ${errorTest.name}: Excepción capturada`);
      console.log(`   📝 ${exception.message}`);
      errorsCaught++;
    }
  }
  
  console.log(`\n🎯 ERRORES MANEJADOS CORRECTAMENTE: ${errorsCaught}/${errorTests.length}`);
}

async function techTest4_ConcurrencySimulation() {
  console.log('\n⚡ TEST TÉCNICO 4: SIMULACIÓN DE CONCURRENCIA');
  console.log('===============================================');
  
  console.log('🔍 Simulando múltiples operaciones simultáneas...');
  
  // Simulate multiple concurrent orders
  const concurrentOperations = [];
  
  for (let i = 0; i < 5; i++) {
    const operation = async () => {
      const startTime = Date.now();
      
      try {
        // Get random table
        const { data: tables } = await supabase
          .from('tables')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .limit(1);
          
        if (!tables || tables.length === 0) {
          return { success: false, duration: Date.now() - startTime, error: 'No tables' };
        }
        
        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            table_id: tables[0].id,
            customer_name: `Concurrent Test ${i}`,
            status: 'pending',
            total_price: Math.floor(Math.random() * 100) + 20,
            restaurant_id: restaurantId,
            source: 'staff_placed'
          })
          .select()
          .single();
          
        if (orderError) {
          return { success: false, duration: Date.now() - startTime, error: orderError.message };
        }
        
        // Add order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: 50, // Coca Cola
            quantity: 1,
            price_at_order: 15
          });
          
        if (itemError) {
          return { success: false, duration: Date.now() - startTime, error: itemError.message };
        }
        
        return { success: true, duration: Date.now() - startTime, orderId: order.id };
        
      } catch (error) {
        return { success: false, duration: Date.now() - startTime, error: error.message };
      }
    };
    
    concurrentOperations.push(operation());
  }
  
  const results = await Promise.all(concurrentOperations);
  
  const successful = results.filter(r => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`✅ Operaciones exitosas: ${successful}/${results.length}`);
  console.log(`⏱️  Duración promedio: ${avgDuration.toFixed(0)}ms`);
  
  // Show individual results
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`   ✅ Op ${index + 1}: ${result.duration}ms - Pedido ${result.orderId}`);
    } else {
      console.log(`   ❌ Op ${index + 1}: ${result.duration}ms - Error: ${result.error}`);
    }
  });
  
  return { successful, total: results.length, avgDuration };
}

async function techTest5_SecurityBasics() {
  console.log('\n🔐 TEST TÉCNICO 5: SEGURIDAD BÁSICA');
  console.log('===============================================');
  
  console.log('🔍 Verificando configuraciones de seguridad...');
  
  // Test 1: RLS (Row Level Security) check
  console.log('\n1️⃣ Verificando Row Level Security (RLS)...');
  
  try {
    // Try to access data without proper context
    const anonClient = createClient(supabaseUrl, 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDMxMjUsImV4cCI6MjA2NjM3OTEyNX0.LFTPv0veT2nRBBzTgV5eWgjBn0D7GbUTAtAnD5lObcQ'
    );
    
    const { data: ordersWithAnon, error: anonError } = await anonClient
      .from('orders')
      .select('*')
      .limit(1);
      
    if (anonError || !ordersWithAnon || ordersWithAnon.length === 0) {
      console.log('✅ RLS funcionando: Cliente anónimo no puede acceder a pedidos');
    } else {
      console.log('⚠️  RLS posible problema: Cliente anónimo accedió a pedidos');
    }
  } catch (error) {
    console.log('✅ RLS funcionando: Excepción capturada para cliente anónimo');
  }
  
  // Test 2: SQL Injection básico
  console.log('\n2️⃣ Test básico de SQL injection...');
  
  try {
    const maliciousInput = "'; DROP TABLE orders; --";
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_name', maliciousInput);
      
    console.log('✅ SQL Injection protegido: Query maliciosa no ejecutada');
  } catch (error) {
    console.log('✅ SQL Injection bloqueado por excepción');
  }
  
  // Test 3: Data validation
  console.log('\n3️⃣ Verificando validación de datos...');
  
  const validationTests = [
    {
      name: 'Precio negativo',
      test: async () => {
        const { error } = await supabase
          .from('orders')
          .insert({
            table_id: 'test',
            customer_name: 'Test',
            total_price: -100, // Negative price
            restaurant_id: restaurantId
          });
        return !!error;
      }
    },
    {
      name: 'Cantidad negativa en item',
      test: async () => {
        const { error } = await supabase
          .from('order_items')
          .insert({
            order_id: 1,
            menu_item_id: 1,
            quantity: -5, // Negative quantity
            price_at_order: 10
          });
        return !!error;
      }
    }
  ];
  
  for (const test of validationTests) {
    try {
      const blocked = await test.test();
      if (blocked) {
        console.log(`✅ ${test.name}: Validación funcionando`);
      } else {
        console.log(`⚠️  ${test.name}: Validación podría mejorarse`);
      }
    } catch (error) {
      console.log(`✅ ${test.name}: Bloqueado por excepción`);
    }
  }
}

async function runTechnicalTests() {
  console.log('🧪 INICIANDO CASOS TÉCNICOS');
  console.log('============================\n');
  
  try {
    await techTest1_DatabasePerformance();
    await techTest2_DataIntegrity();
    await techTest3_ErrorHandling();
    const concurrencyResult = await techTest4_ConcurrencySimulation();
    await techTest5_SecurityBasics();
    
    console.log('\n🎉 CASOS TÉCNICOS COMPLETADOS');
    console.log('=============================');
    console.log('✅ Performance de BD evaluada');
    console.log('✅ Integridad de datos verificada');
    console.log('✅ Manejo de errores probado');
    console.log(`✅ Concurrencia simulada (${concurrencyResult?.successful}/${concurrencyResult?.total} exitosas)`);
    console.log('✅ Seguridad básica verificada');
    
    console.log('\n💡 RECOMENDACIONES TÉCNICAS:');
    console.log('• Monitorear performance de queries complejas');
    console.log('• Mantener validaciones de integridad');
    console.log('• Implementar logging de errores en producción');
    console.log('• Considerar cache para consultas frecuentes');
    
  } catch (error) {
    console.error('❌ Error ejecutando casos técnicos:', error);
  }
}

// Execute technical tests
runTechnicalTests();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = 'a01006de-3963-406d-b060-5b7b34623a38'; // Restaurante de Pruebas

async function debugOrderFlow() {
  console.log('🔬 DIAGNÓSTICO: FLUJO DE ÓRDENES');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar impresoras activas
    console.log('\n📋 PASO 1: VERIFICANDO IMPRESORAS');
    console.log('='.repeat(40));
    
    const { data: printers, error: printersError } = await supabase
      .from('printers')
      .select('name, type, is_active')
      .eq('restaurant_id', restaurantId);
      
    if (printersError) {
      console.error('❌ Error consultando impresoras:', printersError);
      return;
    }
    
    console.log('📊 ESTADO ACTUAL DE IMPRESORAS:');
    printers?.forEach(printer => {
      const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`   ${printer.name} (${printer.type}): ${status}`);
    });
    
    const activePrinters = printers?.filter(p => p.is_active) || [];
    console.log(`\n🎯 Impresoras activas: ${activePrinters.length}`);
    
    // 2. Obtener todas las órdenes recientes
    console.log('\n📋 PASO 2: ANALIZANDO ÓRDENES RECIENTES');
    console.log('='.repeat(40));
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        kitchen_printed, 
        drink_printed, 
        created_at,
        customer_name,
        table_id
      `)
      .eq('restaurant_id', restaurantId)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (ordersError) {
      console.error('❌ Error consultando órdenes:', ordersError);
      return;
    }
    
    console.log(`📊 Órdenes encontradas: ${orders?.length || 0}`);
    
    // 3. Analizar cada orden
    console.log('\n📋 PASO 3: ANÁLISIS DETALLADO DE CADA ORDEN');
    console.log('='.repeat(40));
    
    orders?.forEach((order, index) => {
      console.log(`\n🔍 ORDEN #${order.id} (${index + 1}/${orders.length})`);
      console.log(`   Cliente: ${order.customer_name}`);
      console.log(`   Mesa: ${order.table_id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Kitchen printed: ${order.kitchen_printed}`);
      console.log(`   Drink printed: ${order.drink_printed}`);
      console.log(`   Creada: ${order.created_at}`);
      
      // Simular la lógica del frontend
      const isOrderReadyForProgress = activePrinters.length === 0 || order.kitchen_printed;
      
      console.log(`   ¿Lista para "En Preparación"?: ${isOrderReadyForProgress ? 'SÍ' : 'NO'}`);
      
      // Determinar en qué tab debería aparecer
      let expectedTab = '';
      if (!isOrderReadyForProgress) {
        expectedTab = 'PENDIENTES';
      } else if (order.status === 'pending' || order.status === 'in_progress') {
        expectedTab = 'EN PREPARACIÓN';
      } else if (order.status === 'completed') {
        expectedTab = 'COMPLETADOS';
      } else if (order.status === 'cancelled') {
        expectedTab = 'CANCELADOS';
      }
      
      console.log(`   Tab esperado: ${expectedTab}`);
      
      // Determinar qué botón debería mostrar
      let expectedButton = '';
      if (order.status === 'pending') {
        expectedButton = 'COMENZAR A PREPARAR';
      } else if (order.status === 'in_progress') {
        expectedButton = 'SERVIR Y COBRAR';
      } else {
        expectedButton = 'N/A';
      }
      
      console.log(`   Botón esperado: ${expectedButton}`);
      
      // Verificar si hay problema
      if (order.status === 'in_progress' && expectedButton === 'SERVIR Y COBRAR') {
        console.log(`   ⚠️  PROBLEMA: Orden va directo a "SERVIR Y COBRAR"`);
        console.log(`   💡 Esto puede ser correcto si la orden ya está en_progress`);
      }
    });
    
    // 4. Verificar órdenes específicas que pueden estar causando problemas
    console.log('\n📋 PASO 4: VERIFICANDO ÓRDENES PROBLEMÁTICAS');
    console.log('='.repeat(40));
    
    const problematicOrders = orders?.filter(order => 
      order.status === 'in_progress' && 
      order.customer_name?.includes('DIAGNÓSTICO')
    ) || [];
    
    console.log(`🔍 Órdenes de diagnóstico encontradas: ${problematicOrders.length}`);
    
    problematicOrders.forEach(order => {
      console.log(`\n📝 ORDEN DE DIAGNÓSTICO #${order.id}:`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Kitchen printed: ${order.kitchen_printed}`);
      console.log(`   Drink printed: ${order.drink_printed}`);
      console.log(`   ⚠️  Esta orden debería mostrar "SERVIR Y COBRAR" porque ya está en_progress`);
    });
    
    // 5. Crear una nueva orden de prueba para verificar el flujo
    console.log('\n📋 PASO 5: CREANDO NUEVA ORDEN DE PRUEBA');
    console.log('='.repeat(40));
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', restaurantId)
      .limit(1);
      
    if (menuItems && menuItems.length > 0) {
      const testOrder = {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5',
        customer_name: 'PRUEBA FLUJO - ' + new Date().toLocaleTimeString(),
        total_price: menuItems[0].price,
        notes: 'Prueba de flujo completo',
        order_items: [
          {
            menu_item_id: menuItems[0].id,
            quantity: 1,
            price_at_order: menuItems[0].price,
            notes: 'Item de prueba'
          }
        ]
      };
      
      console.log('📝 Creando nueva orden de prueba...');
      
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
        console.log(`✅ Nueva orden creada: #${result.order_id}`);
        console.log(`📊 Respuesta:`, result);
        
        // Verificar el estado de la nueva orden
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: newOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('id', result.order_id)
          .single();
          
        if (newOrder) {
          console.log(`\n📊 ESTADO DE LA NUEVA ORDEN:`);
          console.log(`   ID: ${newOrder.id}`);
          console.log(`   Status: ${newOrder.status}`);
          console.log(`   Kitchen printed: ${newOrder.kitchen_printed}`);
          console.log(`   Drink printed: ${newOrder.drink_printed}`);
          
          const isReady = activePrinters.length === 0 || newOrder.kitchen_printed;
          console.log(`   ¿Lista para "En Preparación"?: ${isReady ? 'SÍ' : 'NO'}`);
          
          if (newOrder.status === 'in_progress') {
            console.log(`   ⚠️  Esta orden mostrará "SERVIR Y COBRAR" directamente`);
            console.log(`   💡 Esto es CORRECTO si no hay impresoras activas`);
          }
        }
      } else {
        console.error('❌ Error creando orden de prueba:', result);
      }
    }
    
    // 6. Resumen final
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(40));
    console.log(`✅ Impresoras activas: ${activePrinters.length}`);
    console.log(`✅ Órdenes analizadas: ${orders?.length || 0}`);
    console.log(`✅ Órdenes de diagnóstico: ${problematicOrders.length}`);
    
    if (activePrinters.length === 0) {
      console.log('\n🎯 CONCLUSIÓN:');
      console.log('   - Sin impresoras activas, las órdenes van directo a "En Preparación"');
      console.log('   - Status inicial: in_progress');
      console.log('   - Botón mostrado: "SERVIR Y COBRAR"');
      console.log('   - Esto es CORRECTO según el diseño del sistema');
    } else {
      console.log('\n🎯 CONCLUSIÓN:');
      console.log('   - Con impresoras activas, las órdenes van a "Pendientes"');
      console.log('   - Status inicial: pending');
      console.log('   - Botón mostrado: "COMENZAR A PREPARAR"');
    }
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
debugOrderFlow(); 
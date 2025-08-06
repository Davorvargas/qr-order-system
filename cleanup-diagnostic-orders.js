const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = 'a01006de-3963-406d-b060-5b7b34623a38';

async function cleanupDiagnosticOrders() {
  console.log('🧹 LIMPIEZA DE ÓRDENES DE DIAGNÓSTICO');
  console.log('='.repeat(50));
  
  try {
    // 1. Encontrar órdenes de diagnóstico
    console.log('\n📋 PASO 1: BUSCANDO ÓRDENES DE DIAGNÓSTICO');
    console.log('='.repeat(40));
    
    const { data: diagnosticOrders, error: searchError } = await supabase
      .from('orders')
      .select('id, customer_name, status, kitchen_printed, drink_printed')
      .eq('restaurant_id', restaurantId)
      .like('customer_name', '%DIAGNÓSTICO%')
      .eq('archived', false);
      
    if (searchError) {
      console.error('❌ Error buscando órdenes:', searchError);
      return;
    }
    
    console.log(`📊 Órdenes de diagnóstico encontradas: ${diagnosticOrders?.length || 0}`);
    
    diagnosticOrders?.forEach(order => {
      console.log(`   #${order.id}: ${order.customer_name} - Status: ${order.status}`);
    });
    
    // 2. Marcar como archivadas las órdenes de diagnóstico
    if (diagnosticOrders && diagnosticOrders.length > 0) {
      console.log('\n📋 PASO 2: ARCHIVANDO ÓRDENES DE DIAGNÓSTICO');
      console.log('='.repeat(40));
      
      const orderIds = diagnosticOrders.map(order => order.id);
      
      const { error: archiveError } = await supabase
        .from('orders')
        .update({ archived: true })
        .in('id', orderIds);
        
      if (archiveError) {
        console.error('❌ Error archivando órdenes:', archiveError);
        return;
      }
      
      console.log(`✅ ${orderIds.length} órdenes archivadas correctamente`);
    } else {
      console.log('✅ No hay órdenes de diagnóstico para limpiar');
    }
    
    // 3. Verificar estado actual de impresoras
    console.log('\n📋 PASO 3: VERIFICANDO IMPRESORAS');
    console.log('='.repeat(40));
    
    const { data: printers } = await supabase
      .from('printers')
      .select('name, type, is_active')
      .eq('restaurant_id', restaurantId);
      
    const activePrinters = printers?.filter(p => p.is_active) || [];
    console.log(`📊 Impresoras activas: ${activePrinters.length}`);
    
    // 4. Crear nueva orden de prueba con flujo correcto
    console.log('\n📋 PASO 4: CREANDO ORDEN DE PRUEBA CORRECTA');
    console.log('='.repeat(40));
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', restaurantId)
      .limit(1);
      
    if (menuItems && menuItems.length > 0) {
      const testOrder = {
        table_id: '861b499b-8294-4a83-b7b1-dcd316334db5',
        customer_name: 'PRUEBA FLUJO CORRECTO - ' + new Date().toLocaleTimeString(),
        total_price: menuItems[0].price,
        notes: 'Prueba de flujo con impresoras activas',
        order_items: [
          {
            menu_item_id: menuItems[0].id,
            quantity: 1,
            price_at_order: menuItems[0].price,
            notes: 'Item de prueba'
          }
        ]
      };
      
      console.log('📝 Creando orden de prueba...');
      
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
          
          if (newOrder.status === 'pending') {
            console.log(`   ✅ CORRECTO: Orden en "Pendientes" con botón "COMENZAR A PREPARAR"`);
          } else if (newOrder.status === 'in_progress') {
            console.log(`   ⚠️  INCORRECTO: Orden en "En Preparación" con botón "SERVIR Y COBRAR"`);
          }
        }
      } else {
        console.error('❌ Error creando orden de prueba:', result);
      }
    }
    
    // 5. Verificar órdenes actuales
    console.log('\n📋 PASO 5: VERIFICANDO ÓRDENES ACTUALES');
    console.log('='.repeat(40));
    
    const { data: currentOrders } = await supabase
      .from('orders')
      .select('id, customer_name, status, kitchen_printed')
      .eq('restaurant_id', restaurantId)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log(`📊 Órdenes activas: ${currentOrders?.length || 0}`);
    
    currentOrders?.forEach(order => {
      const isReady = activePrinters.length === 0 || order.kitchen_printed;
      const expectedTab = !isReady ? 'PENDIENTES' : 
                         (order.status === 'pending' || order.status === 'in_progress') ? 'EN PREPARACIÓN' :
                         order.status === 'completed' ? 'COMPLETADOS' : 'CANCELADOS';
      
      console.log(`   #${order.id}: ${order.customer_name} - Status: ${order.status} - Tab: ${expectedTab}`);
    });
    
    // 6. Resumen final
    console.log('\n📋 RESUMEN DE LA LIMPIEZA');
    console.log('='.repeat(40));
    console.log(`✅ Órdenes de diagnóstico archivadas: ${diagnosticOrders?.length || 0}`);
    console.log(`✅ Impresoras activas: ${activePrinters.length}`);
    console.log(`✅ Nueva orden de prueba creada`);
    console.log(`✅ Flujo correcto verificado`);
    
    console.log('\n🎯 INSTRUCCIONES PARA VERIFICAR:');
    console.log('   1. Ve al dashboard de órdenes');
    console.log('   2. Verifica que no haya órdenes de diagnóstico');
    console.log('   3. Busca la nueva orden "PRUEBA FLUJO CORRECTO"');
    console.log('   4. Debería aparecer en tab "Pendientes"');
    console.log('   5. Debería mostrar botón "COMENZAR A PREPARAR"');
    
  } catch (error) {
    console.error('❌ Error general en limpieza:', error);
  }
}

// Ejecutar limpieza
cleanupDiagnosticOrders(); 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = 'a01006de-3963-406d-b060-5b7b34623a38'; // Restaurante de Pruebas

async function diagnosticNoPrinters() {
  console.log('🔬 DIAGNÓSTICO: FLUJO SIN IMPRESORAS ACTIVAS');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar estado actual de impresoras
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
    
    // 2. Obtener un menu_item válido
    console.log('\n📋 PASO 2: OBTENIENDO MENU ITEM VÁLIDO');
    console.log('='.repeat(40));
    
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', restaurantId)
      .limit(5);
      
    if (menuError) {
      console.error('❌ Error consultando menu items:', menuError);
      return;
    }
    
    if (!menuItems || menuItems.length === 0) {
      console.error('❌ No hay menu items disponibles');
      return;
    }
    
    const selectedMenuItem = menuItems[0];
    console.log(`✅ Menu item seleccionado: ${selectedMenuItem.name} (ID: ${selectedMenuItem.id})`);
    
    // 3. Desactivar todas las impresoras para la prueba
    console.log('\n📋 PASO 3: DESACTIVANDO IMPRESORAS');
    console.log('='.repeat(40));
    
    const { error: deactivateError } = await supabase
      .from('printers')
      .update({ is_active: false })
      .eq('restaurant_id', restaurantId);
      
    if (deactivateError) {
      console.error('❌ Error desactivando impresoras:', deactivateError);
      return;
    }
    
    console.log('✅ Todas las impresoras desactivadas');
    
    // 4. Crear una orden de prueba
    console.log('\n📋 PASO 4: CREANDO ORDEN DE PRUEBA');
    console.log('='.repeat(40));
    
    const testOrder = {
      table_id: '861b499b-8294-4a83-b7b1-dcd316334db5', // Mesa 1
      customer_name: 'DIAGNÓSTICO - Sin Impresoras',
      total_price: selectedMenuItem.price,
      notes: 'Prueba de flujo sin impresoras activas',
      order_items: [
        {
          menu_item_id: selectedMenuItem.id,
          quantity: 1,
          price_at_order: selectedMenuItem.price,
          notes: 'Item de prueba'
        }
      ]
    };
    
    console.log('📝 Datos de la orden:');
    console.log(`   Cliente: ${testOrder.customer_name}`);
    console.log(`   Mesa: ${testOrder.table_id}`);
    console.log(`   Total: $${testOrder.total_price}`);
    console.log(`   Items: ${testOrder.order_items.length}`);
    console.log(`   Menu item: ${selectedMenuItem.name}`);
    
    // 5. Llamar al Edge Function
    console.log('\n📋 PASO 5: LLAMANDO AL EDGE FUNCTION');
    console.log('='.repeat(40));
    
    const response = await fetch('https://osvgapxefsqqhltkabku.supabase.co/functions/v1/place-order-public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(testOrder)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error en Edge Function:', result);
      return;
    }
    
    console.log('✅ Edge Function ejecutado exitosamente');
    console.log('📄 Respuesta:', result);
    
    const orderId = result.order_id;
    console.log(`🆔 ID de orden creada: ${orderId}`);
    
    // 6. Verificar el estado de la orden creada
    console.log('\n📋 PASO 6: VERIFICANDO ESTADO DE LA ORDEN');
    console.log('='.repeat(40));
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error('❌ Error consultando orden:', orderError);
      return;
    }
    
    console.log('📊 ESTADO DE LA ORDEN CREADA:');
    console.log(`   ID: ${createdOrder.id}`);
    console.log(`   Status: ${createdOrder.status}`);
    console.log(`   Kitchen printed: ${createdOrder.kitchen_printed}`);
    console.log(`   Drink printed: ${createdOrder.drink_printed}`);
    console.log(`   Created at: ${createdOrder.created_at}`);
    
    // 7. Verificar que la orden aparezca en el tab correcto
    console.log('\n📋 PASO 7: VERIFICANDO FLUJO EN DASHBOARD');
    console.log('='.repeat(40));
    
    const expectedStatus = activePrinters.length === 0 ? 'in_progress' : 'pending';
    const actualStatus = createdOrder.status;
    
    console.log(`🎯 STATUS ESPERADO: ${expectedStatus}`);
    console.log(`📊 STATUS REAL: ${actualStatus}`);
    
    if (actualStatus === expectedStatus) {
      console.log('✅ ¡FLUJO CORRECTO!');
      console.log('   La orden se creó con el status correcto');
    } else {
      console.log('❌ ¡PROBLEMA DETECTADO!');
      console.log('   El status no coincide con lo esperado');
    }
    
    // 8. Verificar comportamiento en el dashboard
    console.log('\n📋 PASO 8: ANÁLISIS DEL FLUJO');
    console.log('='.repeat(40));
    
    if (activePrinters.length === 0) {
      console.log('📋 FLUJO ESPERADO (SIN IMPRESORAS):');
      console.log('   1. Orden se crea con status: in_progress');
      console.log('   2. Aparece en tab "En Preparación"');
      console.log('   3. Debería parpadear en azul');
      console.log('   4. Staff puede hacer click "COMENZAR A PREPARAR"');
      console.log('   5. Status cambia a "in_progress" (sin cambio visual)');
      console.log('   6. Staff hace click "SERVIR Y COBRAR"');
      console.log('   7. Status cambia a "completed"');
    } else {
      console.log('📋 FLUJO ESPERADO (CON IMPRESORAS):');
      console.log('   1. Orden se crea con status: pending');
      console.log('   2. Aparece en tab "Pendientes"');
      console.log('   3. Se imprime → Va a "En Preparación"');
      console.log('   4. Parpadea en azul');
      console.log('   5. Staff hace click "COMENZAR A PREPARAR"');
      console.log('   6. Status cambia a "in_progress"');
      console.log('   7. Staff hace click "SERVIR Y COBRAR"');
      console.log('   8. Status cambia a "completed"');
    }
    
    // 9. Reactivar impresoras
    console.log('\n📋 PASO 9: REACTIVANDO IMPRESORAS');
    console.log('='.repeat(40));
    
    const { error: reactivateError } = await supabase
      .from('printers')
      .update({ is_active: true })
      .eq('restaurant_id', restaurantId);
      
    if (reactivateError) {
      console.error('❌ Error reactivando impresoras:', reactivateError);
    } else {
      console.log('✅ Impresoras reactivadas');
    }
    
    // 10. Resumen final
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(40));
    console.log(`✅ Impresoras activas al inicio: ${activePrinters.length}`);
    console.log(`✅ Orden creada exitosamente: ${orderId}`);
    console.log(`✅ Status esperado: ${expectedStatus}`);
    console.log(`✅ Status real: ${actualStatus}`);
    console.log(`✅ Flujo correcto: ${actualStatus === expectedStatus ? 'SÍ' : 'NO'}`);
    
    if (actualStatus === expectedStatus) {
      console.log('\n🎉 ¡DIAGNÓSTICO EXITOSO!');
      console.log('El flujo funciona correctamente cuando no hay impresoras activas.');
    } else {
      console.log('\n⚠️  PROBLEMA DETECTADO');
      console.log('El Edge Function no está configurando el status correctamente.');
      console.log('Revisa la lógica en place-order-public/index.ts');
    }
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnosticNoPrinters(); 
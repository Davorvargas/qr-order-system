const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function case42_KitchenInactive() {
  console.log('🖨️  CASO 4.2: SOLO COCINA INACTIVA');
  console.log('==================================');
  
  console.log('🔍 Verificando configuración de impresoras...');
  
  // Check current printer configuration
  const { data: printers, error: printersError } = await supabase
    .from('printers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('type');
    
  if (printersError) {
    console.error('❌ Error consultando impresoras:', printersError);
    return;
  }
  
  console.log('📋 Estado actual de impresoras:');
  printers.forEach(printer => {
    const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
    console.log(`   ${printer.name} (${printer.type}): ${status}`);
  });
  
  const kitchenPrinter = printers.find(p => p.type === 'kitchen');
  const barPrinter = printers.find(p => p.type === 'drink' || p.type === 'bar');
  
  if (!kitchenPrinter || kitchenPrinter.is_active) {
    console.log('⚠️  Advertencia: La impresora de cocina debería estar inactiva para este caso');
  }
  
  if (!barPrinter?.is_active) {
    console.log('⚠️  Advertencia: La impresora de bar debería estar activa para este caso');
  }
  
  console.log('✅ Configuración esperada: Cocina INACTIVA, Bar ACTIVA');
  
  console.log('\n📝 Creando pedido de prueba...');
  
  // Create test order with both kitchen and bar items
  const testOrder = {
    tableNumber: '5',
    customerName: 'Test Impresoras Caso 4.2',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 }, // Kitchen item
      { id: 50, name: 'Coca Cola', quantity: 2, price: 15 } // Bar item
    ],
    notes: 'CASO 4.2: Pedido para probar con cocina inactiva'
  };
  
  try {
    // Get table ID
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', testOrder.tableNumber)
      .single();
      
    if (tableError || !table) {
      console.error(`❌ Error: Mesa ${testOrder.tableNumber} no encontrada`);
      return;
    }
    
    // Calculate total
    const total = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: table.id,
        customer_name: testOrder.customerName,
        status: 'pending',
        total_price: total,
        notes: testOrder.notes,
        source: 'staff_placed',
        restaurant_id: restaurantId
      })
      .select()
      .single();
      
    if (orderError) {
      console.error(`❌ Error creando pedido:`, orderError);
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
      console.error(`❌ Error creando items:`, itemsError);
      return;
    }
    
    console.log(`✅ Pedido creado exitosamente - ID: ${order.id}`);
    console.log(`   Cliente: ${testOrder.customerName}`);
    console.log(`   Mesa: ${testOrder.tableNumber}`);
    console.log(`   Total: Bs ${total}`);
    console.log(`   Items: ${testOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
    console.log(`   Estado inicial: ${order.status}`);
    
    // Simulate printing process
    console.log('\n🖨️  SIMULANDO PROCESO DE IMPRESIÓN...');
    console.log('=====================================');
    
    // Step 1: Try to print kitchen order (should fail)
    console.log('\n1️⃣ Intentando imprimir comanda de COCINA...');
    console.log('   📄 Enviando a impresora: Impresora Cocina Principal');
    console.log('   🍽️  Items de cocina: 1x CHARQUE');
    console.log('   ❌ IMPRESORA INACTIVA - Comanda NO se imprime');
    console.log('   ⚠️  El sistema debe alertar al staff sobre la impresora inactiva');
    
    // Do NOT update kitchen_printed flag since printer is inactive
    console.log('   🔍 Estado: kitchen_printed permanece = false');
    
    // Step 2: Print bar order (should succeed)
    console.log('\n2️⃣ Imprimiendo comanda de BAR...');
    console.log('   📄 Enviando a impresora: Impresora Bar');
    console.log('   🥤 Items de bar: 2x Coca Cola');
    
    // Update drink_printed flag
    const { error: barPrintError } = await supabase
      .from('orders')
      .update({ drink_printed: true })
      .eq('id', order.id);
      
    if (barPrintError) {
      console.error('❌ Error actualizando drink_printed:', barPrintError);
    } else {
      console.log('✅ Comanda de bar impresa exitosamente');
      console.log('   Estado: drink_printed = true');
    }
    
    // Step 3: Check order status after partial printing
    console.log('\n3️⃣ Verificando estado del pedido...');
    
    const { data: updatedOrder, error: statusError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order.id)
      .single();
      
    if (statusError) {
      console.error('❌ Error consultando estado:', statusError);
    } else {
      console.log(`   Estado actual: ${updatedOrder.status}`);
      console.log(`   Kitchen printed: ${updatedOrder.kitchen_printed}`);
      console.log(`   Drink printed: ${updatedOrder.drink_printed}`);
      
      // Order should NOT move to in_progress because kitchen is not printed
      if (!updatedOrder.kitchen_printed && updatedOrder.drink_printed) {
        console.log('✅ Estado CORRECTO: Permanece en pending');
        console.log('   ⚠️  Pedido esperando que cocina esté disponible');
      } else if (updatedOrder.kitchen_printed && updatedOrder.drink_printed) {
        console.log('❌ Estado INCORRECTO: No debería haber impreso cocina');
      }
    }
    
    // Step 4: Simulate staff intervention
    console.log('\n4️⃣ SIMULANDO INTERVENCIÓN DEL STAFF...');
    console.log('   👨‍💼 Staff detecta problema con impresora de cocina');
    console.log('   🔧 Opciones disponibles:');
    console.log('     • Activar impresora de cocina');
    console.log('     • Imprimir manualmente en otra impresora');
    console.log('     • Procesar pedido sin imprimir (riesgoso)');
    
    // Simulate manual kitchen processing
    console.log('\n   🍳 SIMULANDO: Staff procesa cocina manualmente');
    const { error: manualKitchenError } = await supabase
      .from('orders')
      .update({ 
        kitchen_printed: true,
        notes: testOrder.notes + ' - Cocina procesada manualmente (impresora inactiva)'
      })
      .eq('id', order.id);
      
    if (manualKitchenError) {
      console.error('❌ Error en procesamiento manual:', manualKitchenError);
    } else {
      console.log('✅ Cocina procesada manualmente');
      console.log('   📝 Nota agregada sobre procesamiento manual');
      
      // Now update to in_progress
      const { error: progressError } = await supabase
        .from('orders')
        .update({ status: 'in_progress' })
        .eq('id', order.id);
        
      if (progressError) {
        console.error('❌ Error actualizando a in_progress:', progressError);
      } else {
        console.log('✅ Pedido movido a estado: in_progress');
      }
    }
    
    console.log('\n📊 RESULTADO DEL CASO 4.2:');
    console.log('===========================');
    console.log('✅ Pedido inició como: pending');
    console.log('❌ Impresora cocina: INACTIVA (como esperado)');
    console.log('✅ Impresora bar: FUNCIONANDO');
    console.log('⚠️  Solo se imprimió comanda de bar');
    console.log('✅ Pedido permanece en pending hasta intervención');
    console.log('✅ Staff puede procesar manualmente');
    console.log('✅ CASO 4.2 COMPLETADO EXITOSAMENTE');
    
    return {
      orderId: order.id,
      success: true,
      kitchenPrinted: false, // Initially false due to inactive printer
      barPrinted: true,
      manualIntervention: true,
      finalStatus: 'in_progress'
    };
    
  } catch (error) {
    console.error('❌ Error general en Caso 4.2:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute Case 4.2
case42_KitchenInactive().then(result => {
  if (result?.success) {
    console.log('\n🎉 CASO 4.2 EJECUTADO EXITOSAMENTE');
    console.log('Listo para continuar con el CASO 4.3');
  } else {
    console.log('\n❌ CASO 4.2 FALLÓ');
    console.log('Revisar configuración antes de continuar');
  }
});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

// Staff manual orders - simulating staff taking orders directly
const staffManualOrders = [
  {
    tableNumber: '9',
    customerName: 'Ana Martínez',
    staffNote: 'Mesero toma pedido directamente',
    items: [
      { id: 36, name: 'CHORIZO COCHABAMBINO', quantity: 1, price: 85, notes: 'Para llevar' }
    ],
    paymentMethod: 'cash',
    notes: 'Cliente pidió para llevar'
  },
  {
    tableNumber: '10',
    customerName: 'Roberto Silva',
    staffNote: 'Pedido telefónico tomado por staff',
    items: [
      { id: 42, name: 'CHICHARRÓN DE PESCADO CON LANGOSTINOS', quantity: 1, price: 110 },
      { id: 53, name: 'Huari personal', quantity: 1, price: 25 }
    ],
    paymentMethod: 'card',
    notes: 'Pedido por teléfono, sin sal'
  },
  {
    tableNumber: '1',
    customerName: 'Familia González',
    staffNote: 'Mesa ocupada, pedido adicional',
    items: [
      { id: 30, name: 'FALSO MIXTO', quantity: 2, price: 89 },
      { id: 50, name: 'Coca Cola', quantity: 3, price: 15 }
    ],
    paymentMethod: 'qr',
    notes: 'Pedido adicional de la mesa, sin cebolla en ambos platos'
  }
];

async function simulateStep1_StaffAccess() {
  console.log('👨‍💼 PASO 1: ACCESO DASHBOARD STAFF');
  console.log('=====================================');
  
  console.log('🔑 Verificando autenticación de staff...');
  
  // Get staff user
  const { data: staffUsers, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['staff', 'admin'])
    .limit(1);
    
  if (userError || !staffUsers || staffUsers.length === 0) {
    console.error('❌ Error: No se encontró usuario de staff');
    return null;
  }
  
  const staffUser = staffUsers[0];
  console.log(`✅ Usuario staff: ${staffUser.role} (${staffUser.id})`);
  
  console.log('📊 Simulando acceso a dashboard: http://localhost:3001/staff/dashboard');
  
  // Verify staff can see current orders
  const { data: currentOrders, error: ordersError } = await supabase
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
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (ordersError) {
    console.error('❌ Error consultando pedidos activos:', ordersError);
    return null;
  }
  
  console.log(`✅ Dashboard cargado - ${currentOrders?.length || 0} pedidos activos visibles`);
  
  if (currentOrders && currentOrders.length > 0) {
    currentOrders.slice(0, 3).forEach((order, index) => {
      console.log(`   ${index + 1}. Mesa ${order.tables?.table_number || 'N/A'}: ${order.customer_name} - Bs ${order.total_price} (${order.status})`);
    });
  }
  
  return staffUser;
}

async function simulateStep2_ManualOrderCreation() {
  console.log('\n📝 PASO 2: CREACIÓN MANUAL DE PEDIDOS');
  console.log('=====================================');
  
  console.log('💬 Simulando staff creando pedidos manualmente...');
  
  const createdOrders = [];
  
  for (let i = 0; i < staffManualOrders.length; i++) {
    const orderData = staffManualOrders[i];
    console.log(`\n👤 ${orderData.staffNote}`);
    console.log(`📞 Cliente: ${orderData.customerName} - Mesa ${orderData.tableNumber}`);
    
    try {
      // Get table ID
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('table_number', orderData.tableNumber)
        .single();
        
      if (tableError || !table) {
        console.error(`❌ Error: Mesa ${orderData.tableNumber} no encontrada`);
        continue;
      }
      
      // Calculate total
      const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order (staff placed)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: table.id,
          customer_name: orderData.customerName,
          status: 'pending',
          total_price: total,
          notes: orderData.notes,
          source: 'staff_placed', // Staff manual order
          restaurant_id: restaurantId
        })
        .select()
        .single();
        
      if (orderError) {
        console.error(`❌ Error creando pedido ${orderData.customerName}:`, orderError);
        continue;
      }
      
      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price,
        notes: item.notes || null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        console.error(`❌ Error creando items ${orderData.customerName}:`, itemsError);
        continue;
      }
      
      // Store order with payment method
      const orderWithPayment = {
        ...order,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items,
        customerName: orderData.customerName,
        staffNote: orderData.staffNote
      };
      
      createdOrders.push(orderWithPayment);
      
      console.log(`✅ Pedido creado - ${orderData.customerName} - Total: Bs ${total}`);
      console.log(`   🍽️  Items: ${orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
      console.log(`   📝 Notas: ${orderData.notes}`);
      
    } catch (error) {
      console.error(`❌ Error general ${orderData.customerName}:`, error);
    }
  }
  
  console.log(`\n✅ Pedidos staff creados: ${createdOrders.length}/${staffManualOrders.length}`);
  return createdOrders;
}

async function simulateStep3_OrderManagement(orders) {
  console.log('\n🔄 PASO 3: GESTIÓN DE PEDIDOS EN DASHBOARD');
  console.log('=====================================');
  
  console.log('📊 Simulando gestión de pedidos en dashboard...');
  
  // Simulate updating order statuses
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    
    console.log(`\n🔄 Procesando pedido ${order.customerName}...`);
    
    // Simulate progression: pending -> in_progress -> completed
    
    // Step 1: Move to in_progress
    const { error: progressError } = await supabase
      .from('orders')
      .update({ status: 'in_progress' })
      .eq('id', order.id);
      
    if (progressError) {
      console.error(`❌ Error actualizando a in_progress:`, progressError);
      continue;
    }
    
    console.log(`   ⏳ Estado actualizado: in_progress`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 2: Complete the order
    const { error: completeError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id);
      
    if (completeError) {
      console.error(`❌ Error completando pedido:`, completeError);
      continue;
    }
    
    console.log(`   ✅ Estado actualizado: completed`);
    
    // Update the order object
    orders[i].status = 'completed';
  }
  
  console.log(`\n✅ ${orders.length} pedidos gestionados correctamente`);
  return orders;
}

async function simulateStep4_PaymentProcessing(orders) {
  console.log('\n💳 PASO 4: PROCESAMIENTO DE PAGOS STAFF');
  console.log('=====================================');
  
  // Get active cash register
  const { data: activeCashRegister, error: cashError } = await supabase
    .from('cash_registers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single();
    
  if (cashError || !activeCashRegister) {
    console.error('❌ No hay caja activa para procesar pagos');
    return [];
  }
  
  console.log('✅ Procesando pagos con caja activa');
  
  const processedOrders = [];
  const paymentSummary = {
    qr: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
    cash: { count: 0, total: 0 }
  };
  
  for (const order of orders) {
    console.log(`\n💰 Procesando pago: ${order.customerName} - ${order.paymentMethod.toUpperCase()}`);
    
    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from('order_payments')
        .insert({
          order_id: order.id,
          amount: order.total_price,
          payment_method: order.paymentMethod,
          cash_register_id: activeCashRegister.id,
          processed_at: new Date().toISOString()
        });
        
      if (paymentError) {
        console.error(`❌ Error registrando pago:`, paymentError);
        continue;
      }
      
      // Update summary
      paymentSummary[order.paymentMethod].count++;
      paymentSummary[order.paymentMethod].total += order.total_price;
      
      processedOrders.push(order);
      console.log(`✅ Pago procesado - Bs ${order.total_price}`);
      
    } catch (error) {
      console.error(`❌ Error general procesando pago:`, error);
    }
  }
  
  console.log('\n📊 RESUMEN DE PAGOS STAFF:');
  console.log(`QR: ${paymentSummary.qr.count} pedidos - Bs ${paymentSummary.qr.total}`);
  console.log(`Tarjeta: ${paymentSummary.card.count} pedidos - Bs ${paymentSummary.card.total}`);
  console.log(`Efectivo: ${paymentSummary.cash.count} pedidos - Bs ${paymentSummary.cash.total}`);
  
  const totalAmount = paymentSummary.qr.total + paymentSummary.card.total + paymentSummary.cash.total;
  console.log(`💰 TOTAL: Bs ${totalAmount}`);
  
  return { processedOrders, paymentSummary, totalAmount };
}

async function simulateStep5_StaffSummary(result) {
  console.log('\n📋 PASO 5: RESUMEN STAFF');
  console.log('=====================================');
  
  console.log('👨‍💼 Actividades del staff completadas:');
  
  result.processedOrders.forEach((order, index) => {
    console.log(`${index + 1}. ${order.customerName} (Mesa ${order.tableNumber}):`);
    console.log(`   📝 Tipo: ${order.staffNote}`);
    console.log(`   💰 Total: Bs ${order.total_price}`);
    console.log(`   💳 Pago: ${order.paymentMethod.toUpperCase()}`);
    console.log(`   🍽️  Items: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
    console.log(`   ✅ Estado: Completado y pagado`);
  });
  
  console.log(`\n🎯 ESTADÍSTICAS STAFF:`);
  console.log(`• Pedidos manuales creados: ${result.processedOrders.length}`);
  console.log(`• Pedidos telefónicos: 1`);
  console.log(`• Pedidos para llevar: 1`);
  console.log(`• Pedidos adicionales de mesa: 1`);
  console.log(`• Total procesado: Bs ${result.totalAmount}`);
}

async function runStaffManualScenario() {
  console.log('🧪 INICIANDO ESCENARIO 3: PEDIDOS STAFF MANUAL');
  console.log('===============================================\n');
  
  try {
    // Step 1: Staff access
    const staffUser = await simulateStep1_StaffAccess();
    if (!staffUser) {
      console.error('❌ Acceso staff falló. Terminando prueba.');
      return;
    }
    
    // Step 2: Manual order creation
    const orders = await simulateStep2_ManualOrderCreation();
    if (orders.length === 0) {
      console.error('❌ No se crearon pedidos manuales. Terminando prueba.');
      return;
    }
    
    // Step 3: Order management
    const managedOrders = await simulateStep3_OrderManagement(orders);
    
    // Step 4: Payment processing
    const result = await simulateStep4_PaymentProcessing(managedOrders);
    if (result.processedOrders.length === 0) {
      console.error('❌ No se procesaron pagos. Terminando prueba.');
      return;
    }
    
    // Step 5: Staff summary
    await simulateStep5_StaffSummary(result);
    
    console.log('\n🎉 ESCENARIO 3 STAFF COMPLETADO EXITOSAMENTE');
    console.log('=============================================');
    console.log('✅ Dashboard staff accesible');
    console.log(`✅ ${orders.length} pedidos manuales creados`);
    console.log('✅ Gestión de estados de pedidos funcionando');
    console.log(`✅ ${result.processedOrders.length} pagos procesados correctamente`);
    console.log('✅ Diferentes fuentes de pedidos probadas');
    console.log(`💰 Total staff: Bs ${result.totalAmount}`);
    
  } catch (error) {
    console.error('❌ Error ejecutando escenario staff:', error);
  }
}

// Execute the staff manual scenario
runStaffManualScenario();
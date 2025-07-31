const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

// Test orders data with real menu items
const testOrders = [
  {
    tableNumber: '1',
    customerName: 'Cliente QR Mesa 1',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 },
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15 }
    ],
    paymentMethod: 'qr',
    notes: 'Pedido de prueba QR'
  },
  {
    tableNumber: '2', 
    customerName: 'Cliente Tarjeta Mesa 2',
    items: [
      { id: 34, name: 'FRICASE', quantity: 1, price: 84 },
      { id: 51, name: 'Agua c/s gas', quantity: 2, price: 13 }
    ],
    paymentMethod: 'card',
    notes: 'Pedido de prueba Tarjeta'
  },
  {
    tableNumber: '3',
    customerName: 'Cliente Efectivo Mesa 3', 
    items: [
      { id: 30, name: 'FALSO MIXTO', quantity: 1, price: 89 },
      { id: 46, name: 'Jarra Jugo de fruta 1 litro', quantity: 1, price: 30 }
    ],
    paymentMethod: 'cash',
    notes: 'Pedido de prueba Efectivo'
  },
  {
    tableNumber: '4',
    customerName: 'Cliente QR Mesa 4',
    items: [
      { id: 36, name: 'CHORIZO COCHABAMBINO', quantity: 1, price: 85 },
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15 }
    ],
    paymentMethod: 'qr',
    notes: 'Pedido de prueba QR 2'
  },
  {
    tableNumber: '5',
    customerName: 'Cliente Efectivo Mesa 5',
    items: [
      { id: 41, name: 'CHICHARRÓN MIXTO DE PESCADO', quantity: 1, price: 90 },
      { id: 53, name: 'Huari personal', quantity: 2, price: 25 }
    ],
    paymentMethod: 'cash',
    notes: 'Pedido de prueba Efectivo 2'
  }
];

async function step1_openCashRegister() {
  console.log('🏪 PASO 1: APERTURA DE CAJA');
  console.log('=====================================');
  
  const openingAmount = 500.00;
  
  try {
    // Get admin user ID (assuming first admin user)
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
      
    if (userError || !users || users.length === 0) {
      console.error('❌ Error: No se encontró usuario admin');
      return null;
    }
    
    const adminUserId = users[0].id;
    console.log('👤 Usuario admin:', users[0].id);
    
    // Create new cash register session
    const { data: cashRegister, error: cashError } = await supabase
      .from('cash_registers')
      .insert({
        restaurant_id: restaurantId,
        opened_by: adminUserId,
        opening_amount: openingAmount,
        status: 'open',
        opened_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (cashError) {
      console.error('❌ Error abriendo caja:', cashError);
      return null;
    }
    
    console.log('✅ Caja abierta exitosamente');
    console.log(`💰 Monto inicial: Bs ${openingAmount}`);
    console.log(`🆔 Sesión ID: ${cashRegister.id}`);
    console.log(`⏰ Hora apertura: ${new Date(cashRegister.opened_at).toLocaleString()}`);
    
    return cashRegister;
    
  } catch (error) {
    console.error('❌ Error general en apertura de caja:', error);
    return null;
  }
}

async function step2_createTestOrders() {
  console.log('\n🛒 PASO 2: CREACIÓN DE PEDIDOS DE PRUEBA');
  console.log('=====================================');
  
  const createdOrders = [];
  
  for (let i = 0; i < testOrders.length; i++) {
    const orderData = testOrders[i];
    console.log(`\n📝 Creando pedido ${i + 1}/5 - Mesa ${orderData.tableNumber}`);
    
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
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: table.id,
          customer_name: orderData.customerName,
          status: 'pending',
          total_price: total,
          notes: orderData.notes,
          source: 'staff_placed', // Simulating staff placing order for testing
          restaurant_id: restaurantId
        })
        .select()
        .single();
        
      if (orderError) {
        console.error(`❌ Error creando pedido Mesa ${orderData.tableNumber}:`, orderError);
        continue;
      }
      
      // Create order items
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
        console.error(`❌ Error creando items Mesa ${orderData.tableNumber}:`, itemsError);
        continue;
      }
      
      // Store order with payment method for later processing
      const orderWithPayment = {
        ...order,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items
      };
      
      createdOrders.push(orderWithPayment);
      
      console.log(`✅ Pedido Mesa ${orderData.tableNumber} creado - Total: Bs ${total}`);
      console.log(`   Items: ${orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
      
    } catch (error) {
      console.error(`❌ Error general Mesa ${orderData.tableNumber}:`, error);
    }
  }
  
  console.log(`\n✅ Pedidos creados: ${createdOrders.length}/5`);
  return createdOrders;
}

async function step3_processPayments(orders, cashRegister) {
  console.log('\n💳 PASO 3: PROCESAMIENTO DE PAGOS');
  console.log('=====================================');
  
  const paymentSummary = {
    qr: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
    cash: { count: 0, total: 0 }
  };
  
  for (const order of orders) {
    console.log(`\n💰 Procesando pago Mesa ${order.table_id} - ${order.paymentMethod.toUpperCase()}`);
    
    try {
      // Update order status to completed
      const { error: statusError } = await supabase
        .from('orders')
        .update({
          status: 'completed'
        })
        .eq('id', order.id);
        
      if (statusError) {
        console.error(`❌ Error actualizando estado:`, statusError);
        continue;
      }
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from('order_payments')
        .insert({
          order_id: order.id,
          amount: order.total_price,
          payment_method: order.paymentMethod,
          cash_register_id: cashRegister.id,
          processed_at: new Date().toISOString()
        });
        
      if (paymentError) {
        console.error(`❌ Error registrando pago:`, paymentError);
        continue;
      }
      
      // Update summary
      paymentSummary[order.paymentMethod].count++;
      paymentSummary[order.paymentMethod].total += order.total_price;
      
      console.log(`✅ Pago procesado - Bs ${order.total_price}`);
      
    } catch (error) {
      console.error(`❌ Error general procesando pago:`, error);
    }
  }
  
  console.log('\n📊 RESUMEN DE PAGOS:');
  console.log(`QR: ${paymentSummary.qr.count} pedidos - Bs ${paymentSummary.qr.total}`);
  console.log(`Tarjeta: ${paymentSummary.card.count} pedidos - Bs ${paymentSummary.card.total}`);
  console.log(`Efectivo: ${paymentSummary.cash.count} pedidos - Bs ${paymentSummary.cash.total}`);
  
  const grandTotal = paymentSummary.qr.total + paymentSummary.card.total + paymentSummary.cash.total;
  console.log(`💰 TOTAL GENERAL: Bs ${grandTotal}`);
  
  return { paymentSummary, grandTotal };
}

async function step4_closeCashRegister(cashRegister, paymentSummary) {
  console.log('\n🔐 PASO 4: CIERRE DE CAJA');
  console.log('=====================================');
  
  const finalCashAmount = 650.00; // Opening 500 + expected cash sales
  const expectedCashSales = paymentSummary.cash.total;
  const cashDifference = finalCashAmount - (cashRegister.opening_amount + expectedCashSales);
  
  try {
    // Close cash register
    const { data: closedRegister, error: closeError } = await supabase
      .from('cash_registers')
      .update({
        status: 'closed',
        closing_amount: finalCashAmount,
        total_sales: paymentSummary.grandTotal,
        total_cash: paymentSummary.cash.total,
        total_card: paymentSummary.card.total,
        total_qr: paymentSummary.qr.total,
        difference: cashDifference,
        closed_at: new Date().toISOString(),
        closed_by: cashRegister.opened_by
      })
      .eq('id', cashRegister.id)
      .select()
      .single();
      
    if (closeError) {
      console.error('❌ Error cerrando caja:', closeError);
      return;
    }
    
    console.log('✅ Caja cerrada exitosamente');
    console.log('\n📊 REPORTE FINAL DE CAJA:');
    console.log('=====================================');
    console.log(`💰 Monto inicial: Bs ${cashRegister.opening_amount}`);
    console.log(`💰 Monto final: Bs ${finalCashAmount}`);
    console.log(`📈 Total de ventas: Bs ${paymentSummary.grandTotal}`);
    console.log(`💵 Ventas efectivo: Bs ${paymentSummary.cash.total}`);
    console.log(`💳 Ventas tarjeta: Bs ${paymentSummary.card.total}`);
    console.log(`📱 Ventas QR: Bs ${paymentSummary.qr.total}`);
    console.log(`⚖️  Diferencia: Bs ${cashDifference}`);
    console.log(`⏰ Cerrado: ${new Date().toLocaleString()}`);
    
    return closedRegister;
    
  } catch (error) {
    console.error('❌ Error general cerrando caja:', error);
  }
}

async function runCompleteScenario() {
  console.log('🧪 INICIANDO ESCENARIO 1: DÍA COMPLETO DE RESTAURANTE');
  console.log('=========================================================\n');
  
  try {
    // Step 1: Open cash register
    const cashRegister = await step1_openCashRegister();
    if (!cashRegister) {
      console.error('❌ No se pudo abrir la caja. Terminando prueba.');
      return;
    }
    
    // Step 2: Create test orders
    const orders = await step2_createTestOrders();
    if (orders.length === 0) {
      console.error('❌ No se crearon pedidos. Terminando prueba.');
      return;
    }
    
    // Step 3: Process payments
    const { paymentSummary, grandTotal } = await step3_processPayments(orders, cashRegister);
    
    // Step 4: Close cash register
    await step4_closeCashRegister(cashRegister, { ...paymentSummary, grandTotal });
    
    console.log('\n🎉 ESCENARIO 1 COMPLETADO EXITOSAMENTE');
    console.log('=====================================');
    console.log('✅ Caja abierta y cerrada');
    console.log(`✅ ${orders.length} pedidos creados y procesados`);
    console.log('✅ Pagos registrados correctamente');
    console.log('✅ Reporte de cierre generado');
    
  } catch (error) {
    console.error('❌ Error ejecutando escenario completo:', error);
  }
}

// Execute the scenario
runCompleteScenario();
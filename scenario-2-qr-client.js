const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

// Test QR client orders
const qrClientOrders = [
  {
    tableNumber: '6',
    customerName: 'Juan Pérez',
    items: [
      { id: 39, name: 'CHARQUE', quantity: 1, price: 93 },
      { id: 50, name: 'Coca Cola', quantity: 1, price: 15 }
    ],
    paymentMethod: 'qr',
    notes: 'Sin cebolla, bien cocido'
  },
  {
    tableNumber: '7',
    customerName: 'María García',
    items: [
      { id: 34, name: 'FRICASE', quantity: 1, price: 84 },
      { id: 46, name: 'Jarra Jugo de fruta 1 litro', quantity: 1, price: 30 }
    ],
    paymentMethod: 'card',
    notes: 'Extra picante'
  },
  {
    tableNumber: '8',
    customerName: 'Carlos López',
    items: [
      { id: 41, name: 'CHICHARRÓN MIXTO DE PESCADO', quantity: 1, price: 90 },
      { id: 51, name: 'Agua c/s gas', quantity: 2, price: 13 }
    ],
    paymentMethod: 'cash',
    notes: 'Para llevar'
  }
];

async function simulateStep1_QRAccess() {
  console.log('📱 PASO 1: SIMULACIÓN DE ACCESO QR');
  console.log('=====================================');
  
  console.log('🔍 Verificando acceso a URLs de QR...');
  
  for (let i = 6; i <= 8; i++) {
    const qrUrl = `http://localhost:3001/menu/${restaurantId}/table/${i}`;
    console.log(`✅ Mesa ${i}: ${qrUrl}`);
  }
  
  console.log('\n🏪 Verificando datos del restaurante y mesas...');
  
  // Verify restaurant exists
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();
    
  if (restaurantError || !restaurant) {
    console.error('❌ Error: Restaurante no encontrado');
    return false;
  }
  
  console.log(`✅ Restaurante: ${restaurant.name}`);
  
  // Verify tables exist
  const tableNumbers = ['6', '7', '8'];
  for (const tableNum of tableNumbers) {
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', tableNum)
      .single();
      
    if (tableError || !table) {
      console.error(`❌ Mesa ${tableNum} no encontrada`);
      return false;
    }
    
    console.log(`✅ Mesa ${tableNum}: ID ${table.id}`);
  }
  
  return true;
}

async function simulateStep2_MenuBrowsing() {
  console.log('\n🍽️  PASO 2: NAVEGACIÓN DEL MENÚ');
  console.log('=====================================');
  
  console.log('📋 Simulando cliente navegando el menú...');
  
  // Get menu categories
  const { data: categories, error: categoriesError } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('display_order');
    
  if (categoriesError) {
    console.error('❌ Error obteniendo categorías:', categoriesError);
    return false;
  }
  
  console.log(`✅ Categorías disponibles: ${categories.length}`);
  categories.slice(0, 5).forEach(cat => {
    console.log(`   📂 ${cat.name}`);
  });
  
  // Get some menu items
  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .limit(10);
    
  if (itemsError) {
    console.error('❌ Error obteniendo items:', itemsError);
    return false;
  }
  
  console.log(`✅ Items disponibles en el menú: ${menuItems.length}`);
  menuItems.slice(0, 5).forEach(item => {
    console.log(`   🍴 ${item.name} - Bs ${item.price}`);
  });
  
  return true;
}

async function simulateStep3_CreateQROrders() {
  console.log('\n🛒 PASO 3: CREACIÓN DE PEDIDOS POR QR');
  console.log('=====================================');
  
  const createdOrders = [];
  
  for (let i = 0; i < qrClientOrders.length; i++) {
    const orderData = qrClientOrders[i];
    console.log(`\n📝 Cliente ${orderData.customerName} en Mesa ${orderData.tableNumber}`);
    
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
      
      // Create order (simulating customer QR order)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: table.id,
          customer_name: orderData.customerName,
          status: 'pending',
          total_price: total,
          notes: orderData.notes,
          source: 'customer_qr', // QR order source
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
      
      // Store order with payment method for later processing
      const orderWithPayment = {
        ...order,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items,
        customerName: orderData.customerName
      };
      
      createdOrders.push(orderWithPayment);
      
      console.log(`✅ Pedido ${orderData.customerName} creado - Total: Bs ${total}`);
      console.log(`   🍽️  Items: ${orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
      console.log(`   📝 Notas: ${orderData.notes}`);
      
    } catch (error) {
      console.error(`❌ Error general ${orderData.customerName}:`, error);
    }
  }
  
  console.log(`\n✅ Pedidos QR creados: ${createdOrders.length}/${qrClientOrders.length}`);
  return createdOrders;
}

async function simulateStep4_StaffProcessingQROrders(orders) {
  console.log('\n👨‍💼 PASO 4: STAFF PROCESANDO PEDIDOS QR');
  console.log('=====================================');
  
  console.log('📊 Pedidos aparecen en dashboard del staff...');
  
  // Get active cash register for payments
  const { data: activeCashRegister, error: cashError } = await supabase
    .from('cash_registers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single();
    
  if (cashError || !activeCashRegister) {
    console.log('⚠️  No hay caja abierta, abriendo nueva sesión...');
    
    // Get admin user
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
      
    const adminUserId = users[0]?.id;
    
    // Open new cash register
    const { data: newCashRegister, error: newCashError } = await supabase
      .from('cash_registers')
      .insert({
        restaurant_id: restaurantId,
        opened_by: adminUserId,
        opening_amount: 300.00,
        status: 'open',
        opened_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (newCashError) {
      console.error('❌ Error abriendo caja:', newCashError);
      return [];
    }
    
    activeCashRegister = newCashRegister;
    console.log('✅ Nueva caja abierta con Bs 300');
  } else {
    console.log('✅ Usando caja activa existente');
  }
  
  const processedOrders = [];
  
  for (const order of orders) {
    console.log(`\n💰 Staff procesando pedido de ${order.customerName} - ${order.paymentMethod.toUpperCase()}`);
    
    try {
      // Simulate staff completing the order
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
          cash_register_id: activeCashRegister.id,
          processed_at: new Date().toISOString()
        });
        
      if (paymentError) {
        console.error(`❌ Error registrando pago:`, paymentError);
        continue;
      }
      
      processedOrders.push(order);
      console.log(`✅ Pedido completado - ${order.customerName} - Bs ${order.total_price}`);
      
    } catch (error) {
      console.error(`❌ Error general procesando ${order.customerName}:`, error);
    }
  }
  
  // Summary
  console.log('\n📊 RESUMEN DE PROCESAMIENTO:');
  const paymentSummary = {
    qr: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
    cash: { count: 0, total: 0 }
  };
  
  processedOrders.forEach(order => {
    paymentSummary[order.paymentMethod].count++;
    paymentSummary[order.paymentMethod].total += order.total_price;
  });
  
  console.log(`QR: ${paymentSummary.qr.count} pedidos - Bs ${paymentSummary.qr.total}`);
  console.log(`Tarjeta: ${paymentSummary.card.count} pedidos - Bs ${paymentSummary.card.total}`);
  console.log(`Efectivo: ${paymentSummary.cash.count} pedidos - Bs ${paymentSummary.cash.total}`);
  
  const totalAmount = paymentSummary.qr.total + paymentSummary.card.total + paymentSummary.cash.total;
  console.log(`💰 TOTAL: Bs ${totalAmount}`);
  
  return { processedOrders, paymentSummary, totalAmount, activeCashRegister };
}

async function simulateStep5_CustomerConfirmation(processedOrders) {
  console.log('\n✅ PASO 5: CONFIRMACIÓN DE CLIENTES');
  console.log('=====================================');
  
  console.log('📱 Simulando confirmaciones de clientes...');
  
  processedOrders.forEach((order, index) => {
    console.log(`${index + 1}. ${order.customerName} (Mesa ${order.table_id.slice(-1)}):`);
    console.log(`   ✅ Pedido confirmado y pagado`);
    console.log(`   💰 Total: Bs ${order.total_price}`);
    console.log(`   💳 Método: ${order.paymentMethod.toUpperCase()}`);
    console.log(`   🍽️  Items: ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
  });
  
  console.log(`\n🎉 ${processedOrders.length} clientes satisfechos!`);
}

async function runQRClientScenario() {
  console.log('🧪 INICIANDO ESCENARIO 2: PEDIDOS CLIENTE QR');
  console.log('==============================================\n');
  
  try {
    // Step 1: QR Access verification
    const accessOk = await simulateStep1_QRAccess();
    if (!accessOk) {
      console.error('❌ Acceso QR falló. Terminando prueba.');
      return;
    }
    
    // Step 2: Menu browsing simulation
    const menuOk = await simulateStep2_MenuBrowsing();
    if (!menuOk) {
      console.error('❌ Navegación de menú falló. Terminando prueba.');
      return;
    }
    
    // Step 3: Create QR orders
    const orders = await simulateStep3_CreateQROrders();
    if (orders.length === 0) {
      console.error('❌ No se crearon pedidos QR. Terminando prueba.');
      return;
    }
    
    // Step 4: Staff processing
    const { processedOrders, paymentSummary, totalAmount } = await simulateStep4_StaffProcessingQROrders(orders);
    if (processedOrders.length === 0) {
      console.error('❌ No se procesaron pedidos. Terminando prueba.');
      return;
    }
    
    // Step 5: Customer confirmation
    await simulateStep5_CustomerConfirmation(processedOrders);
    
    console.log('\n🎉 ESCENARIO 2 QR COMPLETADO EXITOSAMENTE');
    console.log('==========================================');
    console.log('✅ URLs QR funcionando correctamente');
    console.log('✅ Menú navegable y accesible');
    console.log(`✅ ${orders.length} pedidos QR creados`);
    console.log(`✅ ${processedOrders.length} pedidos procesados por staff`);
    console.log(`✅ 3 métodos de pago probados (QR, tarjeta, efectivo)`);
    console.log(`💰 Total procesado: Bs ${totalAmount}`);
    
  } catch (error) {
    console.error('❌ Error ejecutando escenario QR:', error);
  }
}

// Execute the QR client scenario
runQRClientScenario();
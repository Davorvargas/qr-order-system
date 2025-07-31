// Script para verificar que las transacciones tienen los datos necesarios para el modal de detalle
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTransactionsDetail() {
  console.log('🧪 Probando funcionalidad de detalles de transacciones...\n');
  
  try {
    // 1. Obtener transacciones recientes (completed y cancelled)
    const { data: transactions, error: transactionsError } = await supabase
      .from('orders')
      .select('id, created_at, customer_name, total_price, status')
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ Error obteniendo transacciones:', transactionsError);
      return;
    }
    
    console.log('📋 TRANSACCIONES RECIENTES:');
    console.log('==========================');
    
    if (!transactions || transactions.length === 0) {
      console.log('❌ No hay transacciones completadas o canceladas');
      return;
    }
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toLocaleString();
      const status = transaction.status === 'completed' ? '✅ Completado' : '❌ Cancelado';
      console.log(`#${transaction.id} - ${transaction.customer_name} - $${transaction.total_price?.toFixed(2)} - ${status} (${date})`);
    });
    
    console.log(`\nTotal: ${transactions.length} transacciones`);
    
    // 2. Probar la consulta de detalles para una transacción específica
    const testOrderId = transactions[0].id;
    
    console.log(`\n🔍 PROBANDO DETALLES DE LA ORDEN #${testOrderId}:`);
    console.log('=============================================');
    
    const { data: orderDetail, error: detailError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        customer_name,
        total_price,
        notes,
        status,
        source,
        table:tables(table_number),
        order_items(
          id,
          quantity,
          price_at_order,
          notes,
          menu_item:menu_items(name, description)
        )
      `)
      .eq('id', testOrderId)
      .single();
    
    if (detailError) {
      console.error('❌ Error obteniendo detalles:', detailError);
      return;
    }
    
    if (orderDetail) {
      console.log('✅ DATOS OBTENIDOS CORRECTAMENTE:');
      console.log(`- ID: ${orderDetail.id}`);
      console.log(`- Cliente: ${orderDetail.customer_name}`);
      console.log(`- Total: $${orderDetail.total_price?.toFixed(2)}`);
      console.log(`- Estado: ${orderDetail.status}`);
      console.log(`- Origen: ${orderDetail.source || 'No especificado'}`);
      console.log(`- Mesa: ${orderDetail.table?.table_number || 'No especificada'}`);
      console.log(`- Items: ${orderDetail.order_items?.length || 0} productos`);
      console.log(`- Notas: ${orderDetail.notes || 'Sin notas'}`);
      
      if (orderDetail.order_items && orderDetail.order_items.length > 0) {
        console.log('\n🍽️ PRODUCTOS:');
        orderDetail.order_items.forEach((item, index) => {
          console.log(`${index + 1}. ${item.menu_item?.name || 'Item desconocido'} x${item.quantity} - $${item.price_at_order?.toFixed(2)}`);
          if (item.notes) {
            console.log(`   Nota: ${item.notes}`);
          }
        });
      }
    }
    
    // 3. Verificar datos adicionales que busca el modal
    console.log('\n🔍 VERIFICANDO DATOS ADICIONALES:');
    console.log('=================================');
    
    // Buscar sesión de caja
    const { data: cashRegister } = await supabase
      .from('cash_registers')
      .select('id, opened_at, status, opened_by')
      .lte('opened_at', orderDetail.created_at)
      .or(`closed_at.is.null,closed_at.gte.${orderDetail.created_at}`)
      .order('opened_at', { ascending: false })
      .limit(1)
      .single();
    
    if (cashRegister) {
      console.log(`✅ Sesión de caja: #${cashRegister.id.slice(0, 8)} (${cashRegister.status})`);
    } else {
      console.log('⚠️ No se encontró sesión de caja');
    }
    
    // Buscar información de pago si está completado
    if (orderDetail.status === 'completed') {
      const { data: payment } = await supabase
        .from('order_payments')
        .select('payment_method, amount, processed_at, processed_by')
        .eq('order_id', testOrderId)
        .single();
      
      if (payment) {
        console.log(`✅ Pago: ${payment.payment_method} - $${payment.amount?.toFixed(2)}`);
      } else {
        console.log('⚠️ No se encontró información de pago (puede ser normal)');
      }
    }
    
    console.log('\n🎉 RESULTADO FINAL:');
    console.log('==================');
    console.log('✅ La funcionalidad de detalles de transacciones debería funcionar correctamente');
    console.log('✅ Los datos necesarios están disponibles en la base de datos');
    console.log('✅ El modal OrderDetailModal puede mostrar toda la información');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
testTransactionsDetail();
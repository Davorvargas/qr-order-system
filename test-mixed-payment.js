const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMixedPayment() {
  console.log('🧪 TEST: PAGO MIXTO');
  console.log('=====================');

  try {
    // 1. Verificar que hay una caja activa
    const { data: activeCashRegister, error: cashError } = await supabase
      .from('cash_registers')
      .select('*')
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single();

    if (cashError || !activeCashRegister) {
      console.error('❌ No hay caja activa para procesar pagos');
      return;
    }

    console.log('✅ Caja activa encontrada:', activeCashRegister.id);

    // 2. Crear un pedido de prueba
    const testOrder = {
      restaurant_id: 'restaurant-1', // Ajusta según tu configuración
      table_id: 1,
      customer_name: 'Test Pago Mixto',
      total_price: 150.50,
      status: 'pending'
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creando pedido de prueba:', orderError);
      return;
    }

    console.log('✅ Pedido de prueba creado:', order.id);

    // 3. Simular pago mixto
    const qrAmount = Math.round(150.50 * 0.6 * 100) / 100; // 60% = 90.30
    const cashAmount = Math.round((150.50 - qrAmount) * 100) / 100; // 40% = 60.20

    console.log(`💰 Simulando pago mixto:`);
    console.log(`   QR: Bs ${qrAmount.toFixed(2)}`);
    console.log(`   Efectivo: Bs ${cashAmount.toFixed(2)}`);
    console.log(`   Total: Bs ${(qrAmount + cashAmount).toFixed(2)}`);

    // 4. Insertar pagos mixtos
    const payments = [];

    if (qrAmount > 0) {
      payments.push({
        order_id: order.id,
        cash_register_id: activeCashRegister.id,
        payment_method: 'qr',
        amount: qrAmount,
        processed_by: null // En producción sería el ID del usuario
      });
    }

    if (cashAmount > 0) {
      payments.push({
        order_id: order.id,
        cash_register_id: activeCashRegister.id,
        payment_method: 'cash',
        amount: cashAmount,
        processed_by: null
      });
    }

    const { error: paymentError } = await supabase
      .from('order_payments')
      .insert(payments);

    if (paymentError) {
      console.error('❌ Error procesando pagos mixtos:', paymentError);
      return;
    }

    console.log('✅ Pagos mixtos procesados correctamente');

    // 5. Actualizar estado del pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error actualizando estado del pedido:', updateError);
      return;
    }

    console.log('✅ Pedido marcado como completado');

    // 6. Verificar que los pagos se registraron correctamente
    const { data: paymentsData, error: fetchError } = await supabase
      .from('order_payments')
      .select('*')
      .eq('order_id', order.id);

    if (fetchError) {
      console.error('❌ Error consultando pagos:', fetchError);
      return;
    }

    console.log('\n📊 RESUMEN DE PAGOS MIXTOS:');
    paymentsData.forEach(payment => {
      console.log(`   ${payment.payment_method.toUpperCase()}: Bs ${payment.amount.toFixed(2)}`);
    });

    const totalPaid = paymentsData.reduce((sum, p) => sum + p.amount, 0);
    console.log(`   Total pagado: Bs ${totalPaid.toFixed(2)}`);
    console.log(`   Total pedido: Bs ${testOrder.total_price.toFixed(2)}`);
    console.log(`   Diferencia: Bs ${(totalPaid - testOrder.total_price).toFixed(2)}`);

    if (Math.abs(totalPaid - testOrder.total_price) < 0.01) {
      console.log('✅ Pago mixto procesado correctamente');
    } else {
      console.log('❌ Error: Los montos no coinciden');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el test
testMixedPayment(); 
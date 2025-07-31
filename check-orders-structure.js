const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
  console.log('🔍 Verificando estructuras de tablas...');
  
  // Check orders table structure
  console.log('\n📋 TABLA ORDERS:');
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
      
    if (ordersError) {
      console.error('❌ Error consultando orders:', ordersError);
    } else {
      if (orders && orders.length > 0) {
        console.log('✅ Columnas disponibles en orders:');
        Object.keys(orders[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof orders[0][key]} (${orders[0][key]})`);
        });
      } else {
        console.log('📝 Tabla orders existe pero está vacía');
      }
    }
  } catch (err) {
    console.error('❌ Error con tabla orders:', err);
  }
  
  // Check order_items table structure
  console.log('\n🛒 TABLA ORDER_ITEMS:');
  try {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);
      
    if (itemsError) {
      console.error('❌ Error consultando order_items:', itemsError);
    } else {
      if (items && items.length > 0) {
        console.log('✅ Columnas disponibles en order_items:');
        Object.keys(items[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof items[0][key]} (${items[0][key]})`);
        });
      } else {
        console.log('📝 Tabla order_items existe pero está vacía');
      }
    }
  } catch (err) {
    console.error('❌ Error con tabla order_items:', err);
  }
  
  // Check order_payments table structure
  console.log('\n💳 TABLA ORDER_PAYMENTS:');
  try {
    const { data: payments, error: paymentsError } = await supabase
      .from('order_payments')
      .select('*')
      .limit(1);
      
    if (paymentsError) {
      console.error('❌ Error consultando order_payments:', paymentsError);
    } else {
      if (payments && payments.length > 0) {
        console.log('✅ Columnas disponibles en order_payments:');
        Object.keys(payments[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof payments[0][key]} (${payments[0][key]})`);
        });
      } else {
        console.log('📝 Tabla order_payments existe pero está vacía');
        console.log('⚠️  Intentando insertar registro de prueba para ver estructura...');
        
        // Try a minimal insert to see what columns are required
        const { error: testError } = await supabase
          .from('order_payments')
          .insert({
            order_id: 1,
            amount: 10.00,
            payment_method: 'test'
          });
          
        if (testError) {
          console.log('📝 Estructura requerida según error:', testError.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error con tabla order_payments:', err);
  }
  
  // Check cash_registers table structure
  console.log('\n💰 TABLA CASH_REGISTERS:');
  try {
    const { data: registers, error: registersError } = await supabase
      .from('cash_registers')
      .select('*')
      .limit(1);
      
    if (registersError) {
      console.error('❌ Error consultando cash_registers:', registersError);
    } else {
      if (registers && registers.length > 0) {
        console.log('✅ Columnas disponibles en cash_registers:');
        Object.keys(registers[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof registers[0][key]} (${registers[0][key]})`);
        });
      } else {
        console.log('📝 Tabla cash_registers existe pero está vacía');
      }
    }
  } catch (err) {
    console.error('❌ Error con tabla cash_registers:', err);
  }
}

checkTableStructures();
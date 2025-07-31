const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentMethods() {
  console.log('💳 Probando métodos de pago válidos...');
  
  const testMethods = ['qr', 'card', 'cash', 'efectivo', 'tarjeta', 'digital'];
  
  for (const method of testMethods) {
    try {
      console.log(`\n🧪 Probando método: ${method}`);
      
      const { error } = await supabase
        .from('order_payments')
        .insert({
          order_id: 999999, // Non-existent order for testing
          amount: 1.00,
          payment_method: method,
          processed_at: new Date().toISOString()
        });
        
      if (error) {
        if (error.message.includes('violates check constraint')) {
          console.log(`❌ ${method}: No válido - restricción de método`);
        } else if (error.message.includes('violates foreign key constraint')) {
          console.log(`✅ ${method}: Válido (error por order_id inexistente)`);
        } else {
          console.log(`⚠️  ${method}: Error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${method}: Válido - insertado exitosamente`);
      }
      
    } catch (err) {
      console.log(`❌ ${method}: Error: ${err.message}`);
    }
  }
}

async function checkExistingPayments() {
  console.log('\n💰 Verificando pagos existentes...');
  
  const { data: payments, error } = await supabase
    .from('order_payments')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log(`✅ Encontrados ${payments?.length || 0} pagos`);
    if (payments && payments.length > 0) {
      payments.forEach(payment => {
        console.log(`   ID: ${payment.id}, Método: ${payment.payment_method}, Monto: ${payment.amount}`);
      });
    }
  }
}

async function main() {
  await testPaymentMethods();
  await checkExistingPayments();
}

main();
// Script para verificar el estado de las impresoras y probar la lógica
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPrinterStatus() {
  console.log('🔍 Verificando estado de impresoras...\n');
  
  try {
    // Obtener todas las impresoras
    const { data: printers, error: printersError } = await supabase
      .from('printers')
      .select('*')
      .order('created_at');
    
    if (printersError) {
      console.error('Error obteniendo impresoras:', printersError);
      return;
    }
    
    console.log('📋 ESTADO DE IMPRESORAS:');
    console.log('========================');
    
    if (!printers || printers.length === 0) {
      console.log('❌ No hay impresoras configuradas');
      return;
    }
    
    printers.forEach(printer => {
      const status = printer.is_active ? '✅ ACTIVA' : '❌ INACTIVA';
      console.log(`${printer.name} (${printer.type}): ${status}`);
    });
    
    // Contar impresoras activas
    const activePrinters = printers.filter(p => p.is_active);
    console.log(`\n📊 RESUMEN:`);
    console.log(`Total impresoras: ${printers.length}`);
    console.log(`Impresoras activas: ${activePrinters.length}`);
    console.log(`Impresoras inactivas: ${printers.length - activePrinters.length}`);
    
    // Obtener órdenes recientes
    console.log('\n📦 ÓRDENES RECIENTES:');
    console.log('====================');
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, customer_name, created_at, table:tables(table_number)')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (ordersError) {
      console.error('Error obteniendo órdenes:', ordersError);
      return;
    }
    
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        const time = new Date(order.created_at).toLocaleTimeString();
        console.log(`#${order.id} - Mesa ${order.table?.table_number} - ${order.customer_name} - ${order.status} (${time})`);
      });
    } else {
      console.log('No hay órdenes recientes');
    }
    
    // Verificar lógica
    console.log('\n🧠 LÓGICA ESPERADA:');
    console.log('==================');
    if (activePrinters.length === 0) {
      console.log('✅ Como NO hay impresoras activas, las nuevas órdenes deberían ir directamente a "in_progress"');
    } else {
      console.log('⏳ Como HAY impresoras activas, las nuevas órdenes deberían ir a "pending" hasta que se impriman');
    }
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar verificación
verifyPrinterStatus();
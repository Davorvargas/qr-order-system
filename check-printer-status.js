const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function checkPrinterStatus() {
  console.log('🔍 VERIFICANDO ESTADO DE IMPRESORA');
  console.log('================================');
  
  try {
    const { data: printer, error } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('type', 'kitchen')
      .single();
      
    if (error) {
      console.error('❌ Error consultando impresora:', error.message);
      return;
    }
    
    if (!printer) {
      console.log('❌ No se encontró impresora de cocina configurada');
      return;
    }
    
    console.log('📋 ESTADO ACTUAL:');
    console.log(`   ID: ${printer.id}`);
    console.log(`   Nombre: ${printer.name}`);
    console.log(`   Tipo: ${printer.type}`);
    console.log(`   Estado: ${printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA'}`);
    console.log(`   IP: ${printer.ip_address || 'N/A'}`);
    console.log(`   Restaurante: ${printer.restaurant_id}`);
    
    // Mostrar interpretación
    console.log('\n🤖 INTERPRETACIÓN DEL SERVICIO:');
    if (printer.is_active) {
      console.log('   ✅ El servicio DEBERÍA procesar pedidos');
      console.log('   ✅ La impresora DEBERÍA imprimir');
    } else {
      console.log('   ❌ El servicio NO procesará pedidos');
      console.log('   ❌ La impresora NO imprimirá');
    }
    
    return printer.is_active;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function togglePrinterStatus() {
  console.log('\n🔧 CAMBIANDO ESTADO DE IMPRESORA');
  console.log('===============================');
  
  try {
    // Obtener estado actual
    const { data: currentPrinter } = await supabase
      .from('printers')
      .select('is_active')
      .eq('restaurant_id', restaurantId)
      .eq('type', 'kitchen')
      .single();
      
    if (!currentPrinter) {
      console.log('❌ No se encontró impresora');
      return;
    }
    
    const newState = !currentPrinter.is_active;
    
    console.log(`🔄 Cambiando de ${currentPrinter.is_active ? 'ACTIVA' : 'INACTIVA'} a ${newState ? 'ACTIVA' : 'INACTIVA'}`);
    
    const { error } = await supabase
      .from('printers')
      .update({ is_active: newState })
      .eq('restaurant_id', restaurantId)
      .eq('type', 'kitchen');
      
    if (error) {
      console.error('❌ Error actualizando:', error.message);
      return;
    }
    
    console.log(`✅ Estado actualizado: ${newState ? '🟢 ACTIVA' : '🔴 INACTIVA'}`);
    
    // Verificar cambio
    await new Promise(resolve => setTimeout(resolve, 1000));
    await checkPrinterStatus();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--toggle')) {
    await togglePrinterStatus();
  } else {
    await checkPrinterStatus();
  }
  
  console.log('\n💡 USO:');
  console.log('   node check-printer-status.js          # Ver estado actual');
  console.log('   node check-printer-status.js --toggle # Cambiar estado');
}

main();
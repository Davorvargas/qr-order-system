const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function cleanupForSinglePrinter() {
  console.log('🖨️  SIMPLIFICACIÓN A UNA SOLA IMPRESORA');
  console.log('======================================');
  
  console.log('🎯 Configurando sistema para usar solo:');
  console.log('   📍 Star Micronics BSC10 (Raspberry Pi)');
  console.log('   ❌ Eliminando Xprinter (Windows Tablet)\n');
  
  try {
    // 1. Ver estado actual
    console.log('📋 ESTADO ACTUAL:');
    const { data: currentPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    if (currentPrinters) {
      currentPrinters.forEach(printer => {
        const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
        console.log(`   ${printer.name} (${printer.type}): ${status}`);
      });
    }
    
    // 2. Eliminar impresora de bar/drink
    const xprinter = currentPrinters?.find(p => p.type === 'drink' || p.type === 'bar');
    if (xprinter) {
      console.log('\n🗑️  ELIMINANDO XPRINTER...');
      
      const { error: deleteError } = await supabase
        .from('printers')
        .delete()
        .eq('id', xprinter.id);
      
      if (deleteError) {
        console.error('❌ Error eliminando xprinter:', deleteError);
      } else {
        console.log('✅ Xprinter eliminada exitosamente');
      }
    }
    
    // 3. Configurar Star Micronics
    const starPrinter = currentPrinters?.find(p => p.type === 'kitchen');
    if (starPrinter) {
      console.log('\n⚙️  CONFIGURANDO STAR MICRONICS...');
      
      const { error: updateError } = await supabase
        .from('printers')
        .update({
          name: 'Impresora Principal (Star Micronics BSC10)',
          is_active: true
        })
        .eq('id', starPrinter.id);
      
      if (updateError) {
        console.error('❌ Error actualizando:', updateError);
      } else {
        console.log('✅ Star Micronics configurada como única impresora');
      }
    }
    
    // 4. Verificar resultado
    console.log('\n📋 CONFIGURACIÓN FINAL:');
    const { data: finalPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    if (finalPrinters && finalPrinters.length > 0) {
      finalPrinters.forEach(printer => {
        const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
        console.log(`   ${printer.name} (${printer.type}): ${status}`);
      });
    }
    
    const success = finalPrinters?.length === 1;
    console.log(`\n${success ? '✅' : '❌'} Impresoras configuradas: ${finalPrinters?.length || 0} (objetivo: 1)`);
    
    return success;
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return false;
  }
}

async function updateOrdersLogic() {
  console.log('\n📊 NUEVA LÓGICA DE PEDIDOS');
  console.log('===========================');
  
  console.log('🔄 CAMBIOS EN EL FLUJO:');
  console.log('   📝 Antes: kitchen_printed Y drink_printed → in_progress');
  console.log('   📝 Ahora: SOLO kitchen_printed → in_progress');
  console.log('   🗑️  drink_printed: Se ignora (mantener por compatibilidad)');
  
  console.log('\n💡 LÓGICA SIMPLIFICADA:');
  console.log('   1️⃣ Pedido creado → status: pending');
  console.log('   2️⃣ Star imprime → kitchen_printed: true');
  console.log('   3️⃣ Sistema actualiza → status: in_progress');
  console.log('   4️⃣ Staff completa → status: completed');
}

// Execute
cleanupForSinglePrinter().then(success => {
  if (success) {
    updateOrdersLogic();
    console.log('\n🎉 LIMPIEZA COMPLETADA');
    console.log('Sistema configurado para una sola impresora');
  } else {
    console.log('\n❌ Error en limpieza');
  }
});
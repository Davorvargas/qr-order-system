const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function activateRealPrinters() {
  console.log('🔧 ACTIVANDO IMPRESORAS REALES PARA PRUEBAS');
  console.log('===========================================');
  
  try {
    // Activate both printers
    const { error: activateError } = await supabase
      .from('printers')
      .update({ is_active: true })
      .eq('restaurant_id', restaurantId);
      
    if (activateError) {
      console.error('❌ Error activando impresoras:', activateError);
      return false;
    }
    
    // Verify activation
    const { data: printers, error: checkError } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('type');
      
    if (checkError) {
      console.error('❌ Error verificando activación:', checkError);
      return false;
    }
    
    console.log('✅ IMPRESORAS ACTIVADAS:');
    printers.forEach(printer => {
      const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`   ${printer.name} (${printer.type}): ${status}`);
    });
    
    console.log('\n⚠️  IMPORTANTE - VERIFICAR SERVICIOS:');
    console.log('🍳 Raspberry Pi (Cocina):');
    console.log('   • Verificar que printer_service.py está corriendo');
    console.log('   • Star Micronics BSC10 conectada por USB');
    console.log('   • WiFi conectado a Supabase');
    
    console.log('\n🥤 Windows Tablet (Bar):');
    console.log('   • Verificar que xprinter_service.py está corriendo');
    console.log('   • Xprinter XP-T80A conectada por USB');
    console.log('   • WiFi conectado a Supabase');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

// Execute activation
activateRealPrinters().then(success => {
  if (success) {
    console.log('\n🎉 LISTO PARA PRUEBAS REALES');
    console.log('Ahora puedes ejecutar: node real-printer-test.js');
  } else {
    console.log('\n❌ Fallo en activación');
  }
});
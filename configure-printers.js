
// Script para configurar impresoras según escenarios de prueba
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function configurePrinters(scenario) {
  console.log(`🔧 Configurando impresoras para ${scenario}...`);
  
  switch(scenario) {
    case '4.1-todas-activas':
      await supabase.from('printers').update({ is_active: true }).eq('restaurant_id', restaurantId);
      console.log('✅ Todas las impresoras activadas');
      break;
      
    case '4.2-cocina-inactiva':
      await supabase.from('printers').update({ is_active: false }).eq('restaurant_id', restaurantId).eq('type', 'kitchen');
      await supabase.from('printers').update({ is_active: true }).eq('restaurant_id', restaurantId).neq('type', 'kitchen');
      console.log('✅ Cocina inactiva, otras activas');
      break;
      
    case '4.3-todas-inactivas':
      await supabase.from('printers').update({ is_active: false }).eq('restaurant_id', restaurantId);
      console.log('✅ Todas las impresoras desactivadas');
      break;
      
    case '4.4-desconectada':
      await supabase.from('printers').update({ is_active: true, is_online: false }).eq('restaurant_id', restaurantId).eq('type', 'kitchen');
      await supabase.from('printers').update({ is_active: true, is_online: true }).eq('restaurant_id', restaurantId).neq('type', 'kitchen');
      console.log('✅ Cocina activa pero desconectada, otras OK');
      break;
  }
}

// Uso: node configure-printers.js 4.1-todas-activas
const scenario = process.argv[2];
if (scenario) {
  configurePrinters(scenario);
} else {
  console.log('Uso: node configure-printers.js [escenario]');
  console.log('Escenarios disponibles:');
  console.log('  4.1-todas-activas');
  console.log('  4.2-cocina-inactiva');
  console.log('  4.3-todas-inactivas');
  console.log('  4.4-desconectada');
}

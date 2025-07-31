const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrintersSetup() {
  console.log('🖨️  Verificando configuración actual de impresoras...');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  try {
    const { data: printers, error } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('type');
      
    if (error) {
      console.error('❌ Error consultando impresoras:', error);
      return;
    }
    
    if (!printers || printers.length === 0) {
      console.log('❌ No se encontraron impresoras configuradas');
      return;
    }
    
    console.log(`✅ Encontradas ${printers.length} impresoras:`);
    console.log('');
    
    printers.forEach((printer, index) => {
      console.log(`📄 IMPRESORA ${index + 1}:`);
      console.log(`   ID: ${printer.id}`);
      console.log(`   Nombre: ${printer.name}`);
      console.log(`   Tipo: ${printer.type}`);
      console.log(`   Estado: ${printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA'}`);
      console.log(`   IP: ${printer.ip_address || 'No configurada'}`);
      console.log(`   Puerto: ${printer.port || 'No configurado'}`);
      console.log(`   Online: ${printer.is_online ? '✅ Sí' : '❌ No'}`);
      console.log('');
    });
    
    // Análisis para escenarios de prueba
    const activePrinters = printers.filter(p => p.is_active);
    const kitchenPrinter = printers.find(p => p.type === 'kitchen');
    const barPrinter = printers.find(p => p.type === 'bar' || p.type === 'drink');
    const receiptPrinter = printers.find(p => p.type === 'receipt');
    
    console.log('📊 ANÁLISIS PARA ESCENARIOS DE PRUEBA:');
    console.log(`   Impresoras activas: ${activePrinters.length}/${printers.length}`);
    console.log(`   Cocina: ${kitchenPrinter ? (kitchenPrinter.is_active ? '✅ Activa' : '❌ Inactiva') : '❌ No configurada'}`);
    console.log(`   Bar: ${barPrinter ? (barPrinter.is_active ? '✅ Activa' : '❌ Inactiva') : '❌ No configurada'}`);
    console.log(`   Recibo: ${receiptPrinter ? (receiptPrinter.is_active ? '✅ Activa' : '❌ Inactiva') : '❌ No configurada'}`);
    
    console.log('\n🧪 CONFIGURACIÓN PARA ESCENARIOS:');
    console.log('ESCENARIO 4.1 - Todas activas: Necesitamos activar ambas impresoras');
    console.log('ESCENARIO 4.2 - Solo cocina inactiva: Desactivar cocina, activar bar');
    console.log('ESCENARIO 4.3 - Todas inactivas: Desactivar ambas');
    console.log('ESCENARIO 4.4 - Desconectada físicamente: Activar pero simular desconexión');
    
    return {
      printers,
      kitchenPrinter,
      barPrinter,
      receiptPrinter,
      activePrinters
    };
    
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

async function createPrinterConfigurationScript() {
  console.log('\n🔧 Creando script de configuración para escenarios...');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  const script = `
// Script para configurar impresoras según escenarios de prueba
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const restaurantId = '${restaurantId}';

async function configurePrinters(scenario) {
  console.log(\`🔧 Configurando impresoras para \${scenario}...\`);
  
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
`;
  
  require('fs').writeFileSync('./configure-printers.js', script);
  console.log('✅ Script creado: configure-printers.js');
}

async function main() {
  const setup = await checkPrintersSetup();
  await createPrinterConfigurationScript();
  
  console.log('\n🚀 Preparación de impresoras completada!');
  console.log('💡 Usa: node configure-printers.js [escenario] para cambiar configuración');
}

main().catch(console.error);
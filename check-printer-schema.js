const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔍 Verificando estructura de la tabla printers...\n');
    
    // Get one printer to see available columns
    const { data: samplePrinter, error: sampleError } = await supabase
      .from('printers')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error('❌ Error obteniendo muestra:', sampleError.message);
      return;
    }
    
    console.log('📋 Columnas disponibles en la tabla printers:');
    Object.keys(samplePrinter).forEach(key => {
      console.log(`   - ${key}: ${typeof samplePrinter[key]} = ${samplePrinter[key]}`);
    });
    
    console.log('\n📄 Ejemplo de registro completo:');
    console.log(JSON.stringify(samplePrinter, null, 2));
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
})();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🖨️ Agregando impresora Star al restaurante Senderos...\n');
    
    const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    
    // Add Star Printer
    const { data: starPrinter, error: starError } = await supabase
      .from('printers')
      .insert({
        name: 'Impresora Star TSP100',
        type: 'receipt',
        restaurant_id: senderosRestaurantId,
        vendor_id: 2276, // Star vendor ID (0x08e4 = 2276)
        product_id: 256, // TSP100 product ID (0x0100 = 256)  
        is_active: true,
        description: 'Impresora Star TSP100 para recibos - IP: 192.168.1.100:9100',
        location: 'Caja principal',
        status: 'unknown'
      })
      .select()
      .single();
    
    if (starError) {
      console.error('❌ Error agregando impresora Star:', starError.message);
      return;
    }
    
    console.log('✅ Impresora Star agregada exitosamente:');
    console.log(`   - ID: ${starPrinter.id}`);
    console.log(`   - Nombre: ${starPrinter.name}`);
    console.log(`   - Tipo: ${starPrinter.type}`);
    console.log(`   - Vendor ID: ${starPrinter.vendor_id}`);
    console.log(`   - Product ID: ${starPrinter.product_id}`);
    console.log(`   - Descripción: ${starPrinter.description}`);
    console.log(`   - Ubicación: ${starPrinter.location}`);
    console.log(`   - Estado: ${starPrinter.status}`);
    console.log(`   - Activa: ${starPrinter.is_active}`);
    
    // Verify all printers for Senderos
    const { data: allPrinters, error: listError } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', senderosRestaurantId)
      .eq('is_active', true);
    
    if (listError) {
      console.error('❌ Error listando impresoras:', listError.message);
      return;
    }
    
    console.log('\n🏪 Todas las impresoras activas para Senderos:');
    allPrinters.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.name} (${p.type}) - ${p.description || 'Sin descripción'}`);
    });
    
    console.log(`\n✨ Total de impresoras activas: ${allPrinters.length}`);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
})();
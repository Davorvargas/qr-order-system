const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('📋 Verificando configuración actual...\n');
    
    // Get restaurants
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('id, name');
    
    if (restError) throw restError;
    
    console.log('🏪 Restaurantes:');
    restaurants.forEach(r => console.log(`  - ${r.name}: ${r.id}`));
    
    // Get profiles
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, restaurant_id, restaurants(name)');
    
    if (profError) throw profError;
    
    console.log('\n👤 Perfiles de usuario:');
    profiles.forEach(p => {
      const restaurantName = p.restaurants?.name || 'N/A';
      console.log(`  - Usuario ${p.id} -> Restaurant: ${restaurantName} (${p.restaurant_id})`);
    });
    
    // Get current printers
    const { data: printers, error: printError } = await supabase
      .from('printers')
      .select('*, restaurants(name)');
    
    if (printError) throw printError;
    
    console.log('\n🖨️ Impresoras actuales:');
    if (printers.length === 0) {
      console.log('  - No hay impresoras configuradas');
    } else {
      printers.forEach(p => {
        const restaurantName = p.restaurants?.name || 'N/A';
        console.log(`  - ${p.name} (${p.type}) - ${restaurantName} - Activa: ${p.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
// Script para verificar la estructura de mesas en la base de datos
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTablesStructure() {
  console.log('🔍 Verificando estructura de mesas...\n');
  
  try {
    // Verificar mesas existentes
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('*')
      .order('created_at');
    
    if (tablesError) {
      console.error('❌ Error obteniendo mesas:', tablesError);
      return;
    }
    
    console.log('📋 MESAS EN LA BASE DE DATOS:');
    console.log('=============================');
    
    if (!tables || tables.length === 0) {
      console.log('❌ No hay mesas en la base de datos');
      console.log('⚠️  El QRCodeGenerator solo maneja localStorage, no crea mesas reales');
      return;
    }
    
    tables.forEach(table => {
      console.log(`ID: ${table.id}`);
      console.log(`Número: ${table.table_number}`);
      console.log(`Restaurant ID: ${table.restaurant_id}`);
      console.log(`Creada: ${new Date(table.created_at).toLocaleString()}`);
      console.log('-------------------');
    });
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`Total mesas reales: ${tables.length}`);
    
    // Verificar restaurantes
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restaurants && restaurants.length > 0) {
      console.log(`\n🏢 RESTAURANTES:`);
      restaurants.forEach(restaurant => {
        console.log(`- ${restaurant.name} (ID: ${restaurant.id})`);
      });
    }
    
    // Verificar estructura de URLs
    console.log(`\n🔗 ESTRUCTURA DE URLs:`);
    console.log('======================');
    console.log('✅ Ruta existente: /menu/[tableId] (espera UUID de mesa)');  
    console.log('❌ Ruta QR generada: /menu/[restaurantId]/table/[tableNumber]');
    console.log('');
    console.log('💡 SOLUCIONES POSIBLES:');
    console.log('1. Crear la estructura de rutas /menu/[restaurantId]/table/[tableNumber]');
    console.log('2. Cambiar QRCodeGenerator para usar UUIDs de mesa reales');
    console.log('3. Crear mesas reales en la BD cuando se generan QRs');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar verificación
verifyTablesStructure();
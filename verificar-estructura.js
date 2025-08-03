const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarEstructura() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar restaurantes y obtener ID correcto de Pruebas
    console.log('🏪 RESTAURANTES:');
    const { data: restaurantes } = await supabase
      .from('restaurants')
      .select('*');
    
    restaurantes?.forEach(r => {
      console.log(`   - ${r.name} (ID: ${r.id})`);
    });
    
    const restaurantePruebas = restaurantes?.find(r => r.name === 'Restaurante de Pruebas');
    const PRUEBAS_ID_REAL = restaurantePruebas?.id;
    
    console.log(`\n✅ ID correcto de Pruebas: ${PRUEBAS_ID_REAL}`);
    
    // 2. Verificar estructura de profiles
    console.log('\n👤 PROFILES:');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profiles && profiles.length > 0) {
      console.log('   Columnas disponibles:');
      Object.keys(profiles[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
      
      profiles.forEach(p => {
        console.log(`\n   Profile ID: ${p.id}`);
        console.log(`   Restaurant ID: ${p.restaurant_id || 'No asignado'}`);
      });
    }
    
    // 3. Verificar auth.users para obtener emails
    console.log('\n📧 VERIFICANDO USUARIOS DE AUTH:');
    
    // Usar RPC para obtener datos de auth si está disponible
    const { data: authUsers, error: authError } = await supabase.rpc('get_auth_users');
    
    if (authError) {
      console.log('   ⚠️ No se puede acceder a auth.users directamente');
      console.log('   Necesitamos verificar manualmente los emails de usuario');
    } else {
      authUsers?.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
    
    // 4. Actualizar IDs en nuestro script
    console.log('\n🔧 CORRECCIÓN NECESARIA:');
    console.log(`   El ID correcto para Pruebas es: ${PRUEBAS_ID_REAL}`);
    console.log(`   El ID que estábamos usando: d4503f1b-9fc5-48aa-ada6-354775e57a67`);
    
    if (PRUEBAS_ID_REAL) {
      // Verificar datos existentes con el ID correcto
      console.log('\n📊 DATOS EXISTENTES CON ID CORRECTO:');
      
      const { data: menuCategorias } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', PRUEBAS_ID_REAL);
      
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', PRUEBAS_ID_REAL);
      
      const { data: impresoras } = await supabase
        .from('printers')
        .select('*')
        .eq('restaurant_id', PRUEBAS_ID_REAL);
      
      const { data: mesas } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', PRUEBAS_ID_REAL);
      
      console.log(`   Categorías: ${menuCategorias?.length || 0}`);
      console.log(`   Items: ${menuItems?.length || 0}`);
      console.log(`   Impresoras: ${impresoras?.length || 0}`);
      console.log(`   Mesas: ${mesas?.length || 0}`);
      
      return PRUEBAS_ID_REAL;
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

verificarEstructura();
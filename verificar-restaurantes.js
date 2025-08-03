const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarRestaurantes() {
  console.log('🔍 VERIFICANDO RESTAURANTES EN LA BASE DE DATOS');
  console.log('='.repeat(60));
  
  try {
    // Consultar todos los restaurantes
    const { data: restaurantes, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) {
      console.error('Error consultando restaurantes:', error);
      return;
    }
    
    console.log(`📊 Total de restaurantes encontrados: ${restaurantes?.length || 0}`);
    
    if (restaurantes && restaurantes.length > 0) {
      restaurantes.forEach((restaurant, index) => {
        console.log(`\n${index + 1}. 🏪 ${restaurant.name}`);
        console.log(`   - ID: ${restaurant.id}`);
        console.log(`   - Email: ${restaurant.email || 'No especificado'}`);
        console.log(`   - Teléfono: ${restaurant.phone || 'No especificado'}`);
        console.log(`   - Dirección: ${restaurant.address || 'No especificada'}`);
        console.log(`   - Activo: ${restaurant.is_active ? 'Sí' : 'No'}`);
      });
    } else {
      console.log('❌ No se encontraron restaurantes en la base de datos');
    }
    
    // Verificar usuarios (profiles)
    console.log('\n' + '='.repeat(60));
    console.log('👤 VERIFICANDO PERFILES DE USUARIOS');
    console.log('='.repeat(60));
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, restaurant_id');
    
    if (profileError) {
      console.error('Error consultando profiles:', profileError);
      return;
    }
    
    console.log(`📊 Total de perfiles encontrados: ${profiles?.length || 0}`);
    
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. 👤 ${profile.email}`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Restaurant ID: ${profile.restaurant_id || 'No asignado'}`);
      });
    }
    
    // Comprobar si necesitamos crear el restaurante "Pruebas"
    const PRUEBAS_ID = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
    const restaurantePruebas = restaurantes?.find(r => r.id === PRUEBAS_ID);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔧 ANÁLISIS Y RECOMENDACIONES');
    console.log('='.repeat(60));
    
    if (!restaurantePruebas) {
      console.log('❌ El restaurante "Pruebas" no existe en la base de datos');
      console.log('🛠️ NECESITA CREARSE:');
      console.log(`   - ID: ${PRUEBAS_ID}`);
      console.log(`   - Nombre: Restaurante de Pruebas`);
      console.log(`   - Email: pruebas@gmail.com`);
      
      // Crear el restaurante de pruebas
      console.log('\n🚀 Creando restaurante de pruebas...');
      
      const { data: nuevoRestaurante, error: createError } = await supabase
        .from('restaurants')
        .insert({
          id: PRUEBAS_ID,
          name: 'Restaurante de Pruebas',
          email: 'pruebas@gmail.com',
          phone: '123-456-7890',
          address: 'Calle de Pruebas 123',
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creando restaurante:', createError);
      } else {
        console.log('✅ Restaurante de pruebas creado exitosamente');
        console.log(`   - ID: ${nuevoRestaurante.id}`);
        console.log(`   - Nombre: ${nuevoRestaurante.name}`);
      }
    } else {
      console.log('✅ El restaurante "Pruebas" ya existe en la base de datos');
    }
    
    // Verificar que el usuario pruebas@gmail.com existe y tiene restaurant_id correcto
    const usuarioPruebas = profiles?.find(p => p.email === 'pruebas@gmail.com');
    
    if (!usuarioPruebas) {
      console.log('❌ El usuario pruebas@gmail.com no existe');
    } else if (usuarioPruebas.restaurant_id !== PRUEBAS_ID) {
      console.log('⚠️ El usuario pruebas@gmail.com no tiene el restaurant_id correcto');
      console.log(`   - Actual: ${usuarioPruebas.restaurant_id}`);
      console.log(`   - Esperado: ${PRUEBAS_ID}`);
      
      // Actualizar el restaurant_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ restaurant_id: PRUEBAS_ID })
        .eq('email', 'pruebas@gmail.com');
      
      if (updateError) {
        console.error('❌ Error actualizando profile:', updateError);
      } else {
        console.log('✅ Profile de pruebas@gmail.com actualizado');
      }
    } else {
      console.log('✅ El usuario pruebas@gmail.com está correctamente configurado');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

verificarRestaurantes();
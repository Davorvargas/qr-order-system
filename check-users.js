const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('🔍 VERIFICANDO USUARIOS EXISTENTES');
  console.log('='.repeat(50));
  
  try {
    // Verificar perfiles existentes
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('Error consultando profiles:', profileError);
      return;
    }
    
    console.log(`📊 Total de perfiles encontrados: ${profiles?.length || 0}`);
    
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. 👤 Profile:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Full Name: ${profile.full_name || 'No especificado'}`);
        console.log(`   - Role: ${profile.role || 'No especificado'}`);
        console.log(`   - Restaurant ID: ${profile.restaurant_id || 'No asignado'}`);
        console.log(`   - Created: ${profile.created_at}`);
      });
    }
    
    // Verificar restaurantes
    console.log('\n🏪 RESTAURANTES:');
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*');
    
    restaurants?.forEach(r => {
      console.log(`   - ${r.name} (ID: ${r.id})`);
    });
    
    // Intentar crear usuarios de prueba si no existen
    console.log('\n🔧 CREANDO USUARIOS DE PRUEBA...');
    
    // Crear usuario para Senderos
    console.log('➤ Creando usuario administrador@senderos.com...');
    const { data: userSenderos, error: errorSenderos } = await supabase.auth.admin.createUser({
      email: 'administrador@senderos.com',
      password: 'password123',
      email_confirm: true
    });
    
    if (errorSenderos) {
      console.log('⚠️ Usuario Senderos ya existe o error:', errorSenderos.message);
    } else {
      console.log('✅ Usuario Senderos creado');
      
      // Crear profile para Senderos
      await supabase
        .from('profiles')
        .upsert({
          id: userSenderos.user.id,
          full_name: 'Administrador Senderos',
          role: 'admin',
          restaurant_id: 'b333ede7-f67e-43d6-8652-9a918737d6e3'
        });
    }
    
    // Crear usuario para Pruebas
    console.log('➤ Creando usuario pruebas@gmail.com...');
    const { data: userPruebas, error: errorPruebas } = await supabase.auth.admin.createUser({
      email: 'pruebas@gmail.com',
      password: 'password123',
      email_confirm: true
    });
    
    if (errorPruebas) {
      console.log('⚠️ Usuario Pruebas ya existe o error:', errorPruebas.message);
    } else {
      console.log('✅ Usuario Pruebas creado');
      
      // Crear profile para Pruebas
      await supabase
        .from('profiles')
        .upsert({
          id: userPruebas.user.id,
          full_name: 'Staff Pruebas',
          role: 'staff',
          restaurant_id: 'a01006de-3963-406d-b060-5b7b34623a38'
        });
    }
    
    console.log('\n✅ USUARIOS LISTOS PARA SIMULACIÓN:');
    console.log('   📧 administrador@senderos.com / password123');
    console.log('   📧 pruebas@gmail.com / password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
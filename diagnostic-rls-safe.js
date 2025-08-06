// diagnostic-rls-safe.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración SEGURA - solo lectura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnosticRLSSafe() {
  console.log('🔒 DIAGNÓSTICO SEGURO - POLÍTICAS RLS');
  console.log('='.repeat(50));
  console.log('⚠️  MODO SEGURO: Solo lectura, NO modifica datos\n');

  try {
    // 1. Verificar configuración
    console.log('1. ✅ VERIFICANDO CONFIGURACIÓN');
    console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ No configurado');
    console.log('   KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ No configurado');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('\n❌ ERROR: Variables de entorno no configuradas');
      return;
    }

    // 2. Verificar acceso a tablas principales
    console.log('\n2. 🔍 VERIFICANDO ACCESO A TABLAS');
    console.log('='.repeat(40));

    const tablesToCheck = [
      { name: 'menu_items', description: 'Elementos del menú' },
      { name: 'menu_categories', description: 'Categorías del menú' },
      { name: 'restaurants', description: 'Restaurantes' },
      { name: 'profiles', description: 'Perfiles de usuario' }
    ];

    for (const table of tablesToCheck) {
      console.log(`\n📊 Verificando acceso a ${table.name} (${table.description})...`);
      
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('count')
          .limit(1);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          console.log(`   🔍 Código: ${error.code}`);
          console.log(`   💡 Posible problema de RLS`);
        } else {
          console.log(`   ✅ Acceso permitido`);
        }
      } catch (err) {
        console.log(`   ❌ Error de conexión: ${err.message}`);
      }
    }

    // 3. Verificar función get_user_restaurant_id
    console.log('\n3. 🔧 VERIFICANDO FUNCIÓN get_user_restaurant_id');
    console.log('='.repeat(40));

    try {
      // Intentar ejecutar la función (esto puede fallar si no existe)
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_user_restaurant_id');

      if (functionError) {
        console.log(`   ❌ Función no disponible: ${functionError.message}`);
        console.log(`   💡 La función get_user_restaurant_id() no existe o no es accesible`);
      } else {
        console.log(`   ✅ Función disponible`);
        console.log(`   📊 Resultado: ${functionResult}`);
      }
    } catch (err) {
      console.log(`   ❌ Error ejecutando función: ${err.message}`);
    }

    // 4. Verificar elementos del menú con restaurant_id
    console.log('\n4. 📊 ANALIZANDO ELEMENTOS DEL MENÚ');
    console.log('='.repeat(40));

    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, restaurant_id, is_available')
      .limit(10);

    if (menuError) {
      console.log(`   ❌ Error obteniendo elementos: ${menuError.message}`);
    } else {
      console.log(`   ✅ Elementos obtenidos: ${menuItems?.length || 0}`);
      
      if (menuItems && menuItems.length > 0) {
        console.log('\n   📋 Primeros 5 elementos:');
        menuItems.slice(0, 5).forEach(item => {
          const hasRestaurant = item.restaurant_id ? '✅' : '❌';
          const isAvailable = item.is_available ? '✅' : '❌';
          console.log(`     #${item.id} - ${item.name}`);
          console.log(`       Restaurant ID: ${hasRestaurant} ${item.restaurant_id || 'SIN ASIGNAR'}`);
          console.log(`       Disponible: ${isAvailable}`);
        });
      }
    }

    // 5. Verificar categorías
    console.log('\n5. 📂 ANALIZANDO CATEGORÍAS');
    console.log('='.repeat(40));

    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('id, name, restaurant_id, is_available')
      .limit(10);

    if (categoriesError) {
      console.log(`   ❌ Error obteniendo categorías: ${categoriesError.message}`);
    } else {
      console.log(`   ✅ Categorías obtenidas: ${categories?.length || 0}`);
      
      if (categories && categories.length > 0) {
        console.log('\n   📋 Primeras 5 categorías:');
        categories.slice(0, 5).forEach(cat => {
          const hasRestaurant = cat.restaurant_id ? '✅' : '❌';
          const isAvailable = cat.is_available ? '✅' : '❌';
          console.log(`     #${cat.id} - ${cat.name}`);
          console.log(`       Restaurant ID: ${hasRestaurant} ${cat.restaurant_id || 'SIN ASIGNAR'}`);
          console.log(`       Disponible: ${isAvailable}`);
        });
      }
    }

    // 6. Verificar restaurantes
    console.log('\n6. 🏪 ANALIZANDO RESTAURANTES');
    console.log('='.repeat(40));

    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(5);

    if (restaurantsError) {
      console.log(`   ❌ Error obteniendo restaurantes: ${restaurantsError.message}`);
    } else {
      console.log(`   ✅ Restaurantes obtenidos: ${restaurants?.length || 0}`);
      
      if (restaurants && restaurants.length > 0) {
        console.log('\n   📋 Restaurantes:');
        restaurants.forEach(rest => {
          console.log(`     #${rest.id} - ${rest.name}`);
        });
      }
    }

    // 7. Resumen y recomendaciones
    console.log('\n7. 📋 RESUMEN Y RECOMENDACIONES');
    console.log('='.repeat(40));

    console.log('🔍 PROBLEMAS COMUNES DE RLS:');
    console.log('   1. Elementos sin restaurant_id');
    console.log('   2. Función get_user_restaurant_id() no disponible');
    console.log('   3. Políticas RLS mal configuradas');
    console.log('   4. Elementos con is_available = false');

    console.log('\n💡 SOLUCIONES RECOMENDADAS:');
    console.log('   1. Verificar que todos los elementos tengan restaurant_id');
    console.log('   2. Crear la función get_user_restaurant_id() si no existe');
    console.log('   3. Revisar políticas RLS en Supabase Dashboard');
    console.log('   4. Asegurar que nuevos elementos tengan is_available = true');

    console.log('\n✅ DIAGNÓSTICO RLS COMPLETADO - MODO SEGURO');
    console.log('🔒 No se modificó ningún dato en la base de datos');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico RLS:', error);
  }
}

// Ejecutar el diagnóstico
diagnosticRLSSafe();

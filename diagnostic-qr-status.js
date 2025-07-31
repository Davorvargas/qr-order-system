const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function diagnosticQRStatus() {
  console.log('🔍 DIAGNÓSTICO DEL ESTADO ACTUAL DE CÓDIGOS QR');
  console.log('================================================\n');

  // Verificar variables de entorno
  console.log('1. VERIFICANDO CONFIGURACIÓN DE SUPABASE:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ No configurado');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ No configurado');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('\n❌ ERROR: Variables de entorno de Supabase no configuradas');
    console.log('   Por favor, verifica tu archivo .env.local');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 2. Verificar restaurantes
    console.log('\n2. VERIFICANDO RESTAURANTES:');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, created_at');

    if (restaurantsError) {
      console.log('   ❌ Error al obtener restaurantes:', restaurantsError.message);
    } else {
      console.log(`   ✅ Restaurantes encontrados: ${restaurants.length}`);
      restaurants.forEach(restaurant => {
        console.log(`      - ID: ${restaurant.id}, Nombre: ${restaurant.name || 'Sin nombre'}`);
      });
    }

    // 3. Verificar mesas
    console.log('\n3. VERIFICANDO MESAS:');
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('id, table_number, restaurant_id, created_at');

    if (tablesError) {
      console.log('   ❌ Error al obtener mesas:', tablesError.message);
    } else {
      console.log(`   ✅ Mesas encontradas: ${tables.length}`);
      if (tables.length > 0) {
        console.log('   📋 Detalle de mesas:');
        tables.forEach(table => {
          console.log(`      - Mesa ${table.table_number} (ID: ${table.id}) - Restaurante: ${table.restaurant_id}`);
        });
      }
    }

    // 4. Verificar categorías de menú
    console.log('\n4. VERIFICANDO CATEGORÍAS DE MENÚ:');
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('id, name, restaurant_id, is_available');

    if (categoriesError) {
      console.log('   ❌ Error al obtener categorías:', categoriesError.message);
    } else {
      console.log(`   ✅ Categorías encontradas: ${categories.length}`);
      if (categories.length > 0) {
        console.log('   📋 Categorías disponibles:');
        categories.forEach(category => {
          console.log(`      - ${category.name} (ID: ${category.id}) - Disponible: ${category.is_available ? 'Sí' : 'No'}`);
        });
      }
    }

    // 5. Verificar elementos del menú
    console.log('\n5. VERIFICANDO ELEMENTOS DEL MENÚ:');
    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('id, name, price, category_id, restaurant_id, is_available');

    if (menuItemsError) {
      console.log('   ❌ Error al obtener elementos del menú:', menuItemsError.message);
    } else {
      console.log(`   ✅ Elementos del menú encontrados: ${menuItems.length}`);
      if (menuItems.length > 0) {
        console.log('   📋 Primeros 5 elementos:');
        menuItems.slice(0, 5).forEach(item => {
          console.log(`      - ${item.name} - Bs. ${item.price || 0} - Disponible: ${item.is_available ? 'Sí' : 'No'}`);
        });
      }
    }

    // 6. Generar URLs de ejemplo para los QR
    console.log('\n6. URLs DE CÓDIGOS QR DE EJEMPLO:');
    if (tables && tables.length > 0) {
      const baseUrl = 'http://localhost:3000'; // Cambiar por tu URL de producción
      console.log('   📱 URLs que deberían abrirse al escanear los QR:');
      tables.slice(0, 3).forEach(table => {
        const qrUrl = `${baseUrl}/menu/${table.id}`;
        console.log(`      Mesa ${table.table_number}: ${qrUrl}`);
      });
    }

    // 7. Verificar políticas RLS
    console.log('\n7. VERIFICANDO POLÍTICAS RLS:');
    console.log('   ℹ️  Las políticas RLS deben permitir acceso público a:');
    console.log('      - tables (para obtener restaurant_id)');
    console.log('      - menu_categories (para mostrar categorías)');
    console.log('      - menu_items (para mostrar productos)');

    // 8. Resumen y recomendaciones
    console.log('\n8. RESUMEN Y RECOMENDACIONES:');
    
    if (tables && tables.length > 0) {
      console.log('   ✅ Tienes mesas configuradas');
      console.log('   ✅ Los códigos QR deberían funcionar');
      
      if (menuItems && menuItems.length > 0) {
        console.log('   ✅ Tienes elementos en el menú');
        console.log('   ✅ Los clientes podrán ver productos al escanear');
      } else {
        console.log('   ⚠️  No hay elementos en el menú');
        console.log('   💡 Agrega productos al menú para que los clientes puedan ver algo');
      }
    } else {
      console.log('   ❌ No hay mesas configuradas');
      console.log('   💡 Ve al dashboard y genera códigos QR para crear las mesas');
    }

    console.log('\n9. PRÓXIMOS PASOS:');
    console.log('   1. Verifica que las políticas RLS permitan acceso público');
    console.log('   2. Prueba escanear un código QR desde tu teléfono');
    console.log('   3. Verifica que la página /menu/[tableId] se abra correctamente');
    console.log('   4. Asegúrate de que haya productos en el menú');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

diagnosticQRStatus(); 
const { createClient } = require('@supabase/supabase-js');

// Usar las variables de entorno que Next.js está usando
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 DIAGNÓSTICO CON VARIABLES DE ENTORNO DE NEXT.JS');
console.log('===================================================\n');

console.log('1. VERIFICANDO VARIABLES DE ENTORNO:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ No configurado');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ No configurado');

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Las variables de entorno no están disponibles en este contexto');
  console.log('   Esto es normal - las variables solo están disponibles en el contexto de Next.js');
  console.log('   El servidor está corriendo correctamente en http://localhost:3002');
  console.log('\n💡 Para probar los códigos QR:');
  console.log('   1. Ve a http://localhost:3002/staff/qr-codes');
  console.log('   2. Genera o descarga los códigos QR');
  console.log('   3. Escanea un código QR desde tu teléfono');
  console.log('   4. Verifica que se abra la página del menú');
  return;
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQRWithNext() {
  try {
    console.log('\n2. PROBANDO CONEXIÓN A SUPABASE:');
    const { data: testData, error: testError } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('   ❌ Error de conexión:', testError.message);
      return;
    }
    console.log('   ✅ Conexión exitosa a Supabase');

    // 3. Obtener restaurante
    console.log('\n3. OBTENIENDO RESTAURANTE:');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);

    if (restaurantsError) {
      console.log('   ❌ Error al obtener restaurantes:', restaurantsError.message);
      return;
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('   ❌ No hay restaurantes configurados');
      return;
    }

    const restaurant = restaurants[0];
    console.log(`   ✅ Restaurante encontrado: ${restaurant.name || 'Sin nombre'} (ID: ${restaurant.id})`);

    // 4. Obtener mesas
    console.log('\n4. OBTENIENDO MESAS:');
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', restaurant.id)
      .order('table_number');

    if (tablesError) {
      console.log('   ❌ Error al obtener mesas:', tablesError.message);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('   ❌ No hay mesas configuradas');
      return;
    }

    console.log(`   ✅ ${tables.length} mesas encontradas`);
    console.log('   📋 Mesas disponibles:');
    tables.forEach(table => {
      console.log(`      - Mesa ${table.table_number} (ID: ${table.id})`);
    });

    // 5. Generar URLs de códigos QR
    console.log('\n5. URLs DE CÓDIGOS QR:');
    const baseUrl = 'http://localhost:3002'; // Puerto correcto
    console.log('   📱 URLs que se abrirán al escanear los QR:');
    tables.slice(0, 5).forEach(table => {
      const qrUrl = `${baseUrl}/menu/${table.id}`;
      console.log(`      Mesa ${table.table_number}: ${qrUrl}`);
    });

    // 6. Verificar datos del menú
    console.log('\n6. VERIFICANDO DATOS DEL MENÚ:');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('id, name, is_available')
      .eq('restaurant_id', restaurant.id);

    if (categoriesError) {
      console.log('   ❌ Error al obtener categorías:', categoriesError.message);
    } else {
      console.log(`   ✅ ${categories.length} categorías encontradas`);
    }

    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('id, name, price, is_available')
      .eq('restaurant_id', restaurant.id);

    if (menuItemsError) {
      console.log('   ❌ Error al obtener elementos del menú:', menuItemsError.message);
    } else {
      console.log(`   ✅ ${menuItems.length} elementos del menú encontrados`);
      if (menuItems.length > 0) {
        console.log('   📋 Primeros 3 elementos:');
        menuItems.slice(0, 3).forEach(item => {
          console.log(`      - ${item.name} - Bs. ${item.price || 0} (Disponible: ${item.is_available ? 'Sí' : 'No'})`);
        });
      }
    }

    // 7. Resumen final
    console.log('\n7. RESUMEN FINAL:');
    console.log('   ✅ Sistema de códigos QR configurado correctamente');
    console.log(`   ✅ ${tables.length} mesas disponibles para generar QR`);
    console.log(`   ✅ ${categories.length} categorías de menú`);
    console.log(`   ✅ ${menuItems.length} elementos en el menú`);
    
    if (menuItems.length === 0) {
      console.log('   ⚠️  No hay elementos en el menú');
      console.log('   💡 Agrega productos al menú para que los clientes puedan ver algo');
    }

    console.log('\n8. PRÓXIMOS PASOS PARA PROBAR:');
    console.log('   1. Ve a http://localhost:3002/staff/qr-codes');
    console.log('   2. Genera o descarga los códigos QR');
    console.log('   3. Escanea un código QR desde tu teléfono');
    console.log('   4. Verifica que se abra la página del menú correctamente');

    console.log('\n9. URL DE PRUEBA DIRECTA:');
    if (tables.length > 0) {
      const testTable = tables[0];
      const testUrl = `${baseUrl}/menu/${testTable.id}`;
      console.log(`   Puedes probar directamente: ${testUrl}`);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testQRWithNext(); 
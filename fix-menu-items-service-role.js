// fix-menu-items-service-role.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración con SERVICE ROLE KEY para bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service role key
);

async function fixMenuItemsServiceRole() {
  console.log('🔧 CORRECCIÓN CON SERVICE ROLE - ELEMENTOS DEL MENÚ');
  console.log('='.repeat(50));
  console.log('⚠️  MODO SERVICE ROLE: Bypass RLS para corrección\n');

  try {
    // 1. Verificar configuración
    console.log('1. ✅ VERIFICANDO CONFIGURACIÓN');
    console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ No configurado');
    console.log('   SERVICE ROLE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ No configurado');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n❌ ERROR: Variables de entorno no configuradas');
      console.log('   💡 Necesitas SUPABASE_SERVICE_ROLE_KEY en .env.local');
      return;
    }

    // 2. Identificar elementos sin restaurant_id
    console.log('\n2. 🔍 IDENTIFICANDO ELEMENTOS SIN RESTAURANTE');
    console.log('='.repeat(40));

    const { data: itemsWithoutRestaurant, error: itemsError } = await supabase
      .from('menu_items')
      .select('id, name, restaurant_id, category_id, display_order')
      .is('restaurant_id', null);

    if (itemsError) {
      console.error('❌ Error obteniendo elementos:', itemsError);
      return;
    }

    console.log(`📊 Elementos sin restaurant_id: ${itemsWithoutRestaurant?.length || 0}`);

    if (!itemsWithoutRestaurant || itemsWithoutRestaurant.length === 0) {
      console.log('✅ No hay elementos sin restaurant_id');
      return;
    }

    // 3. Mostrar elementos que se van a corregir
    console.log('\n📋 ELEMENTOS QUE SE VAN A CORREGIR:');
    itemsWithoutRestaurant.forEach(item => {
      console.log(`   #${item.id} - ${item.name}`);
      console.log(`     Restaurant ID: ${item.restaurant_id || 'SIN ASIGNAR'}`);
      console.log(`     Category ID: ${item.category_id || 'SIN CATEGORÍA'}`);
      console.log(`     Display Order: ${item.display_order || 'SIN ORDEN'}`);
      console.log('');
    });

    // 4. Obtener restaurant_id de Senderos
    const senderosId = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    console.log(`🎯 Asignando restaurant_id: ${senderosId} (Senderos)`);

    // 5. Obtener primera categoría disponible de Senderos
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('id')
      .eq('restaurant_id', senderosId)
      .eq('is_available', true)
      .order('display_order')
      .limit(1);

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError);
      return;
    }

    const defaultCategoryId = categories?.[0]?.id;
    console.log(`📂 Categoría por defecto: ${defaultCategoryId || 'No disponible'}`);

    // 6. Preparar actualizaciones
    const updates = itemsWithoutRestaurant.map(item => ({
      id: item.id,
      restaurant_id: senderosId,
      category_id: item.category_id || defaultCategoryId,
      display_order: item.display_order || item.id
    }));

    console.log('\n3. 🔧 APLICANDO CORRECCIONES CON SERVICE ROLE');
    console.log('='.repeat(40));

    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({
            restaurant_id: update.restaurant_id,
            category_id: update.category_id,
            display_order: update.display_order
          })
          .eq('id', update.id);

        if (error) {
          console.log(`   ❌ Error actualizando #${update.id}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Actualizado #${update.id} - ${itemsWithoutRestaurant.find(i => i.id === update.id)?.name}`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Error de conexión #${update.id}: ${err.message}`);
        errorCount++;
      }
    }

    // 7. Verificar resultados
    console.log('\n4. ✅ VERIFICANDO RESULTADOS');
    console.log('='.repeat(40));

    const { data: verificationItems, error: verificationError } = await supabase
      .from('menu_items')
      .select('id, name, restaurant_id, category_id, display_order')
      .eq('restaurant_id', senderosId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (verificationError) {
      console.error('❌ Error verificando resultados:', verificationError);
    } else {
      console.log(`📊 Elementos de Senderos después de la corrección: ${verificationItems?.length || 0}`);
      
      if (verificationItems && verificationItems.length > 0) {
        console.log('\n📋 Primeros 5 elementos corregidos:');
        verificationItems.slice(0, 5).forEach(item => {
          const hasRestaurant = item.restaurant_id ? '✅' : '❌';
          const hasCategory = item.category_id ? '✅' : '❌';
          const hasOrder = item.display_order ? '✅' : '❌';
          
          console.log(`   #${item.id} - ${item.name}`);
          console.log(`     Restaurant ID: ${hasRestaurant} ${item.restaurant_id || 'SIN ASIGNAR'}`);
          console.log(`     Category ID: ${hasCategory} ${item.category_id || 'SIN CATEGORÍA'}`);
          console.log(`     Display Order: ${hasOrder} ${item.display_order || 'SIN ORDEN'}`);
        });
      }
    }

    // 8. Verificar elementos sin restaurant_id después de la corrección
    const { data: remainingItems, error: remainingError } = await supabase
      .from('menu_items')
      .select('id, name')
      .is('restaurant_id', null);

    if (remainingError) {
      console.error('❌ Error verificando elementos restantes:', remainingError);
    } else {
      console.log(`\n📊 Elementos sin restaurant_id después de la corrección: ${remainingItems?.length || 0}`);
      
      if (remainingItems && remainingItems.length > 0) {
        console.log('\n⚠️  ELEMENTOS QUE AÚN NO TIENEN RESTAURANTE:');
        remainingItems.forEach(item => {
          console.log(`   #${item.id} - ${item.name}`);
        });
      } else {
        console.log('✅ ¡Excelente! Todos los elementos tienen restaurant_id asignado');
      }
    }

    // 9. Resumen final
    console.log('\n5. 📋 RESUMEN FINAL');
    console.log('='.repeat(40));

    console.log(`✅ Elementos corregidos exitosamente: ${successCount}`);
    if (errorCount > 0) {
      console.log(`❌ Elementos con errores: ${errorCount}`);
    }

    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('   1. Verificar en el dashboard (/staff/create-order)');
    console.log('   2. Verificar en el menú QR (escanear código QR)');
    console.log('   3. Probar crear un nuevo elemento desde el dashboard');
    console.log('   4. Verificar que aparezca automáticamente');

    console.log('\n✅ CORRECCIÓN COMPLETADA - MODO SERVICE ROLE');
    console.log('🔒 Se modificaron elementos específicos sin restaurant_id');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
}

// Ejecutar la corrección
fixMenuItemsServiceRole();

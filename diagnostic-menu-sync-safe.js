// diagnostic-menu-sync-safe.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración SEGURA - solo lectura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnosticMenuSyncSafe() {
  console.log('🔍 DIAGNÓSTICO SEGURO - SINCRONIZACIÓN DE MENÚ');
  console.log('='.repeat(60));
  console.log('⚠️  MODO SEGURO: Solo lectura, NO modifica datos\n');

  try {
    // 1. Verificar configuración
    console.log('1. ✅ VERIFICANDO CONFIGURACIÓN');
    console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ No configurado');
    console.log('   KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ No configurado');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('\n❌ ERROR: Variables de entorno no configuradas');
      console.log('   💡 Verifica tu archivo .env.local');
      return;
    }

    // 2. Verificar elementos del menú
    console.log('\n2. 📊 ANALIZANDO ELEMENTOS DEL MENÚ');
    console.log('='.repeat(40));

    const { data: allMenuItems, error: itemsError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        category_id,
        is_available,
        restaurant_id,
        display_order,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('❌ Error obteniendo elementos:', itemsError);
      return;
    }

    console.log(`📊 Total de elementos en la base de datos: ${allMenuItems?.length || 0}`);

    // 3. Categorizar elementos por restaurante
    const itemsByRestaurant = {};
    const itemsWithoutRestaurant = [];

    allMenuItems?.forEach(item => {
      if (item.restaurant_id) {
        if (!itemsByRestaurant[item.restaurant_id]) {
          itemsByRestaurant[item.restaurant_id] = [];
        }
        itemsByRestaurant[item.restaurant_id].push(item);
      } else {
        itemsWithoutRestaurant.push(item);
      }
    });

    console.log('\n📋 DISTRIBUCIÓN POR RESTAURANTE:');
    Object.keys(itemsByRestaurant).forEach(restaurantId => {
      const items = itemsByRestaurant[restaurantId];
      const available = items.filter(item => item.is_available).length;
      const recent = items.filter(item => {
        const createdAt = new Date(item.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      }).length;

      console.log(`   Restaurante ${restaurantId}:`);
      console.log(`     - Total elementos: ${items.length}`);
      console.log(`     - Disponibles: ${available}`);
      console.log(`     - Recientes (7 días): ${recent}`);
    });

    if (itemsWithoutRestaurant.length > 0) {
      console.log(`\n⚠️  ELEMENTOS SIN RESTAURANTE: ${itemsWithoutRestaurant.length}`);
      itemsWithoutRestaurant.forEach(item => {
        console.log(`   #${item.id} - ${item.name}`);
      });
    }

    // 4. Verificar elementos recientes
    console.log('\n3. 🆕 ELEMENTOS RECIENTES (últimos 7 días)');
    console.log('='.repeat(40));

    const recentItems = allMenuItems?.filter(item => {
      const createdAt = new Date(item.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }) || [];

    console.log(`📊 Elementos creados en los últimos 7 días: ${recentItems.length}`);

    recentItems.forEach(item => {
      console.log(`   #${item.id} - ${item.name}`);
      console.log(`     Precio: Bs ${item.price || 0}`);
      console.log(`     Disponible: ${item.is_available ? '✅' : '❌'}`);
      console.log(`     Restaurante: ${item.restaurant_id || 'SIN ASIGNAR'}`);
      console.log(`     Categoría: ${item.category_id || 'SIN CATEGORÍA'}`);
      console.log(`     Creado: ${item.created_at}`);
      console.log('');
    });

    // 5. Verificar problemas específicos
    console.log('\n4. 🔍 VERIFICANDO PROBLEMAS ESPECÍFICOS');
    console.log('='.repeat(40));

    // Elementos sin categoría
    const itemsWithoutCategory = allMenuItems?.filter(item => !item.category_id) || [];
    console.log(`⚠️  Elementos sin categoría: ${itemsWithoutCategory.length}`);
    if (itemsWithoutCategory.length > 0) {
      itemsWithoutCategory.forEach(item => {
        console.log(`   #${item.id} - ${item.name}`);
      });
    }

    // Elementos sin display_order
    const itemsWithoutOrder = allMenuItems?.filter(item => item.display_order === null) || [];
    console.log(`⚠️  Elementos sin display_order: ${itemsWithoutOrder.length}`);
    if (itemsWithoutOrder.length > 0) {
      itemsWithoutOrder.forEach(item => {
        console.log(`   #${item.id} - ${item.name}`);
      });
    }

    // Elementos excluidos por filtros
    const excludedBySpecial = allMenuItems?.filter(item => 
      item.description && item.description.includes('Producto especial')
    ) || [];
    console.log(`⚠️  Elementos excluidos (Producto especial): ${excludedBySpecial.length}`);

    const excludedByDeleted = allMenuItems?.filter(item => 
      item.name && item.name.startsWith('[ELIMINADO]')
    ) || [];
    console.log(`⚠️  Elementos excluidos ([ELIMINADO]): ${excludedByDeleted.length}`);

    // 6. Simular consultas del dashboard y menú QR
    console.log('\n5. 🔍 SIMULANDO CONSULTAS');
    console.log('='.repeat(40));

    // Para el restaurante Senderos específicamente
    const senderosId = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    const senderosItems = allMenuItems?.filter(item => item.restaurant_id === senderosId) || [];

    console.log(`📊 Elementos de Senderos: ${senderosItems.length}`);

    // Simular consulta del dashboard (con filtros)
    const dashboardItems = senderosItems.filter(item => 
      (!item.description || !item.description.includes('Producto especial')) &&
      (!item.name || !item.name.startsWith('[ELIMINADO]'))
    );
    console.log(`📊 Elementos para dashboard: ${dashboardItems.length}`);

    // Simular consulta del menú QR (sin filtros adicionales)
    const qrItems = senderosItems.filter(item => item.is_available);
    console.log(`📱 Elementos para menú QR: ${qrItems.length}`);

    // 7. Verificar categorías
    console.log('\n6. 📂 VERIFICANDO CATEGORÍAS');
    console.log('='.repeat(40));

    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', senderosId);

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError);
    } else {
      console.log(`📊 Categorías de Senderos: ${categories?.length || 0}`);
      categories?.forEach(cat => {
        console.log(`   #${cat.id} - ${cat.name} (disponible: ${cat.is_available})`);
      });
    }

    // 8. Resumen y recomendaciones
    console.log('\n7. 📋 RESUMEN Y RECOMENDACIONES');
    console.log('='.repeat(40));

    if (itemsWithoutRestaurant.length > 0) {
      console.log('❌ PROBLEMA: Elementos sin restaurant_id');
      console.log('   💡 SOLUCIÓN: Asignar restaurant_id a estos elementos');
    }

    if (itemsWithoutCategory.length > 0) {
      console.log('❌ PROBLEMA: Elementos sin categoría');
      console.log('   💡 SOLUCIÓN: Asignar category_id a estos elementos');
    }

    if (itemsWithoutOrder.length > 0) {
      console.log('❌ PROBLEMA: Elementos sin display_order');
      console.log('   💡 SOLUCIÓN: Asignar display_order a estos elementos');
    }

    if (recentItems.length === 0) {
      console.log('⚠️  ADVERTENCIA: No hay elementos recientes');
      console.log('   💡 VERIFICAR: Si se están creando nuevos elementos');
    }

    // Verificar diferencia entre dashboard y QR
    const dashboardVsQR = dashboardItems.length - qrItems.length;
    if (dashboardVsQR !== 0) {
      console.log(`⚠️  DIFERENCIA: Dashboard (${dashboardItems.length}) vs QR (${qrItems.length})`);
      console.log('   💡 VERIFICAR: Filtros de disponibilidad');
    }

    console.log('\n✅ DIAGNÓSTICO COMPLETADO - MODO SEGURO');
    console.log('🔒 No se modificó ningún dato en la base de datos');
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Revisar los problemas identificados arriba');
    console.log('   2. Corregir elementos sin restaurant_id, category_id, o display_order');
    console.log('   3. Verificar que los nuevos elementos tengan is_available = true');
    console.log('   4. Probar crear un nuevo elemento y verificar que aparezca');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

// Ejecutar el diagnóstico
diagnosticMenuSyncSafe();

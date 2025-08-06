const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticMenuItems() {
  console.log('🔍 Diagnosticando elementos del menú...\n');

  try {
    // 1. Obtener todos los elementos del menú del restaurante Senderos
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
      .eq('restaurant_id', 'b333ede7-f67e-43d6-8652-9a918737d6e3')
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('❌ Error obteniendo elementos del menú:', itemsError);
      return;
    }

    console.log(`📊 Total de elementos del menú: ${allMenuItems.length}\n`);

    // 2. Categorizar elementos
    const categorized = {
      available: [],
      unavailable: [],
      special: [],
      deleted: [],
      recent: []
    };

    allMenuItems.forEach(item => {
      // Elementos recientes (últimos 7 días)
      const createdAt = new Date(item.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (createdAt > weekAgo) {
        categorized.recent.push(item);
      }

      // Elementos disponibles
      if (item.is_available === true) {
        categorized.available.push(item);
      } else {
        categorized.unavailable.push(item);
      }

      // Elementos especiales (que pueden ser excluidos)
      if (item.description && item.description.includes('Producto especial')) {
        categorized.special.push(item);
      }

      // Elementos eliminados
      if (item.name && item.name.startsWith('[ELIMINADO]')) {
        categorized.deleted.push(item);
      }
    });

    // 3. Mostrar resultados
    console.log('📋 Categorización de elementos del menú:');
    console.log(`   Disponibles: ${categorized.available.length}`);
    console.log(`   No disponibles: ${categorized.unavailable.length}`);
    console.log(`   Especiales: ${categorized.special.length}`);
    console.log(`   Eliminados: ${categorized.deleted.length}`);
    console.log(`   Recientes (últimos 7 días): ${categorized.recent.length}\n`);

    // 4. Mostrar elementos recientes
    console.log('🆕 Elementos recientes (últimos 7 días):');
    categorized.recent.forEach(item => {
      console.log(`   #${item.id} - ${item.name}`);
      console.log(`     Precio: Bs ${item.price}`);
      console.log(`     Disponible: ${item.is_available ? '✅' : '❌'}`);
      console.log(`     Categoría: ${item.category_id}`);
      console.log(`     Creado: ${item.created_at}`);
      console.log('');
    });

    // 5. Verificar filtros aplicados en el dashboard
    console.log('🔍 Verificando filtros del dashboard:');
    
    // Filtro 1: restaurant_id
    const dashboardItems = allMenuItems.filter(item => 
      item.restaurant_id === 'b333ede7-f67e-43d6-8652-9a918737d6e3'
    );
    console.log(`   Con restaurant_id correcto: ${dashboardItems.length}`);

    // Filtro 2: Excluir productos especiales
    const withoutSpecial = dashboardItems.filter(item => 
      !item.description || !item.description.includes('Producto especial')
    );
    console.log(`   Sin productos especiales: ${withoutSpecial.length}`);

    // Filtro 3: Excluir elementos eliminados
    const withoutDeleted = withoutSpecial.filter(item => 
      !item.name || !item.name.startsWith('[ELIMINADO]')
    );
    console.log(`   Sin elementos eliminados: ${withoutDeleted.length}`);

    // 6. Verificar filtros del menú QR
    console.log('\n🔍 Verificando filtros del menú QR:');
    
    // El menú QR no tiene filtros adicionales, solo restaurant_id
    const qrItems = allMenuItems.filter(item => 
      item.restaurant_id === 'b333ede7-f67e-43d6-8652-9a918737d6e3'
    );
    console.log(`   Elementos para menú QR: ${qrItems.length}`);

    // 7. Verificar categorías
    console.log('\n🔍 Verificando categorías:');
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', 'b333ede7-f67e-43d6-8652-9a918737d6e3');

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError);
    } else {
      console.log(`   Total de categorías: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`     #${cat.id} - ${cat.name} (disponible: ${cat.is_available})`);
      });
    }

    // 8. Verificar elementos sin categoría
    const itemsWithoutCategory = allMenuItems.filter(item => !item.category_id);
    console.log(`\n⚠️  Elementos sin categoría: ${itemsWithoutCategory.length}`);
    itemsWithoutCategory.forEach(item => {
      console.log(`   #${item.id} - ${item.name}`);
    });

    // 9. Verificar elementos con display_order null
    const itemsWithoutOrder = allMenuItems.filter(item => item.display_order === null);
    console.log(`\n⚠️  Elementos sin display_order: ${itemsWithoutOrder.length}`);
    itemsWithoutOrder.forEach(item => {
      console.log(`   #${item.id} - ${item.name}`);
    });

    console.log('\n✅ Diagnóstico completado');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  }
}

// Ejecutar el diagnóstico
diagnosticMenuItems();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function analyzeCategoriesAndItems() {
  console.log('🔍 ANÁLISIS DE CATEGORÍAS Y ITEMS');
  console.log('=================================');
  
  try {
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    if (catError) {
      console.error('❌ Error consultando categorías:', catError);
      return;
    }
    
    console.log('\n📋 CATEGORÍAS DISPONIBLES:');
    if (categories && categories.length > 0) {
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
        if (cat.description) {
          console.log(`      Descripción: ${cat.description}`);
        }
      });
    } else {
      console.log('   ⚠️  No se encontraron categorías');
    }
    
    // Get menu items with categories
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (
          name,
          id
        )
      `)
      .eq('is_available', true)
      .order('name');
    
    if (itemsError) {
      console.error('❌ Error consultando items:', itemsError);
      return;
    }
    
    console.log('\n🍽️  ITEMS DEL MENÚ POR CATEGORÍA:');
    
    // Group items by category
    const itemsByCategory = {};
    
    items?.forEach(item => {
      const categoryName = item.menu_categories?.name || 'Sin categoría';
      const categoryId = item.menu_categories?.id || 'no-category';
      
      if (!itemsByCategory[categoryName]) {
        itemsByCategory[categoryName] = {
          id: categoryId,
          items: []
        };
      }
      
      itemsByCategory[categoryName].items.push({
        id: item.id,
        name: item.name,
        price: item.price
      });
    });
    
    // Display items by category
    Object.entries(itemsByCategory).forEach(([categoryName, categoryData]) => {
      console.log(`\n📂 ${categoryName.toUpperCase()} (ID: ${categoryData.id})`);
      categoryData.items.forEach(item => {
        console.log(`   • ${item.name} - Bs${item.price} (ID: ${item.id})`);
      });
    });
    
    // Analyze for printer classification
    console.log('\n🖨️  CLASIFICACIÓN SUGERIDA PARA IMPRESORAS:');
    console.log('===========================================');
    
    console.log('\n🍳 IMPRESORA DE COCINA debería imprimir:');
    Object.entries(itemsByCategory).forEach(([categoryName, categoryData]) => {
      const lowerName = categoryName.toLowerCase();
      if (lowerName.includes('comida') || 
          lowerName.includes('plato') || 
          lowerName.includes('entrada') || 
          lowerName.includes('principal') ||
          lowerName.includes('carne') ||
          lowerName.includes('pollo') ||
          lowerName.includes('pescado') ||
          !lowerName.includes('bebida') && !lowerName.includes('jugo') && !lowerName.includes('refresco')) {
        console.log(`   ✅ ${categoryName} (${categoryData.items.length} items)`);
        categoryData.items.slice(0, 3).forEach(item => {
          console.log(`      - ${item.name}`);
        });
        if (categoryData.items.length > 3) {
          console.log(`      ... y ${categoryData.items.length - 3} más`);
        }
      }
    });
    
    console.log('\n🥤 IMPRESORA DE BAR debería imprimir:');
    Object.entries(itemsByCategory).forEach(([categoryName, categoryData]) => {
      const lowerName = categoryName.toLowerCase();
      if (lowerName.includes('bebida') || 
          lowerName.includes('jugo') || 
          lowerName.includes('refresco') ||
          lowerName.includes('cerveza') ||
          lowerName.includes('cocktail') ||
          lowerName.includes('agua')) {
        console.log(`   ✅ ${categoryName} (${categoryData.items.length} items)`);
        categoryData.items.slice(0, 3).forEach(item => {
          console.log(`      - ${item.name}`);
        });
        if (categoryData.items.length > 3) {
          console.log(`      ... y ${categoryData.items.length - 3} más`);
        }
      }
    });
    
    // Generate filtering logic
    console.log('\n💻 LÓGICA DE FILTRADO RECOMENDADA:');
    console.log('==================================');
    
    // Find kitchen categories
    const kitchenCategories = [];
    const barCategories = [];
    
    Object.entries(itemsByCategory).forEach(([categoryName, categoryData]) => {
      const lowerName = categoryName.toLowerCase();
      if (lowerName.includes('bebida') || 
          lowerName.includes('jugo') || 
          lowerName.includes('refresco') ||
          lowerName.includes('cocktail')) {
        barCategories.push(categoryData.id);
      } else {
        kitchenCategories.push(categoryData.id);
      }
    });
    
    console.log('\n🐍 CÓDIGO PYTHON SUGERIDO:');
    console.log('```python');
    console.log('# Para printer_service.py (Raspberry Pi - Cocina)');
    console.log(`KITCHEN_CATEGORIES = [${kitchenCategories.map(id => `"${id}"`).join(', ')}]`);
    console.log('');
    console.log('def should_print_kitchen(order_items):');
    console.log('    """Verificar si el pedido tiene items de cocina"""');
    console.log('    for item in order_items:');
    console.log('        menu_item = supabase.table("menu_items")\\');
    console.log('            .select("category_id")\\');
    console.log('            .eq("id", item["menu_item_id"])\\');
    console.log('            .single()\\');
    console.log('            .execute()');
    console.log('        ');
    console.log('        if menu_item.data["category_id"] in KITCHEN_CATEGORIES:');
    console.log('            return True');
    console.log('    return False');
    console.log('```');
    
    console.log('');
    console.log('```python');
    console.log('# Para xprinter_service.py (Windows Tablet - Bar)');
    console.log(`BAR_CATEGORIES = [${barCategories.map(id => `"${id}"`).join(', ')}]`);
    console.log('');
    console.log('def should_print_bar(order_items):');
    console.log('    """Verificar si el pedido tiene items de bar"""');
    console.log('    for item in order_items:');
    console.log('        menu_item = supabase.table("menu_items")\\');
    console.log('            .select("category_id")\\');
    console.log('            .entity("id", item["menu_item_id"])\\');
    console.log('            .single()\\');
    console.log('            .execute()');
    console.log('        ');
    console.log('        if menu_item.data["category_id"] in BAR_CATEGORIES:');
    console.log('            return True');
    console.log('    return False');
    console.log('```');
    
    return {
      categories: categories || [],
      kitchenCategories,
      barCategories,
      totalItems: items?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error en análisis:', error);
  }
}

async function generatePrinterServiceTemplate() {
  console.log('\n📄 GENERANDO TEMPLATE DE SERVICIO MEJORADO');
  console.log('==========================================');
  
  console.log('\n🔧 ESTRUCTURA RECOMENDADA PARA AMBOS SERVICIOS:');
  console.log('```python');
  console.log('import time');
  console.log('from supabase import create_client, Client');
  console.log('');
  console.log('# Configuración');
  console.log('SUPABASE_URL = "https://osvgapxefsqqhltkabku.supabase.co"');
  console.log('SUPABASE_KEY = "tu_service_role_key"');
  console.log('RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"');
  console.log('');
  console.log('def check_printer_active(printer_type):');
  console.log('    """Verificar si la impresora está activa"""');
  console.log('    try:');
  console.log('        response = supabase.table("printers")\\');
  console.log('            .select("is_active")\\');
  console.log('            .eq("restaurant_id", RESTAURANT_ID)\\');
  console.log('            .eq("type", printer_type)\\');
  console.log('            .single()\\');
  console.log('            .execute()');
  console.log('        ');
  console.log('        return response.data.get("is_active", False)');
  console.log('    except Exception as e:');
  console.log('        print(f"Error checking printer status: {e}")');
  console.log('        return False');
  console.log('');
  console.log('def main_loop():');
  console.log('    while True:');
  console.log('        try:');
  console.log('            # 1. Verificar si impresora está activa');
  console.log('            if not check_printer_active("kitchen"):  # o "drink"');
  console.log('                print("Impresora desactivada, esperando...")');
  console.log('                time.sleep(10)');
  console.log('                continue');
  console.log('            ');
  console.log('            # 2. Buscar pedidos pendientes');
  console.log('            # 3. Filtrar por tipo de item');
  console.log('            # 4. Imprimir si corresponde');
  console.log('            # 5. Actualizar flag');
  console.log('            ');
  console.log('            time.sleep(5)');
  console.log('        except Exception as e:');
  console.log('            print(f"Error en loop principal: {e}")');
  console.log('            time.sleep(10)');
  console.log('```');
}

// Execute analysis
analyzeCategoriesAndItems().then(result => {
  if (result) {
    generatePrinterServiceTemplate();
    console.log('\n🎯 ANÁLISIS COMPLETADO');
    console.log(`Encontradas ${result.categories.length} categorías y ${result.totalItems} items`);
    console.log('Templates de código generados para implementación');
  }
});
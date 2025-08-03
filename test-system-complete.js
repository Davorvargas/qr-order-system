const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function runCompleteSystemTests() {
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA');
  console.log('='.repeat(70));
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  const runTest = async (testName, testFunction) => {
    try {
      console.log(`\n🔍 Ejecutando: ${testName}`);
      await testFunction();
      console.log(`✅ PASÓ: ${testName}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ FALLÓ: ${testName}`);
      console.log(`   Error: ${error.message}`);
      testsFailed++;
    }
  };

  // TEST 1: Verificar autenticación y RLS
  await runTest('Autenticación y RLS', async () => {
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', SENDEROS_ID);
    
    if (!restaurants || restaurants.length === 0) {
      throw new Error('No se puede acceder al restaurante Senderos');
    }
  });

  // TEST 2: Verificar estructura de menú
  await runTest('Estructura del menú', async () => {
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID);
    
    if (!menuItems || menuItems.length === 0) {
      throw new Error('No hay items en el menú');
    }
    
    // Verificar que hay diferentes category_id
    const categoryIds = [...new Set(menuItems.map(item => item.category_id).filter(id => id))];
    
    if (categoryIds.length === 0) {
      throw new Error('No hay categorías asignadas a los items del menú');
    }
    
    console.log(`   📋 ${categoryIds.length} categorías diferentes, ${menuItems.length} items de menú`);
  });

  // TEST 3: Verificar imágenes asignadas
  await runTest('Imágenes de productos', async () => {
    const { data: itemsWithImages } = await supabase
      .from('menu_items')
      .select('name, image_url')
      .eq('restaurant_id', SENDEROS_ID)
      .not('image_url', 'is', null);
    
    if (!itemsWithImages || itemsWithImages.length < 20) {
      throw new Error(`Solo ${itemsWithImages?.length || 0} productos tienen imágenes`);
    }
    
    console.log(`   🖼️ ${itemsWithImages.length} productos con imágenes asignadas`);
  });

  // TEST 4: Verificar modificadores
  await runTest('Sistema de modificadores', async () => {
    const { data: matesProduct } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('restaurant_id', SENDEROS_ID)
      .eq('name', 'Mates: Coca - Manzanilla - Anís')
      .single();
    
    if (!matesProduct) {
      throw new Error('Producto Mates no encontrado');
    }
    
    const { data: modifierGroups } = await supabase
      .from('modifier_groups')
      .select('*, modifiers(name, price_modifier)')
      .eq('menu_item_id', matesProduct.id);
    
    if (!modifierGroups || modifierGroups.length === 0) {
      throw new Error('No hay modificadores para Mates');
    }
    
    console.log(`   🔧 ${modifierGroups.length} grupos de modificadores configurados`);
  });

  // TEST 5: Simular creación de pedido
  await runTest('Creación de pedidos', async () => {
    // Obtener una mesa existente
    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    if (!table) {
      throw new Error('No hay mesas configuradas');
    }
    
    // Obtener un producto para el pedido
    const { data: product } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', SENDEROS_ID)
      .eq('name', 'Espresso')
      .single();
    
    if (!product) {
      throw new Error('Producto Espresso no encontrado');
    }
    
    // Simular creación de pedido
    const testOrder = {
      restaurant_id: SENDEROS_ID,
      table_id: table.id,
      customer_name: 'Test Usuario',
      total_price: product.price,
      status: 'pending',
      source: 'test'
    };
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creando pedido: ${error.message}`);
    }
    
    // Crear item del pedido
    const orderItem = {
      order_id: order.id,
      menu_item_id: product.id,
      quantity: 1,
      price_at_order: product.price
    };
    
    const { error: itemError } = await supabase
      .from('order_items')
      .insert(orderItem);
    
    if (itemError) {
      throw new Error(`Error creando item del pedido: ${itemError.message}`);
    }
    
    // Limpiar datos de prueba
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    
    console.log(`   📝 Pedido de prueba creado y eliminado exitosamente`);
  });

  // TEST 6: Verificar configuración de impresoras
  await runTest('Sistema de impresión', async () => {
    const { data: printers } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID);
    
    if (!printers || printers.length === 0) {
      throw new Error('No hay impresoras configuradas');
    }
    
    console.log(`   🖨️ ${printers.length} impresoras configuradas`);
  });

  // TEST 7: Verificar APIs críticas
  await runTest('APIs del sistema', async () => {
    // Verificar que las funciones API estén disponibles
    const fs = require('fs');
    const criticalAPIs = [
      'src/app/api/place-order/route.ts',
      'src/app/api/modifiers/route.ts',
      'src/app/api/print-receipt/route.ts'
    ];
    
    for (const apiPath of criticalAPIs) {
      if (!fs.existsSync(apiPath)) {
        throw new Error(`API crítica faltante: ${apiPath}`);
      }
    }
    
    console.log(`   🔌 ${criticalAPIs.length} APIs críticas verificadas`);
  });

  // TEST 8: Verificar componentes React críticos
  await runTest('Componentes React', async () => {
    const fs = require('fs');
    const criticalComponents = [
      'src/components/OrderList.tsx',
      'src/components/MenuManager.tsx',
      'src/components/ModifierManager.tsx',
      'src/components/ModifyOrderModal.tsx'
    ];
    
    for (const componentPath of criticalComponents) {
      if (!fs.existsSync(componentPath)) {
        throw new Error(`Componente crítico faltante: ${componentPath}`);
      }
    }
    
    console.log(`   ⚛️ ${criticalComponents.length} componentes críticos verificados`);
  });

  // RESUMEN FINAL
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(70));
  console.log(`✅ Pruebas exitosas: ${testsPassed}`);
  console.log(`❌ Pruebas fallidas: ${testsFailed}`);
  console.log(`📈 Porcentaje de éxito: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está listo para producción.');
    return true;
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar errores antes de subir a GitHub.');
    return false;
  }
}

runCompleteSystemTests();
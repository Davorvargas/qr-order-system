const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function checkOrderItemsStructure() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE ORDER_ITEMS');
  
  try {
    // Obtener una mesa existente
    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    if (!table) {
      console.log('❌ No hay mesas configuradas');
      return;
    }
    
    // Crear una orden de prueba
    const { data: testOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: SENDEROS_ID,
        table_id: table.id,
        customer_name: 'Test Structure',
        status: 'pending',
        total_price: 10.0,
        source: 'test'
      })
      .select()
      .single();
    
    if (orderError) {
      console.log('❌ Error creando orden de prueba:', orderError);
      return;
    }
    
    console.log('✅ Orden de prueba creada');
    
    // Obtener un producto existente
    const { data: product } = await supabase
      .from('menu_items')
      .select('id, price')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1)
      .single();
    
    if (!product) {
      console.log('❌ No se encontró producto para prueba');
      return;
    }
    
    console.log('✅ Producto encontrado:', product);
    
    // Intentar diferentes nombres de columnas para el precio
    const columnVariations = ['price', 'unit_price', 'item_price'];
    let correctColumn = null;
    
    for (const priceColumn of columnVariations) {
      console.log(`Probando columna: ${priceColumn}`);
      
      const testItem = {
        order_id: testOrder.id,
        menu_item_id: product.id,
        quantity: 1
      };
      
      testItem[priceColumn] = product.price;
      
      const { data: insertedItem, error: itemError } = await supabase
        .from('order_items')
        .insert(testItem)
        .select();
      
      if (!itemError && insertedItem) {
        console.log(`✅ Columna correcta para precio: ${priceColumn}`);
        console.log('Estructura del item creado:', Object.keys(insertedItem[0]));
        correctColumn = priceColumn;
        
        // Limpiar este item
        await supabase.from('order_items').delete().eq('order_id', testOrder.id);
        break;
      } else {
        console.log(`❌ ${priceColumn}: ${itemError?.message || 'Error desconocido'}`);
      }
    }
    
    // Intentar sin columna de precio
    if (!correctColumn) {
      console.log('Probando sin columna de precio...');
      
      const testItem = {
        order_id: testOrder.id,
        menu_item_id: product.id,
        quantity: 1
      };
      
      const { data: insertedItem, error: itemError } = await supabase
        .from('order_items')
        .insert(testItem)
        .select();
      
      if (!itemError && insertedItem) {
        console.log('✅ Item creado sin columna de precio');
        console.log('Estructura del item:', Object.keys(insertedItem[0]));
        console.log('Valores del item:', insertedItem[0]);
      } else {
        console.log(`❌ Sin precio: ${itemError?.message || 'Error desconocido'}`);
      }
    }
    
    // Limpiar orden de prueba
    await supabase.from('order_items').delete().eq('order_id', testOrder.id);
    await supabase.from('orders').delete().eq('id', testOrder.id);
    
    console.log('✅ Datos de prueba limpiados');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkOrderItemsStructure();
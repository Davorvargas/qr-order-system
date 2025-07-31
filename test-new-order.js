// Script para crear una orden de prueba y verificar que funciona la nueva lógica
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewOrder() {
  console.log('🧪 Creando orden de prueba...\n');
  
  try {
    // Primero verificar impresoras activas
    const { data: activePrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('is_active', true);
    
    console.log(`📊 Impresoras activas: ${activePrinters?.length || 0}`);
    
    // Obtener una mesa existente
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .limit(1);
    
    if (!tables || tables.length === 0) {
      console.error('❌ No hay mesas disponibles');
      return;
    }
    
    const table = tables[0];
    console.log(`🪑 Usando mesa: ${table.table_number} (ID: ${table.id})`);
    
    // Obtener un item del menú
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1);
    
    if (!menuItems || menuItems.length === 0) {
      console.error('❌ No hay items de menú disponibles');
      return;
    }
    
    const menuItem = menuItems[0];
    console.log(`🍽️ Usando item: ${menuItem.name} ($${menuItem.price})`);
    
    // Crear orden de prueba
    const orderData = {
      table_id: table.id,
      customer_name: 'PRUEBA LÓGICA IMPRESORAS',
      total_price: menuItem.price,
      notes: 'Orden de prueba para verificar lógica de impresoras',
      order_items: [
        {
          menu_item_id: menuItem.id,
          quantity: 1,
          price_at_order: menuItem.price,
          notes: null
        }
      ]
    };
    
    console.log('\n📤 Enviando orden...');
    
    // Llamar a la edge function
    const { data: result, error } = await supabase.functions.invoke('place-order', {
      body: orderData
    });
    
    if (error) {
      console.error('❌ Error creando orden:', error);
      return;
    }
    
    console.log('✅ Orden creada exitosamente:', result);
    
    // Verificar el status de la orden creada
    const { data: newOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', result.order_id)
      .single();
    
    if (newOrder) {
      console.log(`\n📋 RESULTADO:`);
      console.log(`Orden #${newOrder.id}`);
      console.log(`Status: ${newOrder.status}`);
      console.log(`Cliente: ${newOrder.customer_name}`);
      console.log(`Total: $${newOrder.total_price}`);
      
      // Verificar si el status es correcto
      const expectedStatus = (activePrinters?.length || 0) > 0 ? 'pending' : 'in_progress';
      const isCorrect = newOrder.status === expectedStatus;
      
      console.log(`\n🎯 VERIFICACIÓN:`);
      console.log(`Impresoras activas: ${activePrinters?.length || 0}`);
      console.log(`Status esperado: ${expectedStatus}`);
      console.log(`Status actual: ${newOrder.status}`);
      console.log(`${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
testNewOrder();
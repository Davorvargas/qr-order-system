const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos
const senderosTableId = 'cf06cf5e-f263-4397-a9b9-e184c35e89c0'; // Mesa 1 de Senderos

async function debugSoundDuplication() {
  console.log('🔊 DIAGNÓSTICO DE DUPLICACIÓN DE SONIDO');
  console.log('='.repeat(50));
  
  try {
    // Obtener menu items de Senderos
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(1);
      
    if (!menuItems || menuItems.length === 0) {
      console.log('❌ No hay menu items en Senderos');
      return;
    }
    
    console.log('📋 Menu item disponible:', menuItems[0].name);
    
    // Crear orden de prueba
    console.log('\n📝 CREANDO ORDEN DE PRUEBA PARA DIAGNÓSTICO...');
    console.log('='.repeat(55));
    
    const testOrder = {
      table_id: senderosTableId,
      customer_name: '🔊 DIAGNÓSTICO SONIDO - ' + new Date().toLocaleTimeString(),
      total_price: menuItems[0].price,
      notes: 'Orden para diagnosticar duplicación de sonido',
      order_items: [
        {
          menu_item_id: menuItems[0].id,
          quantity: 1,
          price_at_order: menuItems[0].price,
          notes: 'Item de diagnóstico'
        }
      ]
    };
    
    console.log('📦 Enviando orden de diagnóstico...');
    console.log('🔍 INSTRUCCIONES:');
    console.log('   1. Abre el dashboard de Senderos');
    console.log('   2. Abre la consola del navegador (F12)');
    console.log('   3. Busca mensajes que contengan "🔊"');
    console.log('   4. Cuenta cuántas veces aparece "🔊 Nuevo pedido recibido!"');
    console.log('   5. Verifica si escuchas el sonido una o más veces');
    
    const response = await fetch('https://osvgapxefsqqhltkabku.supabase.co/functions/v1/place-order-public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(testOrder)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`\n✅ Orden creada: #${result.order_id}`);
      console.log('🔊 Deberías escuchar el sonido UNA SOLA VEZ');
      console.log('📊 Verifica en la consola cuántos mensajes "🔊 Nuevo pedido recibido!" aparecen');
      
      // Esperar 5 segundos para que el usuario pueda verificar
      console.log('\n⏳ Esperando 5 segundos para verificación...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
      console.log('='.repeat(30));
      console.log('📊 RESULTADOS ESPERADOS:');
      console.log('   ✅ 1 mensaje "🔊 Nuevo pedido recibido!" en consola');
      console.log('   ✅ 1 reproducción de sonido');
      console.log('   ❌ NO debería haber duplicados');
      
      console.log('\n🔍 SI HAY DUPLICADOS:');
      console.log('   - Verificar si hay múltiples pestañas abiertas');
      console.log('   - Verificar si hay múltiples componentes GlobalNotificationService');
      console.log('   - Verificar si OrderList también reproduce sonido');
      
    } else {
      console.error('❌ Error creando orden:', result);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar diagnóstico
debugSoundDuplication(); 
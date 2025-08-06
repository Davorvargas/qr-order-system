const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

// IDs de restaurantes
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos
const pruebasRestaurantId = 'a01006de-3963-406d-b060-5b7b34623a38'; // Restaurante de Pruebas

// IDs de mesas
const senderosTableId = 'cf06cf5e-f263-4397-a9b9-e184c35e89c0'; // Mesa 1 de Senderos
const pruebasTableId = '861b499b-8294-4a83-b7b1-dcd316334db5'; // Mesa 1 de Pruebas

async function testSoundIsolation() {
  console.log('🔊 PRUEBA DE AISLAMIENTO DE SONIDO');
  console.log('='.repeat(50));
  
  try {
    // Obtener menu items de ambos restaurantes
    const { data: senderosMenuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', senderosRestaurantId)
      .limit(1);
      
    const { data: pruebasMenuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', pruebasRestaurantId)
      .limit(1);
      
    if (!senderosMenuItems || senderosMenuItems.length === 0) {
      console.log('❌ No hay menu items en Senderos');
      return;
    }
    
    if (!pruebasMenuItems || pruebasMenuItems.length === 0) {
      console.log('❌ No hay menu items en Restaurante de Pruebas');
      return;
    }
    
    console.log('📋 Menu items disponibles en ambos restaurantes');
    
    // Crear orden en Senderos
    console.log('\n📝 CREANDO ORDEN EN SENDEROS...');
    console.log('='.repeat(35));
    
    const senderosOrder = {
      table_id: senderosTableId,
      customer_name: '🔊 PRUEBA SONIDO - SENDEROS - ' + new Date().toLocaleTimeString(),
      total_price: senderosMenuItems[0].price,
      notes: 'Orden para probar sonido en Senderos',
      order_items: [
        {
          menu_item_id: senderosMenuItems[0].id,
          quantity: 1,
          price_at_order: senderosMenuItems[0].price,
          notes: 'Item de prueba Senderos'
        }
      ]
    };
    
    console.log('📦 Enviando orden a Senderos...');
    const senderosResponse = await fetch('https://osvgapxefsqqhltkabku.supabase.co/functions/v1/place-order-public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(senderosOrder)
    });
    
    const senderosResult = await senderosResponse.json();
    
    if (senderosResponse.ok) {
      console.log(`✅ Orden creada en Senderos: #${senderosResult.order_id}`);
      console.log('🔊 Deberías escuchar el sonido de nueva orden si estás en Senderos');
    } else {
      console.error('❌ Error creando orden en Senderos:', senderosResult);
    }
    
    // Esperar 3 segundos
    console.log('\n⏳ Esperando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Crear orden en Restaurante de Pruebas
    console.log('\n📝 CREANDO ORDEN EN RESTAURANTE DE PRUEBAS...');
    console.log('='.repeat(45));
    
    const pruebasOrder = {
      table_id: pruebasTableId,
      customer_name: '🔊 PRUEBA SONIDO - PRUEBAS - ' + new Date().toLocaleTimeString(),
      total_price: pruebasMenuItems[0].price,
      notes: 'Orden para probar sonido en Restaurante de Pruebas',
      order_items: [
        {
          menu_item_id: pruebasMenuItems[0].id,
          quantity: 1,
          price_at_order: pruebasMenuItems[0].price,
          notes: 'Item de prueba Pruebas'
        }
      ]
    };
    
    console.log('📦 Enviando orden a Restaurante de Pruebas...');
    const pruebasResponse = await fetch('https://osvgapxefsqqhltkabku.supabase.co/functions/v1/place-order-public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(pruebasOrder)
    });
    
    const pruebasResult = await pruebasResponse.json();
    
    if (pruebasResponse.ok) {
      console.log(`✅ Orden creada en Restaurante de Pruebas: #${pruebasResult.order_id}`);
      console.log('🔇 NO deberías escuchar sonido si estás en Senderos');
    } else {
      console.error('❌ Error creando orden en Restaurante de Pruebas:', pruebasResult);
    }
    
    console.log('\n🎯 RESUMEN DE LA PRUEBA DE SONIDO');
    console.log('='.repeat(35));
    console.log('✅ Orden creada en Senderos (debería sonar)');
    console.log('✅ Orden creada en Restaurante de Pruebas (NO debería sonar)');
    console.log('✅ Verifica que solo escuchaste un sonido (el de Senderos)');
    console.log('✅ Si escuchaste dos sonidos, hay un problema con el filtrado');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba de aislamiento de sonido
testSoundIsolation(); 
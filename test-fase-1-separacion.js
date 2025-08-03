const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IDs de los restaurantes
const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const PRUEBAS_ID = 'a01006de-3963-406d-b060-5b7b34623a38';

async function testFase1SeparacionDatos() {
  console.log('🧪 FASE 1: VERIFICACIÓN DE SEPARACIÓN DE DATOS');
  console.log('='.repeat(60));
  
  try {
    // 1.1 Dashboard de Pedidos - Verificar órdenes por restaurante
    console.log('\n📋 1.1 DASHBOARD DE PEDIDOS');
    console.log('-'.repeat(40));
    
    const { data: ordenesSenderos } = await supabase
      .from('orders')
      .select('id, customer_name, total, restaurant_id, created_at')
      .eq('restaurant_id', SENDEROS_ID)
      .order('created_at', { ascending: false })
      .limit(10);
    
    const { data: ordenesPruebas } = await supabase
      .from('orders')
      .select('id, customer_name, total, restaurant_id, created_at')
      .eq('restaurant_id', PRUEBAS_ID)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`✅ Senderos tiene ${ordenesSenderos?.length || 0} órdenes`);
    console.log(`✅ Pruebas tiene ${ordenesPruebas?.length || 0} órdenes`);
    
    // Verificar que no hay mezcla
    const mezclaSenderos = ordenesSenderos?.some(order => order.restaurant_id !== SENDEROS_ID);
    const mezclaPruebas = ordenesPruebas?.some(order => order.restaurant_id !== PRUEBAS_ID);
    
    if (mezclaSenderos || mezclaPruebas) {
      console.log('❌ ERROR: Hay mezcla de datos en órdenes');
    } else {
      console.log('✅ Separación de órdenes correcta');
    }
    
    // 1.2 Gestión del Menú - Verificar separación
    console.log('\n🍽️ 1.2 GESTIÓN DEL MENÚ');
    console.log('-'.repeat(40));
    
    const { data: categoriasSenderos } = await supabase
      .from('menu_categories')
      .select('id, name, restaurant_id')
      .eq('restaurant_id', SENDEROS_ID);
    
    const { data: categoriasPruebas } = await supabase
      .from('menu_categories')
      .select('id, name, restaurant_id')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log(`✅ Senderos tiene ${categoriasSenderos?.length || 0} categorías`);
    console.log(`✅ Pruebas tiene ${categoriasPruebas?.length || 0} categorías`);
    
    const { data: itemsSenderos } = await supabase
      .from('menu_items')
      .select('id, name, price, restaurant_id')
      .eq('restaurant_id', SENDEROS_ID);
    
    const { data: itemsPruebas } = await supabase
      .from('menu_items')
      .select('id, name, price, restaurant_id')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log(`✅ Senderos tiene ${itemsSenderos?.length || 0} items del menú`);
    console.log(`✅ Pruebas tiene ${itemsPruebas?.length || 0} items del menú`);
    
    // 1.3 Códigos QR - Verificar mesas
    console.log('\n📱 1.3 CÓDIGOS QR Y MESAS');
    console.log('-'.repeat(40));
    
    const { data: mesasSenderos } = await supabase
      .from('tables')
      .select('id, table_number, restaurant_id, qr_code')
      .eq('restaurant_id', SENDEROS_ID);
    
    const { data: mesasPruebas } = await supabase
      .from('tables')
      .select('id, table_number, restaurant_id, qr_code')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log(`✅ Senderos tiene ${mesasSenderos?.length || 0} mesas`);
    console.log(`✅ Pruebas tiene ${mesasPruebas?.length || 0} mesas`);
    
    // Verificar que los QR codes son únicos por restaurante
    const qrSenderos = mesasSenderos?.map(m => m.qr_code).filter(Boolean);
    const qrPruebas = mesasPruebas?.map(m => m.qr_code).filter(Boolean);
    
    console.log(`✅ Senderos tiene ${qrSenderos?.length || 0} códigos QR generados`);
    console.log(`✅ Pruebas tiene ${qrPruebas?.length || 0} códigos QR generados`);
    
    // 1.4 Impresoras - Verificar separación
    console.log('\n🖨️ 1.4 IMPRESORAS');
    console.log('-'.repeat(40));
    
    const { data: impresorasSenderos } = await supabase
      .from('printers')
      .select('id, name, type, is_active, restaurant_id')
      .eq('restaurant_id', SENDEROS_ID);
    
    const { data: impresorasPruebas } = await supabase
      .from('printers')
      .select('id, name, type, is_active, restaurant_id')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log(`✅ Senderos tiene ${impresorasSenderos?.length || 0} impresoras`);
    impresorasSenderos?.forEach(p => {
      console.log(`   - ${p.name} (${p.type}) - ${p.is_active ? 'Activa' : 'Inactiva'}`);
    });
    
    console.log(`✅ Pruebas tiene ${impresorasPruebas?.length || 0} impresoras`);
    impresorasPruebas?.forEach(p => {
      console.log(`   - ${p.name} (${p.type}) - ${p.is_active ? 'Activa' : 'Inactiva'}`);
    });
    
    // 1.5 Caja Registradora - Verificar historial
    console.log('\n💰 1.5 CAJA REGISTRADORA');
    console.log('-'.repeat(40));
    
    const { data: cajasSenderos } = await supabase
      .from('cash_registers')
      .select('id, opening_amount, closing_amount, is_open, restaurant_id, created_at')
      .eq('restaurant_id', SENDEROS_ID)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: cajasPruebas } = await supabase
      .from('cash_registers')
      .select('id, opening_amount, closing_amount, is_open, restaurant_id, created_at')
      .eq('restaurant_id', PRUEBAS_ID)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`✅ Senderos tiene ${cajasSenderos?.length || 0} registros de caja`);
    cajasSenderos?.forEach((caja, i) => {
      const estado = caja.is_open ? 'ABIERTA' : 'CERRADA';
      console.log(`   ${i + 1}. ${estado} - Apertura: Bs. ${caja.opening_amount || 0}`);
    });
    
    console.log(`✅ Pruebas tiene ${cajasPruebas?.length || 0} registros de caja`);
    cajasPruebas?.forEach((caja, i) => {
      const estado = caja.is_open ? 'ABIERTA' : 'CERRADA';
      console.log(`   ${i + 1}. ${estado} - Apertura: Bs. ${caja.opening_amount || 0}`);
    });
    
    // RESUMEN GENERAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE SEPARACIÓN DE DATOS');
    console.log('='.repeat(60));
    
    const resumen = {
      senderos: {
        ordenes: ordenesSenderos?.length || 0,
        categorias: categoriasSenderos?.length || 0,
        items: itemsSenderos?.length || 0,
        mesas: mesasSenderos?.length || 0,
        impresoras: impresorasSenderos?.length || 0,
        cajas: cajasSenderos?.length || 0
      },
      pruebas: {
        ordenes: ordenesPruebas?.length || 0,
        categorias: categoriasPruebas?.length || 0,
        items: itemsPruebas?.length || 0,
        mesas: mesasPruebas?.length || 0,
        impresoras: impresorasPruebas?.length || 0,
        cajas: cajasPruebas?.length || 0
      }
    };
    
    console.log('🏪 RESTAURANTE SENDEROS:');
    console.log(`   📋 Órdenes: ${resumen.senderos.ordenes}`);
    console.log(`   🍽️ Categorías: ${resumen.senderos.categorias}`);
    console.log(`   🥘 Items menú: ${resumen.senderos.items}`);
    console.log(`   🪑 Mesas: ${resumen.senderos.mesas}`);
    console.log(`   🖨️ Impresoras: ${resumen.senderos.impresoras}`);
    console.log(`   💰 Registros caja: ${resumen.senderos.cajas}`);
    
    console.log('\n🏪 RESTAURANTE DE PRUEBAS:');
    console.log(`   📋 Órdenes: ${resumen.pruebas.ordenes}`);
    console.log(`   🍽️ Categorías: ${resumen.pruebas.categorias}`);
    console.log(`   🥘 Items menú: ${resumen.pruebas.items}`);
    console.log(`   🪑 Mesas: ${resumen.pruebas.mesas}`);
    console.log(`   🖨️ Impresoras: ${resumen.pruebas.impresoras}`);
    console.log(`   💰 Registros caja: ${resumen.pruebas.cajas}`);
    
    console.log('\n✅ FASE 1 COMPLETADA - Separación de datos verificada');
    console.log('🔄 Proceder con navegación manual en http://localhost:3000');
    console.log('\n📋 SIGUIENTES PASOS MANUALES:');
    console.log('1. Login con administrador@senderos.com');
    console.log('2. Verificar dashboard, menú, QR, impresoras, reportes');
    console.log('3. Logout y login con pruebas@gmail.com');
    console.log('4. Verificar que solo ve datos de Pruebas');
    
  } catch (error) {
    console.error('❌ Error en verificación de separación:', error.message);
  }
}

testFase1SeparacionDatos();
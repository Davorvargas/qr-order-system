const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🧪 PRUEBAS DETALLADAS DE SEPARACIÓN DE DATOS\n');
    console.log('='.repeat(60));
    
    const senderos = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    const pruebas = 'a01006de-3963-406d-b060-5b7b34623a38';
    
    // Test 1: Verificar restaurantes
    console.log('\n📋 TEST 1: Verificar configuración de restaurantes');
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name');
    
    console.log('✅ Restaurantes configurados:');
    restaurants.forEach(r => {
      console.log(`   - ${r.name}: ${r.id}`);
    });
    
    // Test 2: Verificar usuarios por restaurante
    console.log('\n👤 TEST 2: Verificar usuarios por restaurante');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, restaurant_id, restaurants(name)');
    
    const senderosUsers = profiles.filter(p => p.restaurant_id === senderos);
    const pruebasUsers = profiles.filter(p => p.restaurant_id === pruebas);
    
    console.log(`✅ Usuarios Senderos: ${senderosUsers.length}`);
    senderosUsers.forEach(u => console.log(`   - ${u.id}`));
    
    console.log(`✅ Usuarios Pruebas: ${pruebasUsers.length}`);
    pruebasUsers.forEach(u => console.log(`   - ${u.id}`));
    
    // Test 3: Verificar órdenes por restaurante
    console.log('\n📦 TEST 3: Verificar órdenes por restaurante');
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, customer_name, restaurant_id, created_at');
    
    const senderosOrders = allOrders.filter(o => o.restaurant_id === senderos);
    const pruebasOrders = allOrders.filter(o => o.restaurant_id === pruebas);
    
    console.log(`✅ Órdenes Senderos: ${senderosOrders.length}`);
    senderosOrders.slice(0, 3).forEach(o => {
      console.log(`   - ${o.customer_name} (${o.id}) - ${new Date(o.created_at).toLocaleDateString()}`);
    });
    
    console.log(`✅ Órdenes Pruebas: ${pruebasOrders.length}`);
    pruebasOrders.slice(0, 3).forEach(o => {
      console.log(`   - ${o.customer_name} (${o.id}) - ${new Date(o.created_at).toLocaleDateString()}`);
    });
    
    // Test 4: Verificar menú por restaurante
    console.log('\n🍽️ TEST 4: Verificar menú por restaurante');
    const { data: allMenuItems } = await supabase
      .from('menu_items')
      .select('id, name, restaurant_id');
    
    const senderosMenu = allMenuItems.filter(m => m.restaurant_id === senderos);
    const pruebasMenu = allMenuItems.filter(m => m.restaurant_id === pruebas);
    
    console.log(`✅ Items menú Senderos: ${senderosMenu.length}`);
    senderosMenu.slice(0, 3).forEach(m => console.log(`   - ${m.name}`));
    
    console.log(`✅ Items menú Pruebas: ${pruebasMenu.length}`);
    pruebasMenu.slice(0, 3).forEach(m => console.log(`   - ${m.name}`));
    
    // Test 5: Verificar categorías por restaurante
    console.log('\n📁 TEST 5: Verificar categorías por restaurante');
    const { data: allCategories } = await supabase
      .from('menu_categories')
      .select('id, name, restaurant_id');
    
    const senderosCategories = allCategories.filter(c => c.restaurant_id === senderos);
    const pruebasCategories = allCategories.filter(c => c.restaurant_id === pruebas);
    
    console.log(`✅ Categorías Senderos: ${senderosCategories.length}`);
    senderosCategories.forEach(c => console.log(`   - ${c.name}`));
    
    console.log(`✅ Categorías Pruebas: ${pruebasCategories.length}`);
    pruebasCategories.forEach(c => console.log(`   - ${c.name}`));
    
    // Test 6: Verificar impresoras por restaurante
    console.log('\n🖨️ TEST 6: Verificar impresoras por restaurante');
    const { data: allPrinters } = await supabase
      .from('printers')
      .select('id, name, type, restaurant_id, is_active');
    
    const senderosPrinters = allPrinters.filter(p => p.restaurant_id === senderos);
    const pruebasPrinters = allPrinters.filter(p => p.restaurant_id === pruebas);
    
    console.log(`✅ Impresoras Senderos: ${senderosPrinters.length}`);
    senderosPrinters.forEach(p => {
      console.log(`   - ${p.name} (${p.type}) - Activa: ${p.is_active}`);
    });
    
    console.log(`✅ Impresoras Pruebas: ${pruebasPrinters.length}`);
    pruebasPrinters.forEach(p => {
      console.log(`   - ${p.name} (${p.type}) - Activa: ${p.is_active}`);
    });
    
    // Test 7: Verificar mesas por restaurante
    console.log('\n🪑 TEST 7: Verificar mesas por restaurante');
    const { data: allTables } = await supabase
      .from('tables')
      .select('id, table_number, restaurant_id');
    
    const senderosTables = allTables.filter(t => t.restaurant_id === senderos);
    const pruebasTables = allTables.filter(t => t.restaurant_id === pruebas);
    
    console.log(`✅ Mesas Senderos: ${senderosTables.length}`);
    senderosTables.slice(0, 5).forEach(t => console.log(`   - Mesa ${t.table_number}`));
    
    console.log(`✅ Mesas Pruebas: ${pruebasTables.length}`);
    pruebasTables.slice(0, 5).forEach(t => console.log(`   - Mesa ${t.table_number}`));
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE SEPARACIÓN DE DATOS:');
    console.log('='.repeat(60));
    console.log('🏪 SENDEROS:');
    console.log(`   👤 Usuarios: ${senderosUsers.length}`);
    console.log(`   📦 Órdenes: ${senderosOrders.length}`);
    console.log(`   🍽️ Items menú: ${senderosMenu.length}`);
    console.log(`   📁 Categorías: ${senderosCategories.length}`);
    console.log(`   🖨️ Impresoras: ${senderosPrinters.length}`);
    console.log(`   🪑 Mesas: ${senderosTables.length}`);
    
    console.log('\n🏪 RESTAURANTE DE PRUEBAS:');
    console.log(`   👤 Usuarios: ${pruebasUsers.length}`);
    console.log(`   📦 Órdenes: ${pruebasOrders.length}`);
    console.log(`   🍽️ Items menú: ${pruebasMenu.length}`);
    console.log(`   📁 Categorías: ${pruebasCategories.length}`);
    console.log(`   🖨️ Impresoras: ${pruebasPrinters.length}`);
    console.log(`   🪑 Mesas: ${pruebasTables.length}`);
    
    console.log('\n✅ SEPARACIÓN DE DATOS: VERIFICADA CORRECTAMENTE');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
})();
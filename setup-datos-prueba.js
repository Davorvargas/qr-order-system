const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IDs de los restaurantes
const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const PRUEBAS_ID = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function setupDatosPrueba() {
  console.log('🚀 CONFIGURACIÓN DE DATOS DE PRUEBA');
  console.log('='.repeat(60));
  
  try {
    // 1. Configurar menú para Restaurante de Pruebas
    console.log('\n🍽️ CONFIGURANDO MENÚ PARA RESTAURANTE DE PRUEBAS');
    console.log('-'.repeat(50));
    
    // Categorías para Pruebas
    const categoriasPruebas = [
      { name: 'Hamburguesas', display_order: 1, restaurant_id: PRUEBAS_ID },
      { name: 'Pizzas', display_order: 2, restaurant_id: PRUEBAS_ID },
      { name: 'Bebidas', display_order: 3, restaurant_id: PRUEBAS_ID }
    ];
    
    // Verificar si ya existen categorías para Pruebas
    const { data: categoriasExistentes } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID);
    
    let categoriasCreadas = categoriasExistentes || [];
    
    if (!categoriasExistentes || categoriasExistentes.length === 0) {
      const { data: nuevasCategorias, error: errorCategorias } = await supabase
        .from('menu_categories')
        .insert(categoriasPruebas)
        .select();
      
      if (errorCategorias) {
        console.error('Error creando categorías:', errorCategorias);
        return;
      }
      categoriasCreadas = nuevasCategorias;
    }
    
    console.log(`✅ ${categoriasCreadas.length} categorías disponibles para Pruebas`);
    
    // Items del menú para Pruebas
    const itemsPruebas = [
      // Hamburguesas
      { 
        name: 'Hamburguesa Clásica', 
        price: 25.00, 
        description: 'Carne, lechuga, tomate, cebolla', 
        category_id: categoriasCreadas.find(c => c.name === 'Hamburguesas')?.id,
        restaurant_id: PRUEBAS_ID,
        display_order: 1,
        is_available: true
      },
      { 
        name: 'Hamburguesa Especial', 
        price: 35.00, 
        description: 'Doble carne, queso, bacon, salsas especiales', 
        category_id: categoriasCreadas.find(c => c.name === 'Hamburguesas')?.id,
        restaurant_id: PRUEBAS_ID,
        display_order: 2,
        is_available: true
      },
      // Pizzas
      { 
        name: 'Pizza Margherita', 
        price: 30.00, 
        description: 'Tomate, mozzarella, albahaca', 
        category_id: categoriasCreadas.find(c => c.name === 'Pizzas')?.id,
        restaurant_id: PRUEBAS_ID,
        display_order: 1,
        is_available: true
      },
      { 
        name: 'Pizza Pepperoni', 
        price: 40.00, 
        description: 'Pepperoni, mozzarella, salsa de tomate', 
        category_id: categoriasCreadas.find(c => c.name === 'Pizzas')?.id,
        restaurant_id: PRUEBAS_ID,
        display_order: 2,
        is_available: true
      },
      // Bebidas
      { 
        name: 'Coca Cola', 
        price: 8.00, 
        description: 'Refresco de cola 500ml', 
        category_id: categoriasCreadas.find(c => c.name === 'Bebidas')?.id,
        restaurant_id: PRUEBAS_ID,
        display_order: 1,
        is_available: true
      },
      { 
        name: 'Agua Mineral', 
        price: 5.00, 
        description: 'Agua mineral natural 500ml', 
        category_id: categoriasCreadas.find(c => c.name === 'Bebidas')?.id,
        restaurant_id: PRUEBAS_ID,
        display_order: 2,
        is_available: true
      }
    ];
    
    // Verificar si ya existen items para Pruebas
    const { data: itemsExistentes } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID);
    
    let itemsCreados = itemsExistentes || [];
    
    if (!itemsExistentes || itemsExistentes.length === 0) {
      const { data: nuevosItems, error: errorItems } = await supabase
        .from('menu_items')
        .insert(itemsPruebas)
        .select();
      
      if (errorItems) {
        console.error('Error creando items:', errorItems);
        return;
      }
      itemsCreados = nuevosItems;
    }
    
    console.log(`✅ ${itemsCreados.length} items del menú disponibles para Pruebas`);
    
    // 2. Configurar impresoras para Restaurante de Pruebas
    console.log('\n🖨️ CONFIGURANDO IMPRESORAS PARA RESTAURANTE DE PRUEBAS');
    console.log('-'.repeat(50));
    
    const impresorasPruebas = [
      {
        name: 'Impresora Hamburguesas',
        type: 'kitchen',
        restaurant_id: PRUEBAS_ID,
        is_active: true,
        description: 'Impresora para hamburguesas y parrilla',
        location: 'Cocina - Estación parrilla',
        vendor_id: null,
        product_id: null,
        status: 'unknown'
      },
      {
        name: 'Impresora Pizzas',
        type: 'kitchen',
        restaurant_id: PRUEBAS_ID,
        is_active: true,
        description: 'Impresora para pizzas y horno',
        location: 'Cocina - Estación pizzas',
        vendor_id: null,
        product_id: null,
        status: 'unknown'
      },
      {
        name: 'Impresora Bebidas',
        type: 'drink',
        restaurant_id: PRUEBAS_ID,
        is_active: true,
        description: 'Impresora para bar y bebidas',
        location: 'Bar principal',
        vendor_id: null,
        product_id: null,
        status: 'unknown'
      }
    ];
    
    // Verificar si ya existen impresoras para Pruebas
    const { data: impresorasExistentes } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID);
    
    let impresorasCreadas = impresorasExistentes || [];
    
    if (!impresorasExistentes || impresorasExistentes.length === 0) {
      const { data: nuevasImpresoras, error: errorImpresoras } = await supabase
        .from('printers')
        .insert(impresorasPruebas)
        .select();
      
      if (errorImpresoras) {
        console.error('Error creando impresoras:', errorImpresoras);
        return;
      }
      impresorasCreadas = nuevasImpresoras;
    }
    
    console.log(`✅ ${impresorasCreadas.length} impresoras disponibles para Pruebas`);
    
    // 3. Crear mesas para ambos restaurantes
    console.log('\n🪑 CONFIGURANDO MESAS PARA AMBOS RESTAURANTES');
    console.log('-'.repeat(50));
    
    // Mesas para Senderos
    const mesasSenderos = [];
    for (let i = 1; i <= 10; i++) {
      mesasSenderos.push({
        table_number: i,
        restaurant_id: SENDEROS_ID,
        capacity: 4,
        qr_code: null // Se generará después
      });
    }
    
    // Mesas para Pruebas  
    const mesasPruebas = [];
    for (let i = 1; i <= 8; i++) {
      mesasPruebas.push({
        table_number: i,
        restaurant_id: PRUEBAS_ID,
        capacity: 4,
        qr_code: null // Se generará después
      });
    }
    
    // Verificar mesas existentes
    const { data: mesasExistentes } = await supabase
      .from('tables')
      .select('*')
      .in('restaurant_id', [SENDEROS_ID, PRUEBAS_ID]);
    
    let mesasCreadas = mesasExistentes || [];
    
    if (!mesasExistentes || mesasExistentes.length === 0) {
      const { data: nuevasMesas, error: errorMesas } = await supabase
        .from('tables')
        .insert([...mesasSenderos, ...mesasPruebas])
        .select();
      
      if (errorMesas) {
        console.error('Error creando mesas:', errorMesas);
        return;
      }
      mesasCreadas = nuevasMesas;
    }
    
    const mesasExistentesSenderos = mesasCreadas.filter(m => m.restaurant_id === SENDEROS_ID);
    const mesasExistentesPruebas = mesasCreadas.filter(m => m.restaurant_id === PRUEBAS_ID);
    
    console.log(`✅ ${mesasCreadas.length} mesas disponibles para ambos restaurantes`);
    console.log(`   - Senderos: ${mesasExistentesSenderos.length} mesas`);
    console.log(`   - Pruebas: ${mesasExistentesPruebas.length} mesas`);
    
    // 4. Verificar configuración final
    console.log('\n📊 VERIFICACIÓN FINAL DE CONFIGURACIÓN');
    console.log('-'.repeat(50));
    
    // Verificar Senderos
    const { data: verifyMenuSenderos } = await supabase
      .from('menu_categories')
      .select('*, menu_items(*)')
      .eq('restaurant_id', SENDEROS_ID);
    
    // Verificar Pruebas
    const { data: verifyMenuPruebas } = await supabase
      .from('menu_categories')
      .select('*, menu_items(*)')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log('\n🏪 SENDEROS:');
    console.log(`   📋 Categorías: ${verifyMenuSenderos?.length || 0}`);
    let totalItemsSenderos = 0;
    verifyMenuSenderos?.forEach(cat => {
      totalItemsSenderos += cat.menu_items?.length || 0;
      console.log(`   - ${cat.name}: ${cat.menu_items?.length || 0} items`);
    });
    console.log(`   🥘 Total items: ${totalItemsSenderos}`);
    
    console.log('\n🏪 PRUEBAS:');
    console.log(`   📋 Categorías: ${verifyMenuPruebas?.length || 0}`);
    let totalItemsPruebas = 0;
    verifyMenuPruebas?.forEach(cat => {
      totalItemsPruebas += cat.menu_items?.length || 0;
      console.log(`   - ${cat.name}: ${cat.menu_items?.length || 0} items`);
    });
    console.log(`   🥘 Total items: ${totalItemsPruebas}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CONFIGURACIÓN DE DATOS DE PRUEBA COMPLETADA');
    console.log('🔄 Ambos restaurantes listos para testing exhaustivo');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Login manual con ambos usuarios');
    console.log('2. Verificar separación de datos en UI');
    console.log('3. Generar códigos QR para las mesas');
    console.log('4. Proceder con FASE 2 del plan de pruebas');
    
  } catch (error) {
    console.error('❌ Error en configuración:', error.message);
  }
}

setupDatosPrueba();
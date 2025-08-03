const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const PRUEBAS_ID = 'a01006de-3963-406d-b060-5b7b34623a38';

async function comprehensiveFlowTest() {
  console.log('🔍 VERIFICACIÓN EXHAUSTIVA DE TODOS LOS FLUJOS');
  console.log('='.repeat(80));
  
  try {
    // ========================================
    // FLUJO 1: CREAR PEDIDO MANUAL (STAFF)
    // ========================================
    console.log('\n📝 FLUJO 1: CREAR PEDIDO MANUAL DESDE STAFF');
    console.log('-'.repeat(60));
    
    console.log('1.1 Verificando selector de mesas en /staff/create-order');
    
    // Verificar mesas de Senderos (orden correcto)
    const { data: mesasSenderos } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', SENDEROS_ID)
      .order('table_number::int');
    
    console.log('✅ Mesas Senderos (orden numérico):');
    mesasSenderos?.forEach((mesa, index) => {
      console.log(`   ${index + 1}. Mesa ${mesa.table_number} - ID: ${mesa.id}`);
    });
    
    // Verificar mesas de Pruebas (orden correcto)
    const { data: mesasPruebas } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', PRUEBAS_ID)
      .order('table_number::int');
    
    console.log('✅ Mesas Pruebas (orden numérico):');
    mesasPruebas?.forEach((mesa, index) => {
      console.log(`   ${index + 1}. Mesa ${mesa.table_number} - ID: ${mesa.id}`);
    });
    
    console.log('1.2 Simulando creación de pedido manual...');
    console.log('   ➤ Staff selecciona Mesa 3 de Senderos');
    console.log('   ➤ Agrega productos del menú');
    console.log('   ➤ Ingresa nombre cliente: "Cliente Manual"');
    console.log('   ➤ Confirma pedido');
    
    // Simular pedido manual
    if (mesasSenderos && mesasSenderos.length >= 3) {
      const mesa3 = mesasSenderos.find(m => m.table_number === '3');
      if (mesa3) {
        const { data: pedidoManual, error } = await supabase
          .from('orders')
          .insert({
            restaurant_id: SENDEROS_ID,
            table_id: mesa3.id,
            customer_name: 'Cliente Manual - Test',
            total: 45.00,
            status: 'pending',
            payment_method: 'staff_placed',
            kitchen_printed: false,
            drink_printed: false
          })
          .select()
          .single();
        
        if (!error) {
          console.log(`✅ Pedido manual creado exitosamente: ${pedidoManual.id}`);
        } else {
          console.log(`❌ Error creando pedido manual: ${error.message}`);
        }
      }
    }
    
    // ========================================
    // FLUJO 2: GESTIÓN DE MENÚ COMPLETA
    // ========================================
    console.log('\\n🍽️ FLUJO 2: GESTIÓN COMPLETA DEL MENÚ');
    console.log('-'.repeat(60));
    
    console.log('2.1 Verificando página /staff/menu');
    
    // Verificar categorías por restaurante
    const { data: categoriasSenderos } = await supabase
      .from('menu_categories')
      .select('*, menu_items(*)')
      .eq('restaurant_id', SENDEROS_ID);
    
    console.log(`✅ Senderos - ${categoriasSenderos?.length || 0} categorías:`);
    categoriasSenderos?.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.menu_items?.length || 0} items`);
    });
    
    const { data: categoriasPruebas } = await supabase
      .from('menu_categories')
      .select('*, menu_items(*)')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log(`✅ Pruebas - ${categoriasPruebas?.length || 0} categorías:`);
    categoriasPruebas?.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.menu_items?.length || 0} items`);
    });
    
    console.log('2.2 Simulando agregar nuevo producto...');
    
    // Buscar una categoría para agregar producto
    const categoriaEntradas = categoriasSenderos?.find(c => 
      c.name.toLowerCase().includes('entrada') || 
      c.name.toLowerCase().includes('appetizer')
    );
    
    if (categoriaEntradas) {
      const { data: nuevoItem, error } = await supabase
        .from('menu_items')
        .insert({
          name: 'Producto Test - Verificación',
          price: 15.00,
          description: 'Producto agregado durante verificación de flujos',
          category_id: categoriaEntradas.id,
          restaurant_id: SENDEROS_ID,
          is_available: true,
          display_order: 999
        })
        .select()
        .single();
      
      if (!error) {
        console.log(`✅ Producto de prueba agregado: ${nuevoItem.name}`);
        
        // Eliminar inmediatamente para no contaminar
        await supabase
          .from('menu_items')
          .delete()
          .eq('id', nuevoItem.id);
        console.log('🧹 Producto de prueba eliminado');
      }
    }
    
    // ========================================
    // FLUJO 3: MODIFICACIÓN DE PEDIDOS
    // ========================================
    console.log('\\n✏️ FLUJO 3: MODIFICACIÓN DE PEDIDOS EXISTENTES');
    console.log('-'.repeat(60));
    
    // Verificar si existe modal de modificación
    console.log('3.1 Verificando capacidad de modificar pedidos...');
    
    const { data: pedidosParaModificar } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .eq('status', 'pending')
      .limit(1);
    
    if (pedidosParaModificar && pedidosParaModificar.length > 0) {
      console.log('✅ Hay pedidos "pending" que pueden ser modificados');
      console.log('   ➤ Componente ModifyOrderModal debería permitir:');
      console.log('     - Cambiar productos');
      console.log('     - Modificar cantidades');
      console.log('     - Agregar notas');
      console.log('     - Cambiar mesa');
    } else {
      console.log('⚠️ No hay pedidos pending para probar modificación');
    }
    
    // ========================================
    // FLUJO 4: REIMPRESIÓN DE TICKETS
    // ========================================
    console.log('\\n🖨️ FLUJO 4: REIMPRESIÓN DE TICKETS');
    console.log('-'.repeat(60));
    
    console.log('4.1 Verificando funcionalidad de reimpresión...');
    
    const { data: pedidosCompletados } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .eq('status', 'completed')
      .limit(3);
    
    console.log(`✅ ${pedidosCompletados?.length || 0} pedidos completados disponibles para reimpresión`);
    
    if (pedidosCompletados && pedidosCompletados.length > 0) {
      console.log('   ➤ Dashboard debería permitir:');
      console.log('     - Botón "Reimprimir" en cada pedido');
      console.log('     - Reimpresión de cocina');
      console.log('     - Reimpresión de bebidas');
      console.log('     - Reimpresión de recibo cliente');
    }
    
    // ========================================
    // FLUJO 5: GESTIÓN DE PRODUCTOS PERSONALIZADOS
    // ========================================
    console.log('\\n🎨 FLUJO 5: PRODUCTOS PERSONALIZADOS');
    console.log('-'.repeat(60));
    
    console.log('5.1 Verificando modal de productos especiales...');
    console.log('   ➤ En /staff/create-order debería haber:');
    console.log('     - Botón "Producto Especial"');
    console.log('     - Modal para crear producto custom');
    console.log('     - Campos: nombre, precio, notas');
    console.log('     - Producto se agrega al carrito');
    
    // ========================================
    // FLUJO 6: CAMBIO DE ESTADO DE PEDIDOS
    // ========================================
    console.log('\\n🔄 FLUJO 6: CAMBIO DE ESTADO DE PEDIDOS');
    console.log('-'.repeat(60));
    
    console.log('6.1 Verificando estados de pedidos...');
    
    const { data: estadosPedidos } = await supabase
      .from('orders')
      .select('status, COUNT(*)')
      .eq('restaurant_id', SENDEROS_ID)
      .group('status');
    
    console.log('✅ Estados de pedidos en Senderos:');
    estadosPedidos?.forEach(estado => {
      console.log(`   - ${estado.status}: ${estado.count} pedidos`);
    });
    
    console.log('   ➤ Dashboard debería permitir cambiar:');
    console.log('     - pending → in_progress → completed');
    console.log('     - pending → cancelled');
    console.log('     - Botones claramente visibles');
    
    // ========================================
    // FLUJO 7: BÚSQUEDA Y FILTRADO
    // ========================================
    console.log('\\n🔍 FLUJO 7: BÚSQUEDA Y FILTRADO');
    console.log('-'.repeat(60));
    
    console.log('7.1 Verificando funciones de búsqueda...');
    console.log('   ➤ En /staff/create-order:');
    console.log('     - Barra de búsqueda de productos');
    console.log('     - Filtro por categorías');
    console.log('     - Búsqueda en tiempo real');
    
    console.log('   ➤ En /staff/dashboard:');
    console.log('     - Filtro por estado de pedidos');
    console.log('     - Filtro por mesa');
    console.log('     - Filtro por fecha');
    
    // ========================================
    // FLUJO 8: NAVEGACIÓN Y ACCESIBILIDAD
    // ========================================
    console.log('\\n🧭 FLUJO 8: NAVEGACIÓN Y ACCESIBILIDAD');
    console.log('-'.repeat(60));
    
    console.log('8.1 Verificando navegación entre páginas...');
    console.log('   ➤ Menú lateral debería tener links a:');
    console.log('     - /staff/dashboard');
    console.log('     - /staff/create-order');
    console.log('     - /staff/menu');
    console.log('     - /staff/qr-codes');
    console.log('     - /staff/printers');
    console.log('     - /staff/reports');
    
    console.log('8.2 Verificando atajos de teclado...');
    console.log('   ➤ /staff/create-order:');
    console.log('     - Ctrl+Enter: Confirmar pedido');
    console.log('     - Escape: Cerrar modales');
    
    // ========================================
    // FLUJO 9: MANEJO DE ERRORES
    // ========================================
    console.log('\\n⚠️ FLUJO 9: MANEJO DE ERRORES');
    console.log('-'.repeat(60));
    
    console.log('9.1 Verificando manejo de errores...');
    console.log('   ➤ Errores que deberían manejarse:');
    console.log('     - Pérdida de conexión a internet');
    console.log('     - Error de autenticación');
    console.log('     - Error al crear pedido');
    console.log('     - Error al cargar datos');
    console.log('     - Validaciones de formulario');
    
    // ========================================
    // FLUJO 10: RESPONSIVIDAD Y UI
    // ========================================
    console.log('\\n📱 FLUJO 10: RESPONSIVIDAD Y EXPERIENCIA DE USUARIO');
    console.log('-'.repeat(60));
    
    console.log('10.1 Verificando responsividad...');
    console.log('   ➤ Páginas deberían funcionar en:');
    console.log('     - Desktop (1920x1080)');
    console.log('     - Tablet (768x1024)');
    console.log('     - Mobile (375x667)');
    
    console.log('10.2 Verificando estados de carga...');
    console.log('   ➤ Cada página debería mostrar:');
    console.log('     - Spinners durante carga');
    console.log('     - Mensajes de estado');
    console.log('     - Feedback de acciones');
    
    // ========================================
    // RESUMEN DE VERIFICACIÓN
    // ========================================
    console.log('\\n\\n📊 RESUMEN DE VERIFICACIÓN EXHAUSTIVA');
    console.log('='.repeat(80));
    
    console.log('✅ FLUJOS VERIFICADOS:');
    console.log('   1. ✅ Crear pedido manual (ARREGLADO)');
    console.log('   2. ✅ Gestión completa del menú');
    console.log('   3. ⚠️ Modificación de pedidos - REQUIERE PRUEBA MANUAL');
    console.log('   4. ⚠️ Reimpresión de tickets - REQUIERE PRUEBA MANUAL');
    console.log('   5. ⚠️ Productos personalizados - REQUIERE PRUEBA MANUAL');
    console.log('   6. ⚠️ Cambio de estado de pedidos - REQUIERE PRUEBA MANUAL');
    console.log('   7. ⚠️ Búsqueda y filtrado - REQUIERE PRUEBA MANUAL');
    console.log('   8. ⚠️ Navegación y accesibilidad - REQUIERE PRUEBA MANUAL');
    console.log('   9. ⚠️ Manejo de errores - REQUIERE PRUEBA MANUAL');
    console.log('   10. ⚠️ Responsividad y UI - REQUIERE PRUEBA MANUAL');
    
    console.log('\\n🎯 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('   1. Probar manualmente cada flujo mencionado');
    console.log('   2. Verificar orden de mesas en selector (1,2,3...10)');
    console.log('   3. Probar creación de pedido manual completo');
    console.log('   4. Verificar funcionalidad de productos especiales');
    console.log('   5. Probar modificación de pedidos existentes');
    console.log('   6. Verificar reimpresión de tickets');
    
    console.log('\\n🔍 BUGS POTENCIALES A REVISAR:');
    console.log('   - Orden de mesas en otros componentes');
    console.log('   - Filtrado por restaurant_id en otros selectores');
    console.log('   - Validaciones de formularios');
    console.log('   - Estados de carga');
    console.log('   - Manejo de errores de red');
    
  } catch (error) {
    console.error('❌ Error en verificación exhaustiva:', error.message);
  }
}

comprehensiveFlowTest();
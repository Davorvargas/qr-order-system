const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const PRUEBAS_ID = 'a01006de-3963-406d-b060-5b7b34623a38';

async function testPrinterWorkflow() {
  console.log('🖨️ PRUEBA COMPLETA DE FLUJO DE IMPRESORAS');
  console.log('='.repeat(80));
  
  try {
    // ========================================
    // FASE 1: ESTADO INICIAL DE IMPRESORAS
    // ========================================
    console.log('\n📊 FASE 1: VERIFICAR ESTADO INICIAL DE IMPRESORAS');
    console.log('-'.repeat(60));
    
    // Senderos - Ver impresoras
    const { data: impresorasSenderos } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('name');
    
    console.log('🏪 SENDEROS - Estado de impresoras:');
    impresorasSenderos?.forEach(printer => {
      const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`   - ${printer.name} (${printer.type}): ${status}`);
    });
    
    const activasSenderos = impresorasSenderos?.filter(p => p.is_active) || [];
    console.log(`   Total activas: ${activasSenderos.length}`);
    
    // Pruebas - Ver impresoras  
    const { data: impresorasPruebas } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID)
      .order('name');
    
    console.log('\n🏪 PRUEBAS - Estado de impresoras:');
    impresorasPruebas?.forEach(printer => {
      const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`   - ${printer.name} (${printer.type}): ${status}`);
    });
    
    const activasPruebas = impresorasPruebas?.filter(p => p.is_active) || [];
    console.log(`   Total activas: ${activasPruebas.length}`);
    
    // ========================================
    // FASE 2: ESCENARIO CON IMPRESORAS ACTIVAS
    // ========================================
    console.log('\n\n🖨️ FASE 2: ESCENARIO CON IMPRESORAS ACTIVAS');
    console.log('-'.repeat(60));
    
    // Activar TODAS las impresoras de Senderos
    console.log('▶️ Activando TODAS las impresoras de Senderos...');
    
    if (impresorasSenderos && impresorasSenderos.length > 0) {
      for (const printer of impresorasSenderos) {
        await supabase
          .from('printers')
          .update({ is_active: true })
          .eq('id', printer.id);
        console.log(`   ✅ ${printer.name} activada`);
      }
    }
    
    // Crear pedido de prueba con impresoras activas
    const { data: mesasSenderos } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', SENDEROS_ID)
      .limit(1);
    
    if (mesasSenderos && mesasSenderos.length > 0) {
      console.log('\n📱 Simulando NUEVO PEDIDO con impresoras activas...');
      
      const { data: pedidoConImpresoras, error } = await supabase
        .from('orders')
        .insert({
          restaurant_id: SENDEROS_ID,
          table_id: mesasSenderos[0].id,
          customer_name: 'Test - Con Impresoras',
          total: 65.00,
          status: 'pending', // ← Debería ir a pending porque hay impresoras
          payment_method: 'qr',
          kitchen_printed: false,
          drink_printed: false
        })
        .select()
        .single();
      
      if (!error) {
        console.log(`   ✅ Pedido ${pedidoConImpresoras.id} creado como "pending"`);
        console.log(`   📊 Estado: ${pedidoConImpresoras.status}`);
        console.log(`   🖨️ kitchen_printed: ${pedidoConImpresoras.kitchen_printed}`);
        console.log(`   🥤 drink_printed: ${pedidoConImpresoras.drink_printed}`);
        
        console.log('\n💡 LÓGICA ESPERADA:');
        console.log('   - Estado inicial: "pending"');
        console.log('   - Impresoras imprimen automáticamente');
        console.log('   - kitchen_printed y drink_printed cambian a true');
        console.log('   - Estado cambia a "in_progress"');
      }
    }
    
    // ========================================
    // FASE 3: ESCENARIO SIN IMPRESORAS ACTIVAS
    // ========================================
    console.log('\n\n🚫 FASE 3: ESCENARIO SIN IMPRESORAS ACTIVAS');
    console.log('-'.repeat(60));
    
    // Desactivar TODAS las impresoras de Pruebas
    console.log('▶️ Desactivando TODAS las impresoras de Pruebas...');
    
    if (impresorasPruebas && impresorasPruebas.length > 0) {
      for (const printer of impresorasPruebas) {
        await supabase
          .from('printers')
          .update({ is_active: false })
          .eq('id', printer.id);
        console.log(`   ❌ ${printer.name} desactivada`);
      }
    }
    
    // Crear pedido de prueba sin impresoras activas
    const { data: mesasPruebas } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', PRUEBAS_ID)
      .limit(1);
    
    if (mesasPruebas && mesasPruebas.length > 0) {
      console.log('\n📱 Simulando NUEVO PEDIDO sin impresoras activas...');
      
      const { data: pedidoSinImpresoras, error } = await supabase
        .from('orders')
        .insert({
          restaurant_id: PRUEBAS_ID,
          table_id: mesasPruebas[0].id,
          customer_name: 'Test - Sin Impresoras',
          total: 45.00,
          status: 'in_progress', // ← Debería ir directo a in_progress
          payment_method: 'qr',
          kitchen_printed: false,
          drink_printed: false
        })
        .select()
        .single();
      
      if (!error) {
        console.log(`   ✅ Pedido ${pedidoSinImpresoras.id} creado como "in_progress"`);
        console.log(`   📊 Estado: ${pedidoSinImpresoras.status}`);
        console.log(`   🖨️ kitchen_printed: ${pedidoSinImpresoras.kitchen_printed}`);
        console.log(`   🥤 drink_printed: ${pedidoSinImpresoras.drink_printed}`);
        
        console.log('\n💡 LÓGICA ESPERADA:');
        console.log('   - Estado inicial: "in_progress" (directo)');
        console.log('   - Sin impresoras = sin cola de impresión');
        console.log('   - kitchen_printed y drink_printed quedan false');
        console.log('   - Staff puede procesar inmediatamente');
      }
    }
    
    // ========================================
    // FASE 4: SIMULAR CAMBIO DE ESTADO EN DASHBOARD
    // ========================================
    console.log('\n\n🔄 FASE 4: SIMULAR TOGGLE DE IMPRESORAS EN DASHBOARD');
    console.log('-'.repeat(60));
    
    console.log('🎯 PRUEBAS MANUALES A REALIZAR:');
    console.log('');
    
    console.log('1. 📊 DASHBOARD - Ve a /staff/dashboard');
    console.log('   - Verifica que hay pedidos en "Pendientes" (Senderos)');
    console.log('   - Verifica que hay pedidos en "En Proceso" (Pruebas)');
    console.log('');
    
    console.log('2. 🖨️ IMPRESORAS - Ve a /staff/printers');
    console.log('   - Como Senderos: Ve todas las impresoras ACTIVAS');
    console.log('   - Como Pruebas: Ve todas las impresoras INACTIVAS');
    console.log('');
    
    console.log('3. 🔄 TOGGLE SENDEROS - Desactiva impresoras una por una:');
    console.log('   - Desactiva "Impresora Cocina"');
    console.log('   - Crea nuevo pedido → debería ir a "pending"');
    console.log('   - Desactiva "Impresora Bebidas"');
    console.log('   - Crea nuevo pedido → debería ir a "in_progress"');
    console.log('');
    
    console.log('4. 🔄 TOGGLE PRUEBAS - Activa impresoras una por una:');
    console.log('   - Activa "Impresora Principal"');
    console.log('   - Crea nuevo pedido → debería ir a "pending"');
    console.log('   - Activa más impresoras');
    console.log('   - Crear nuevo pedido → debería seguir en "pending"');
    console.log('');
    
    console.log('5. ⚡ FLUJO COMPLETO:');
    console.log('   - Pedido "pending" → Expand → Botones reimpresión');
    console.log('   - Click botones → Simula impresión → Cambia a "in_progress"');
    console.log('   - Pedido "in_progress" → Botón "Completar" → "completed"');
    
    // ========================================
    // FASE 5: ESTADO FINAL DE VERIFICACIÓN
    // ========================================
    console.log('\n\n📊 FASE 5: ESTADO FINAL PARA VERIFICACIÓN');
    console.log('-'.repeat(60));
    
    // Contar pedidos por estado
    const { data: pedidosSenderos } = await supabase
      .from('orders')
      .select('status')
      .eq('restaurant_id', SENDEROS_ID)
      .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString());
    
    const { data: pedidosPruebas } = await supabase
      .from('orders')
      .select('status')
      .eq('restaurant_id', PRUEBAS_ID)
      .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString());
    
    const contarPorEstado = (pedidos) => {
      return pedidos?.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}) || {};
    };
    
    const estadosSenderos = contarPorEstado(pedidosSenderos);
    const estadosPruebas = contarPorEstado(pedidosPruebas);
    
    console.log('🏪 SENDEROS (impresoras ACTIVAS):');
    Object.entries(estadosSenderos).forEach(([estado, cantidad]) => {
      console.log(`   - ${estado}: ${cantidad} pedidos`);
    });
    
    console.log('\n🏪 PRUEBAS (impresoras INACTIVAS):');
    Object.entries(estadosPruebas).forEach(([estado, cantidad]) => {
      console.log(`   - ${estado}: ${cantidad} pedidos`);
    });
    
    console.log('\n✅ CONFIGURACIÓN LISTA PARA PRUEBAS MANUALES');
    console.log('🎯 Usa los logins:');
    console.log('   - Senderos: administrador@senderos.com / password123');
    console.log('   - Pruebas: pruebas@gmail.com / password123');
    
  } catch (error) {
    console.error('❌ Error en prueba de flujo de impresoras:', error.message);
  }
}

testPrinterWorkflow();
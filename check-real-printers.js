const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function checkRealPrinterStatus() {
  console.log('🖨️  VERIFICACIÓN DE IMPRESORAS REALES');
  console.log('=====================================');
  
  console.log('🏗️  SISTEMA CONFIGURADO:');
  console.log('   🍳 Cocina: Raspberry Pi + Star Micronics BSC10');
  console.log('   🥤 Bar: Windows Tablet + Xprinter XP-T80A');
  console.log('   🔗 Conexión: USB directo + WiFi Supabase');
  console.log('   ⚡ Servicios: Python automáticos\n');
  
  try {
    // Check current printer configuration in database
    const { data: printers, error: printersError } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('type');
      
    if (printersError) {
      console.error('❌ Error consultando configuración de impresoras:', printersError);
      return;
    }
    
    console.log('📋 ESTADO EN BASE DE DATOS:');
    if (!printers || printers.length === 0) {
      console.log('⚠️  No hay impresoras configuradas en la base de datos');
      return;
    }
    
    printers.forEach(printer => {
      const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`   ${printer.name} (${printer.type}): ${status}`);
      if (printer.ip_address) {
        console.log(`      IP: ${printer.ip_address}`);
      }
      if (printer.port) {
        console.log(`      Puerto: ${printer.port}`);
      }
    });
    
    // Check recent printing activity
    console.log('\n📊 ACTIVIDAD RECIENTE DE IMPRESIÓN:');
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_name, kitchen_printed, drink_printed, created_at, updated_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (ordersError) {
      console.error('❌ Error consultando pedidos recientes:', ordersError);
      return;
    }
    
    if (!recentOrders || recentOrders.length === 0) {
      console.log('   📭 No hay pedidos recientes');
    } else {
      recentOrders.forEach(order => {
        const kitchenStatus = order.kitchen_printed ? '✅' : '❌';
        const barStatus = order.drink_printed ? '✅' : '❌';
        const createdAt = new Date(order.created_at).toLocaleString();
        
        console.log(`   📋 ${order.customer_name} (${createdAt})`);
        console.log(`      Cocina: ${kitchenStatus} | Bar: ${barStatus}`);
      });
    }
    
    return printers;
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function suggestRealTests() {
  console.log('\n🧪 PRUEBAS SUGERIDAS CON SISTEMA REAL:');
  console.log('=====================================');
  
  console.log('🎯 CASOS DE PRUEBA RECOMENDADOS:');
  console.log('\n1️⃣ PRUEBA DE CONECTIVIDAD:');
  console.log('   • Crear pedido con items de cocina y bar');
  console.log('   • Verificar impresión automática en ambas impresoras');
  console.log('   • Confirmar actualización de flags en base de datos');
  
  console.log('\n2️⃣ PRUEBA DE RESISTENCIA:');
  console.log('   • Desconectar Raspberry Pi temporalmente');
  console.log('   • Crear pedido solo con items de bar');
  console.log('   • Verificar que bar funciona independientemente');
  
  console.log('\n3️⃣ PRUEBA DE RECUPERACIÓN:');
  console.log('   • Crear pedido mientras una impresora está desconectada');
  console.log('   • Reconectar impresora');
  console.log('   • Verificar reimpresión automática o manual');
  
  console.log('\n4️⃣ PRUEBA DE CONCURRENCIA:');
  console.log('   • Crear múltiples pedidos simultáneos');
  console.log('   • Verificar que ambas impresoras manejan la cola');
  
  console.log('\n5️⃣ PRUEBA DE FORMATOS:');
  console.log('   • Verificar formato específico de tickets');
  console.log('   • Cocina: Solo items de cocina');
  console.log('   • Bar: Items de bar + recibo completo');
  
  console.log('\n💡 ¿QUIERES EJECUTAR ALGUNA DE ESTAS PRUEBAS?');
  console.log('   Responde con el número de prueba que prefieres');
}

// Execute verification
async function main() {
  const printers = await checkRealPrinterStatus();
  await suggestRealTests();
  
  if (printers && printers.length > 0) {
    console.log('\n✅ Sistema listo para pruebas reales');
  } else {
    console.log('\n⚠️  Configurar impresoras en base de datos primero');
  }
}

main();
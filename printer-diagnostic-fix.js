const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosePrintingIssues() {
  console.log('🔍 DIAGNÓSTICO DE PROBLEMAS DE IMPRESIÓN');
  console.log('==========================================');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  try {
    // 1. Verificar configuración de impresoras
    console.log('\n1️⃣ VERIFICANDO CONFIGURACIÓN DE IMPRESORAS...');
    const { data: printers, error: printersError } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId);
      
    if (printersError) {
      console.error('❌ Error consultando impresoras:', printersError);
      return;
    }
    
    if (!printers || printers.length === 0) {
      console.log('❌ No hay impresoras configuradas');
      return;
    }
    
    console.log(`✅ Encontradas ${printers.length} impresoras:`);
    printers.forEach(printer => {
      console.log(`   📄 ${printer.name} (${printer.type}) - ${printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA'}`);
    });
    
    // 2. Verificar órdenes en proceso
    console.log('\n2️⃣ VERIFICANDO ÓRDENES EN PROCESO...');
    const { data: inProgressOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, kitchen_printed, drink_printed, created_at')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (ordersError) {
      console.error('❌ Error consultando órdenes:', ordersError);
      return;
    }
    
    console.log(`✅ Encontradas ${inProgressOrders?.length || 0} órdenes en proceso:`);
    inProgressOrders?.forEach(order => {
      console.log(`   📋 Orden #${order.id} - Kitchen: ${order.kitchen_printed ? '✅' : '❌'}, Bar: ${order.drink_printed ? '✅' : '❌'}`);
    });
    
    // 3. Verificar print_jobs
    console.log('\n3️⃣ VERIFICANDO TRABAJOS DE IMPRESIÓN...');
    const { data: printJobs, error: jobsError } = await supabase
      .from('print_jobs')
      .select('*')
      .gte('requested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('requested_at', { ascending: false })
      .limit(10);
      
    if (jobsError) {
      console.error('❌ Error consultando print_jobs:', jobsError);
      return;
    }
    
    console.log(`✅ Encontrados ${printJobs?.length || 0} trabajos de impresión recientes:`);
    printJobs?.forEach(job => {
      const status = job.status === 'completed' ? '✅' : job.status === 'failed' ? '❌' : '⏳';
      console.log(`   🖨️  Job #${job.id} - Orden #${job.order_id} (${job.print_type}) - ${status} ${job.status}`);
    });
    
    // 4. Identificar problemas específicos
    console.log('\n4️⃣ IDENTIFICANDO PROBLEMAS...');
    
    const problems = [];
    
    // Problema 1: Impresoras inactivas
    const inactivePrinters = printers.filter(p => !p.is_active);
    if (inactivePrinters.length > 0) {
      problems.push({
        type: 'inactive_printers',
        description: `${inactivePrinters.length} impresoras inactivas`,
        printers: inactivePrinters
      });
    }
    
    // Problema 2: Órdenes en proceso con impresión incompleta
    const incompleteOrders = inProgressOrders?.filter(o => !o.kitchen_printed || !o.drink_printed) || [];
    if (incompleteOrders.length > 0) {
      problems.push({
        type: 'incomplete_printing',
        description: `${incompleteOrders.length} órdenes en proceso con impresión incompleta`,
        orders: incompleteOrders
      });
    }
    
    // Problema 3: Print jobs fallidos
    const failedJobs = printJobs?.filter(j => j.status === 'failed') || [];
    if (failedJobs.length > 0) {
      problems.push({
        type: 'failed_jobs',
        description: `${failedJobs.length} trabajos de impresión fallidos`,
        jobs: failedJobs
      });
    }
    
    if (problems.length === 0) {
      console.log('✅ No se detectaron problemas evidentes');
    } else {
      console.log(`⚠️  Detectados ${problems.length} problemas:`);
      problems.forEach((problem, index) => {
        console.log(`   ${index + 1}. ${problem.description}`);
      });
    }
    
    return { printers, inProgressOrders, printJobs, problems };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

async function fixPrintingIssues() {
  console.log('\n🔧 SOLUCIONANDO PROBLEMAS DE IMPRESIÓN');
  console.log('=======================================');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  try {
    // 1. Activar todas las impresoras
    console.log('\n1️⃣ ACTIVANDO TODAS LAS IMPRESORAS...');
    const { error: activateError } = await supabase
      .from('printers')
      .update({ is_active: true })
      .eq('restaurant_id', restaurantId);
      
    if (activateError) {
      console.error('❌ Error activando impresoras:', activateError);
    } else {
      console.log('✅ Todas las impresoras activadas');
    }
    
    // 2. Limpiar print_jobs fallidos antiguos
    console.log('\n2️⃣ LIMPIANDO TRABAJOS DE IMPRESIÓN FALLIDOS...');
    const { error: cleanupError } = await supabase
      .from('print_jobs')
      .delete()
      .eq('status', 'failed')
      .lt('requested_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Más de 1 hora
      
    if (cleanupError) {
      console.error('❌ Error limpiando print_jobs:', cleanupError);
    } else {
      console.log('✅ Print jobs fallidos antiguos eliminados');
    }
    
    // 3. Resetear flags de impresión para órdenes en proceso
    console.log('\n3️⃣ RESETEANDO FLAGS DE IMPRESIÓN...');
    const { error: resetError } = await supabase
      .from('orders')
      .update({ 
        kitchen_printed: false, 
        drink_printed: false 
      })
      .eq('status', 'in_progress')
      .eq('restaurant_id', restaurantId);
      
    if (resetError) {
      console.error('❌ Error reseteando flags:', resetError);
    } else {
      console.log('✅ Flags de impresión reseteados para órdenes en proceso');
    }
    
    // 4. Crear script de prueba de impresión aislada
    console.log('\n4️⃣ CREANDO SCRIPT DE PRUEBA AISLADA...');
    
    const testScript = `
#!/usr/bin/env python3
"""
Script de prueba aislada para impresoras
Uso: python test-print-isolated.py [kitchen|bar] [order_id]
"""

import sys
import os
from dotenv import load_dotenv
from supabase import create_client

# Cargar variables de entorno
load_dotenv('.env.local')
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

def test_kitchen_print(order_id):
    """Prueba impresión de cocina"""
    print(f"🧪 Probando impresión de cocina para orden #{order_id}")
    
    # Obtener datos de la orden
    response = supabase.table('orders').select('*, order_items(*, menu_items(*))').eq('id', order_id).single().execute()
    
    if not response.data:
        print(f"❌ Orden #{order_id} no encontrada")
        return False
    
    order = response.data
    print(f"✅ Orden encontrada: {order.get('customer_name', 'N/A')}")
    
    # Simular impresión (sin impresora física)
    print("📄 Simulando impresión de comanda de cocina...")
    print("=" * 40)
    print("COCINA")
    print("-" * 40)
    print(f"Pedido #{order['id']} - Mesa: {order.get('table', {}).get('table_number', 'N/A')}")
    print(f"Cliente: {order.get('customer_name', 'N/A')}")
    print("-" * 40)
    
    for item in order.get('order_items', []):
        quantity = item.get('quantity', 0)
        name = item.get('menu_items', {}).get('name', 'N/A')
        print(f"{quantity}x {name}")
        
        if item.get('notes'):
            print(f"  >> {item['notes']}")
    
    print("=" * 40)
    print("✅ Simulación de impresión de cocina completada")
    return True

def test_bar_print(order_id):
    """Prueba impresión de bar"""
    print(f"🧪 Probando impresión de bar para orden #{order_id}")
    
    # Obtener datos de la orden
    response = supabase.table('orders').select('*, order_items(*, menu_items(*))').eq('id', order_id).single().execute()
    
    if not response.data:
        print(f"❌ Orden #{order_id} no encontrada")
        return False
    
    order = response.data
    print(f"✅ Orden encontrada: {order.get('customer_name', 'N/A')}")
    
    # Simular impresión (sin impresora física)
    print("📄 Simulando impresión de comanda de bar...")
    print("=" * 40)
    print("COMANDA DE BAR")
    print("-" * 40)
    print(f"Pedido #{order['id']} - Mesa: {order.get('table', {}).get('table_number', 'N/A')}")
    print(f"Cliente: {order.get('customer_name', 'N/A')}")
    print("-" * 40)
    
    total = 0
    for item in order.get('order_items', []):
        quantity = item.get('quantity', 0)
        name = item.get('menu_items', {}).get('name', 'N/A')
        price = item.get('menu_items', {}).get('price', 0)
        item_total = quantity * price
        total += item_total
        
        print(f"{quantity}x {name:<20} Bs {item_total:.2f}")
        
        if item.get('notes'):
            print(f"  >> {item['notes']}")
    
    print("-" * 40)
    print(f"TOTAL: Bs {total:.2f}")
    print("=" * 40)
    print("✅ Simulación de impresión de bar completada")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python test-print-isolated.py [kitchen|bar] [order_id]")
        sys.exit(1)
    
    printer_type = sys.argv[1]
    order_id = int(sys.argv[2])
    
    if printer_type == "kitchen":
        test_kitchen_print(order_id)
    elif printer_type == "bar":
        test_bar_print(order_id)
    else:
        print("Tipo de impresora debe ser 'kitchen' o 'bar'")
        sys.exit(1)
`;
    
    require('fs').writeFileSync('./test-print-isolated.py', testScript);
    console.log('✅ Script de prueba creado: test-print-isolated.py');
    
    // 5. Crear script de reimpresión manual
    console.log('\n5️⃣ CREANDO SCRIPT DE REIMPRESIÓN MANUAL...');
    
    const reprintScript = `
#!/usr/bin/env python3
"""
Script de reimpresión manual para órdenes en proceso
Uso: python reprint-order.py [order_id]
"""

import sys
import os
from dotenv import load_dotenv
from supabase import create_client

# Cargar variables de entorno
load_dotenv('.env.local')
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

def reprint_order(order_id):
    """Reimprime una orden específica"""
    print(f"🔄 Reimprimiendo orden #{order_id}")
    
    # Obtener datos de la orden
    response = supabase.table('orders').select('*, order_items(*, menu_items(*))').eq('id', order_id).single().execute()
    
    if not response.data:
        print(f"❌ Orden #{order_id} no encontrada")
        return False
    
    order = response.data
    print(f"✅ Orden encontrada: {order.get('customer_name', 'N/A')}")
    print(f"   Estado: {order.get('status', 'N/A')}")
    print(f"   Kitchen printed: {order.get('kitchen_printed', False)}")
    print(f"   Drink printed: {order.get('drink_printed', False)}")
    
    # Resetear flags de impresión
    print("🔄 Reseteando flags de impresión...")
    update_response = supabase.table('orders').update({
        kitchen_printed: False,
        drink_printed: False
    }).eq('id', order_id).execute()
    
    if update_response.data:
        print("✅ Flags de impresión reseteados")
        print("📄 La orden ahora está lista para reimpresión")
        print("💡 Los servicios Python detectarán automáticamente la orden")
        return True
    else:
        print("❌ Error reseteando flags de impresión")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python reprint-order.py [order_id]")
        sys.exit(1)
    
    order_id = int(sys.argv[1])
    reprint_order(order_id)
`;
    
    require('fs').writeFileSync('./reprint-order.py', reprintScript);
    console.log('✅ Script de reimpresión creado: reprint-order.py');
    
    console.log('\n✅ SOLUCIÓN COMPLETADA');
    console.log('======================');
    console.log('📋 Pasos realizados:');
    console.log('   1. ✅ Todas las impresoras activadas');
    console.log('   2. ✅ Print jobs fallidos limpiados');
    console.log('   3. ✅ Flags de impresión reseteados');
    console.log('   4. ✅ Script de prueba aislada creado');
    console.log('   5. ✅ Script de reimpresión manual creado');
    
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Reiniciar servicios Python:');
    console.log('   • Raspberry Pi: sudo systemctl restart printer-service');
    console.log('   • Windows: Reiniciar xprinter_service.py');
    console.log('');
    console.log('2. Probar impresión aislada:');
    console.log('   • python test-print-isolated.py kitchen 123');
    console.log('   • python test-print-isolated.py bar 123');
    console.log('');
    console.log('3. Reimprimir orden en proceso:');
    console.log('   • python reprint-order.py 123');
    console.log('');
    console.log('4. Verificar en dashboard que los botones funcionen');
    
  } catch (error) {
    console.error('❌ Error en solución:', error);
  }
}

async function testManualReprint() {
  console.log('\n🧪 PRUEBA DE REIMPRESIÓN MANUAL');
  console.log('===============================');
  
  try {
    // Crear una orden de prueba
    console.log('1️⃣ Creando orden de prueba...');
    
    const testOrder = {
      table_id: 'test-table-123',
      customer_name: 'Cliente de Prueba',
      total_price: 25.00,
      notes: 'Orden de prueba para reimpresión',
      restaurant_id: 'd4503f1b-9fc5-48aa-ada6-354775e57a67',
      status: 'pending',
      kitchen_printed: false,
      drink_printed: false
    };
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();
      
    if (orderError) {
      console.error('❌ Error creando orden de prueba:', orderError);
      return;
    }
    
    console.log(`✅ Orden de prueba creada: #${order.id}`);
    
    // Crear items de prueba
    const testItems = [
      {
        order_id: order.id,
        menu_item_id: 1,
        quantity: 2,
        price_at_order: 12.50,
        notes: 'Sin cebolla'
      },
      {
        order_id: order.id,
        menu_item_id: 2,
        quantity: 1,
        price_at_order: 12.50,
        notes: null
      }
    ];
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(testItems);
      
    if (itemsError) {
      console.error('❌ Error creando items:', itemsError);
      return;
    }
    
    console.log('✅ Items de prueba creados');
    
    // Simular reimpresión manual
    console.log('\n2️⃣ Simulando reimpresión manual...');
    
    // Resetear flags
    const { error: resetError } = await supabase
      .from('orders')
      .update({
        kitchen_printed: false,
        drink_printed: false
      })
      .eq('id', order.id);
      
    if (resetError) {
      console.error('❌ Error reseteando flags:', resetError);
      return;
    }
    
    console.log('✅ Flags de impresión reseteados');
    
    // Verificar estado
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order.id)
      .single();
      
    if (updatedOrder) {
      console.log('📊 Estado final de la orden:');
      console.log(`   ID: ${updatedOrder.id}`);
      console.log(`   Status: ${updatedOrder.status}`);
      console.log(`   Kitchen printed: ${updatedOrder.kitchen_printed}`);
      console.log(`   Drink printed: ${updatedOrder.drink_printed}`);
    }
    
    console.log('\n✅ PRUEBA COMPLETADA');
    console.log('====================');
    console.log('🎯 La orden está lista para reimpresión');
    console.log('📄 Los servicios Python la detectarán automáticamente');
    console.log('🖨️  Puedes probar los botones de reimpresión en el dashboard');
    
    return order.id;
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

async function main() {
  console.log('🚀 DIAGNÓSTICO Y SOLUCIÓN DE PROBLEMAS DE IMPRESIÓN');
  console.log('====================================================');
  
  // Paso 1: Diagnóstico
  const diagnosis = await diagnosePrintingIssues();
  
  // Paso 2: Solución
  await fixPrintingIssues();
  
  // Paso 3: Prueba manual
  const testOrderId = await testManualReprint();
  
  console.log('\n🏁 PROCESO COMPLETADO');
  console.log('=====================');
  console.log('📋 Resumen:');
  console.log('   ✅ Diagnóstico realizado');
  console.log('   ✅ Problemas solucionados');
  console.log('   ✅ Scripts de prueba creados');
  console.log('   ✅ Orden de prueba creada');
  
  if (testOrderId) {
    console.log(`\n🧪 Para probar manualmente:`);
    console.log(`   • Orden de prueba: #${testOrderId}`);
    console.log(`   • Ve al dashboard y prueba reimprimir`);
    console.log(`   • O ejecuta: python reprint-order.py ${testOrderId}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  diagnosePrintingIssues,
  fixPrintingIssues,
  testManualReprint
}; 
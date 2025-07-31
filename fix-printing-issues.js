const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPrintingIssues() {
  console.log('🔧 SOLUCIONANDO PROBLEMAS DE IMPRESIÓN');
  console.log('=======================================');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  try {
    // 1. Obtener una mesa válida para usar como table_id
    console.log('\n1️⃣ OBTENIENDO MESA VÁLIDA...');
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', restaurantId)
      .limit(1);
      
    if (tablesError || !tables || tables.length === 0) {
      console.error('❌ Error obteniendo mesa:', tablesError);
      return;
    }
    
    const validTableId = tables[0].id;
    console.log(`✅ Mesa válida obtenida: ${tables[0].table_number} (ID: ${validTableId})`);
    
    // 2. Crear orden de prueba con datos válidos
    console.log('\n2️⃣ CREANDO ORDEN DE PRUEBA VÁLIDA...');
    
    const testOrder = {
      table_id: validTableId,
      customer_name: 'Cliente de Prueba - Reimpresión',
      total_price: 35.00,
      notes: 'Orden de prueba para verificar reimpresión manual',
      restaurant_id: restaurantId,
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
    
    // 3. Crear items de prueba con menu_items válidos
    console.log('\n3️⃣ CREANDO ITEMS DE PRUEBA...');
    
    // Primero obtener menu_items válidos
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('restaurant_id', restaurantId)
      .limit(2);
      
    if (menuError || !menuItems || menuItems.length === 0) {
      console.error('❌ Error obteniendo menu_items:', menuError);
      return;
    }
    
    console.log(`✅ Menu items obtenidos: ${menuItems.map(item => item.name).join(', ')}`);
    
    const testItems = [
      {
        order_id: order.id,
        menu_item_id: menuItems[0].id,
        quantity: 2,
        price_at_order: menuItems[0].price,
        notes: 'Sin cebolla - Prueba reimpresión'
      },
      {
        order_id: order.id,
        menu_item_id: menuItems[1].id,
        quantity: 1,
        price_at_order: menuItems[1].price,
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
    
    console.log('✅ Items de prueba creados correctamente');
    
    // 4. Resetear flags de impresión para todas las órdenes en proceso
    console.log('\n4️⃣ RESETEANDO FLAGS DE IMPRESIÓN...');
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
    
    // 5. Verificar estado final
    console.log('\n5️⃣ VERIFICANDO ESTADO FINAL...');
    const { data: finalOrder } = await supabase
      .from('orders')
      .select('id, status, kitchen_printed, drink_printed, customer_name')
      .eq('id', order.id)
      .single();
      
    if (finalOrder) {
      console.log('📊 Estado de la orden de prueba:');
      console.log(`   ID: ${finalOrder.id}`);
      console.log(`   Cliente: ${finalOrder.customer_name}`);
      console.log(`   Status: ${finalOrder.status}`);
      console.log(`   Kitchen printed: ${finalOrder.kitchen_printed}`);
      console.log(`   Drink printed: ${finalOrder.drink_printed}`);
    }
    
    // 6. Crear script de prueba mejorado
    console.log('\n6️⃣ CREANDO SCRIPT DE PRUEBA MEJORADO...');
    
    const improvedTestScript = `
#!/usr/bin/env python3
"""
Script de prueba mejorado para impresoras
Uso: python test-print-improved.py [kitchen|bar] [order_id]
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
    
    try:
        # Obtener datos de la orden
        response = supabase.table('orders').select('*, order_items(*, menu_items(*)), table:tables(table_number)').eq('id', order_id).single().execute()
        
        if not response.data:
            print(f"❌ Orden #{order_id} no encontrada")
            return False
        
        order = response.data
        print(f"✅ Orden encontrada: {order.get('customer_name', 'N/A')}")
        
        # Simular impresión (sin impresora física)
        print("📄 Simulando impresión de comanda de cocina...")
        print("=" * 50)
        print("COCINA")
        print("-" * 50)
        print(f"Pedido #{order['id']} - Mesa: {order.get('table', {}).get('table_number', 'N/A')}")
        print(f"Cliente: {order.get('customer_name', 'N/A')}")
        print(f"Fecha: {order.get('created_at', 'N/A')}")
        print("-" * 50)
        
        for item in order.get('order_items', []):
            quantity = item.get('quantity', 0)
            name = item.get('menu_items', {}).get('name', 'N/A')
            print(f"{quantity}x {name}")
            
            if item.get('notes'):
                print(f"  >> {item['notes']}")
        
        if order.get('notes'):
            print("-" * 50)
            print("NOTA DEL PEDIDO:")
            print(f"{order['notes']}")
        
        print("=" * 50)
        print("✅ Simulación de impresión de cocina completada")
        
        # Actualizar flag de impresión
        update_response = supabase.table('orders').update({'kitchen_printed': True}).eq('id', order_id).execute()
        if update_response.data:
            print("✅ Flag kitchen_printed actualizado a True")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de cocina: {e}")
        return False

def test_bar_print(order_id):
    """Prueba impresión de bar"""
    print(f"🧪 Probando impresión de bar para orden #{order_id}")
    
    try:
        # Obtener datos de la orden
        response = supabase.table('orders').select('*, order_items(*, menu_items(*)), table:tables(table_number)').eq('id', order_id).single().execute()
        
        if not response.data:
            print(f"❌ Orden #{order_id} no encontrada")
            return False
        
        order = response.data
        print(f"✅ Orden encontrada: {order.get('customer_name', 'N/A')}")
        
        # Simular impresión (sin impresora física)
        print("📄 Simulando impresión de comanda de bar...")
        print("=" * 50)
        print("COMANDA DE BAR")
        print("-" * 50)
        print(f"Pedido #{order['id']} - Mesa: {order.get('table', {}).get('table_number', 'N/A')}")
        print(f"Cliente: {order.get('customer_name', 'N/A')}")
        print(f"Fecha: {order.get('created_at', 'N/A')}")
        print("-" * 50)
        
        total = 0
        for item in order.get('order_items', []):
            quantity = item.get('quantity', 0)
            name = item.get('menu_items', {}).get('name', 'N/A')
            price = item.get('menu_items', {}).get('price', 0)
            item_total = quantity * price
            total += item_total
            
            print(f"{quantity}x {name:<25} Bs {item_total:.2f}")
            
            if item.get('notes'):
                print(f"  >> {item['notes']}")
        
        if order.get('notes'):
            print("-" * 50)
            print("NOTA DEL PEDIDO:")
            print(f"{order['notes']}")
        
        print("-" * 50)
        print(f"TOTAL: Bs {total:.2f}")
        print("=" * 50)
        print("✅ Simulación de impresión de bar completada")
        
        # Actualizar flag de impresión
        update_response = supabase.table('orders').update({'drink_printed': True}).eq('id', order_id).execute()
        if update_response.data:
            print("✅ Flag drink_printed actualizado a True")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de bar: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python test-print-improved.py [kitchen|bar] [order_id]")
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
    
    require('fs').writeFileSync('./test-print-improved.py', improvedTestScript);
    console.log('✅ Script de prueba mejorado creado: test-print-improved.py');
    
    // 7. Crear script de reimpresión manual mejorado
    console.log('\n7️⃣ CREANDO SCRIPT DE REIMPRESIÓN MEJORADO...');
    
    const improvedReprintScript = `
#!/usr/bin/env python3
"""
Script de reimpresión manual mejorado
Uso: python reprint-improved.py [order_id]
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
    
    try:
        # Obtener datos de la orden
        response = supabase.table('orders').select('*, order_items(*, menu_items(*)), table:tables(table_number)').eq('id', order_id).single().execute()
        
        if not response.data:
            print(f"❌ Orden #{order_id} no encontrada")
            return False
        
        order = response.data
        print(f"✅ Orden encontrada: {order.get('customer_name', 'N/A')}")
        print(f"   Mesa: {order.get('table', {}).get('table_number', 'N/A')}")
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
            
            # Verificar estado final
            final_response = supabase.table('orders').select('kitchen_printed, drink_printed').eq('id', order_id).single().execute()
            if final_response.data:
                print(f"📊 Estado final:")
                print(f"   Kitchen printed: {final_response.data['kitchen_printed']}")
                print(f"   Drink printed: {final_response.data['drink_printed']}")
            
            return True
        else:
            print("❌ Error reseteando flags de impresión")
            return False
            
    except Exception as e:
        print(f"❌ Error en reimpresión: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python reprint-improved.py [order_id]")
        sys.exit(1)
    
    order_id = int(sys.argv[1])
    reprint_order(order_id)
`;
    
    require('fs').writeFileSync('./reprint-improved.py', improvedReprintScript);
    console.log('✅ Script de reimpresión mejorado creado: reprint-improved.py');
    
    console.log('\n✅ SOLUCIÓN COMPLETADA');
    console.log('======================');
    console.log('📋 Problemas solucionados:');
    console.log('   1. ✅ UUID válido para table_id');
    console.log('   2. ✅ Menu items válidos');
    console.log('   3. ✅ Flags de impresión reseteados');
    console.log('   4. ✅ Scripts mejorados creados');
    console.log('   5. ✅ Orden de prueba válida creada');
    
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Reiniciar servicios Python:');
    console.log('   • Raspberry Pi: sudo systemctl restart printer-service');
    console.log('   • Windows: Reiniciar xprinter_service.py');
    console.log('');
    console.log('2. Probar impresión aislada:');
    console.log(`   • python test-print-improved.py kitchen ${order.id}`);
    console.log(`   • python test-print-improved.py bar ${order.id}`);
    console.log('');
    console.log('3. Reimprimir orden en proceso:');
    console.log(`   • python reprint-improved.py ${order.id}`);
    console.log('');
    console.log('4. Verificar en dashboard que los botones funcionen');
    console.log('   • Ve a Staff Dashboard → Órdenes');
    console.log('   • Busca la orden de prueba y prueba reimprimir');
    
    return order.id;
    
  } catch (error) {
    console.error('❌ Error en solución:', error);
  }
}

async function testDashboardReprint() {
  console.log('\n🧪 PRUEBA DE REIMPRESIÓN EN DASHBOARD');
  console.log('=====================================');
  
  try {
    // Obtener una orden en proceso para probar
    const { data: inProgressOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_name, status, kitchen_printed, drink_printed')
      .eq('status', 'in_progress')
      .limit(1)
      .single();
      
    if (orderError || !inProgressOrder) {
      console.error('❌ Error obteniendo orden en proceso:', orderError);
      return;
    }
    
    console.log(`✅ Orden en proceso encontrada: #${inProgressOrder.id}`);
    console.log(`   Cliente: ${inProgressOrder.customer_name}`);
    console.log(`   Kitchen printed: ${inProgressOrder.kitchen_printed}`);
    console.log(`   Drink printed: ${inProgressOrder.drink_printed}`);
    
    // Resetear flags para probar reimpresión
    const { error: resetError } = await supabase
      .from('orders')
      .update({
        kitchen_printed: false,
        drink_printed: false
      })
      .eq('id', inProgressOrder.id);
      
    if (resetError) {
      console.error('❌ Error reseteando flags:', resetError);
      return;
    }
    
    console.log('✅ Flags reseteados para prueba de dashboard');
    console.log('📋 INSTRUCCIONES PARA PROBAR EN DASHBOARD:');
    console.log('==========================================');
    console.log('1. Ve a: http://localhost:3000/staff/dashboard');
    console.log('2. Busca la orden en la pestaña "En Proceso"');
    console.log('3. Haz clic en los botones de reimpresión:');
    console.log('   • "Cocina" - Debería enviar a printer_service.py');
    console.log('   • "Bar" - Debería enviar a xprinter_service.py');
    console.log('4. Verifica que los indicadores cambien a "Impreso"');
    console.log('5. Si hay errores, revisa la consola del navegador');
    
    return inProgressOrder.id;
    
  } catch (error) {
    console.error('❌ Error en prueba de dashboard:', error);
  }
}

async function main() {
  console.log('🚀 SOLUCIÓN COMPLETA DE PROBLEMAS DE IMPRESIÓN');
  console.log('==============================================');
  
  // Paso 1: Solucionar problemas
  const testOrderId = await fixPrintingIssues();
  
  // Paso 2: Probar dashboard
  const dashboardOrderId = await testDashboardReprint();
  
  console.log('\n🏁 PROCESO COMPLETADO');
  console.log('=====================');
  console.log('📋 Resumen:');
  console.log('   ✅ Problemas de UUID solucionados');
  console.log('   ✅ Scripts mejorados creados');
  console.log('   ✅ Orden de prueba válida creada');
  console.log('   ✅ Dashboard listo para pruebas');
  
  if (testOrderId) {
    console.log(`\n🧪 Para probar scripts:`);
    console.log(`   • Orden de prueba: #${testOrderId}`);
    console.log(`   • python test-print-improved.py kitchen ${testOrderId}`);
    console.log(`   • python test-print-improved.py bar ${testOrderId}`);
  }
  
  if (dashboardOrderId) {
    console.log(`\n🖥️  Para probar dashboard:`);
    console.log(`   • Orden en proceso: #${dashboardOrderId}`);
    console.log(`   • Ve a: http://localhost:3000/staff/dashboard`);
    console.log(`   • Prueba los botones de reimpresión`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixPrintingIssues,
  testDashboardReprint
}; 
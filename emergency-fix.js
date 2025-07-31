const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function emergencyStop() {
  console.log('🚨 EMERGENCIA: DETENIENDO IMPRESIÓN MASIVA');
  console.log('==========================================');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  try {
    // 1. DESACTIVAR TODAS LAS IMPRESORAS INMEDIATAMENTE
    console.log('\n1️⃣ DESACTIVANDO TODAS LAS IMPRESORAS...');
    const { error: deactivateError } = await supabase
      .from('printers')
      .update({ is_active: false })
      .eq('restaurant_id', restaurantId);
      
    if (deactivateError) {
      console.error('❌ Error desactivando impresoras:', deactivateError);
    } else {
      console.log('✅ TODAS LAS IMPRESORAS DESACTIVADAS');
      console.log('🛑 Los servicios Python ya no imprimirán');
    }
    
    // 2. RESTAURAR ESTADO CORRECTO DE ÓRDENES EN PROCESO
    console.log('\n2️⃣ RESTAURANDO ESTADO CORRECTO...');
    
    // Obtener órdenes en proceso que fueron afectadas
    const { data: affectedOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, kitchen_printed, drink_printed, customer_name')
      .eq('status', 'in_progress')
      .eq('restaurant_id', restaurantId);
      
    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }
    
    console.log(`📋 Encontradas ${affectedOrders?.length || 0} órdenes afectadas`);
    
    // Restaurar flags a true para órdenes en proceso
    if (affectedOrders && affectedOrders.length > 0) {
      const { error: restoreError } = await supabase
        .from('orders')
        .update({ 
          kitchen_printed: true, 
          drink_printed: true 
        })
        .eq('status', 'in_progress')
        .eq('restaurant_id', restaurantId);
        
      if (restoreError) {
        console.error('❌ Error restaurando estado:', restoreError);
      } else {
        console.log('✅ Estado de órdenes en proceso restaurado');
        console.log('📄 Todas las órdenes en proceso marcadas como impresas');
      }
    }
    
    // 3. VERIFICAR ESTADO FINAL
    console.log('\n3️⃣ VERIFICANDO ESTADO FINAL...');
    const { data: finalCheck } = await supabase
      .from('orders')
      .select('id, status, kitchen_printed, drink_printed')
      .eq('status', 'in_progress')
      .eq('restaurant_id', restaurantId)
      .limit(5);
      
    if (finalCheck) {
      console.log('📊 Estado final de órdenes en proceso:');
      finalCheck.forEach(order => {
        console.log(`   Orden #${order.id}: Kitchen=${order.kitchen_printed}, Bar=${order.drink_printed}`);
      });
    }
    
    console.log('\n✅ EMERGENCIA RESUELTA');
    console.log('======================');
    console.log('🛑 Impresoras desactivadas');
    console.log('📄 Estado de órdenes restaurado');
    console.log('🚫 No más impresión masiva');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Reinicia los servicios Python:');
    console.log('   • Raspberry Pi: sudo systemctl restart printer-service');
    console.log('   • Windows: Reinicia xprinter_service.py');
    console.log('');
    console.log('2. Activa SOLO las impresoras que necesites:');
    console.log('   • Ve al dashboard de impresoras');
    console.log('   • Activa UNA por UNA según necesites');
    console.log('');
    console.log('3. Para reimprimir UNA orden específica:');
    console.log('   • Usa el botón de reimpresión en el dashboard');
    console.log('   • O usa: python reprint-improved.py [order_id]');
    
  } catch (error) {
    console.error('❌ Error en emergencia:', error);
  }
}

async function createSafeReprintScript() {
  console.log('\n🔒 CREANDO SCRIPT DE REIMPRESIÓN SEGURO...');
  
  const safeScript = `
#!/usr/bin/env python3
"""
Script de reimpresión SEGURO - Solo una orden específica
Uso: python safe-reprint.py [order_id]
"""

import sys
import os
from dotenv import load_dotenv
from supabase import create_client

# Cargar variables de entorno
load_dotenv('.env.local')
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

def safe_reprint(order_id):
    """Reimprime SOLO una orden específica de forma segura"""
    print(f"🔒 Reimpresión SEGURA para orden #{order_id}")
    
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
        
        # CONFIRMACIÓN antes de resetear
        print("\\n⚠️  ADVERTENCIA: Esto reseteará los flags de impresión")
        print("   Solo haz esto si quieres reimprimir ESTA orden específica")
        
        confirm = input("¿Estás seguro? (escribe 'SI' para confirmar): ")
        if confirm != 'SI':
            print("❌ Reimpresión cancelada")
            return False
        
        # Resetear SOLO esta orden
        print("🔄 Reseteando flags de impresión...")
        update_response = supabase.table('orders').update({
            kitchen_printed: False,
            drink_printed: False
        }).eq('id', order_id).execute()
        
        if update_response.data:
            print("✅ Flags de impresión reseteados SOLO para esta orden")
            print("📄 La orden está lista para reimpresión")
            print("💡 Los servicios Python detectarán SOLO esta orden")
            return True
        else:
            print("❌ Error reseteando flags de impresión")
            return False
            
    except Exception as e:
        print(f"❌ Error en reimpresión segura: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python safe-reprint.py [order_id]")
        sys.exit(1)
    
    order_id = int(sys.argv[1])
    safe_reprint(order_id)
`;
  
  require('fs').writeFileSync('./safe-reprint.py', safeScript);
  console.log('✅ Script seguro creado: safe-reprint.py');
  console.log('🔒 Este script pide confirmación antes de resetear');
}

async function main() {
  console.log('🚨 SCRIPT DE EMERGENCIA - DETENIENDO IMPRESIÓN MASIVA');
  console.log('=====================================================');
  
  // Paso 1: Detener emergencia
  await emergencyStop();
  
  // Paso 2: Crear script seguro
  await createSafeReprintScript();
  
  console.log('\n🏁 EMERGENCIA RESUELTA');
  console.log('=====================');
  console.log('📋 Resumen:');
  console.log('   🛑 Impresoras desactivadas');
  console.log('   📄 Estado restaurado');
  console.log('   🔒 Script seguro creado');
  console.log('   🚫 No más desperdicio de papel');
  
  console.log('\n💡 LECCIÓN APRENDIDA:');
  console.log('=====================');
  console.log('• NUNCA resetear todas las órdenes de una vez');
  console.log('• SIEMPRE trabajar con órdenes específicas');
  console.log('• PEDIR confirmación antes de cambios masivos');
  console.log('• PROBAR en un entorno de desarrollo primero');
}

// Ejecutar inmediatamente
main().catch(console.error); 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function cleanupForSinglePrinter() {
  console.log('🔧 LIMPIEZA PARA SISTEMA DE UNA SOLA IMPRESORA');
  console.log('=============================================');
  
  console.log('🎯 Objetivo: Simplificar sistema para usar solo Star Micronics BSC10');
  console.log('📍 Ubicación: Raspberry Pi (Cocina)');
  console.log('🖨️  Impresora: Star Micronics BSC10\n');
  
  try {
    // 1. Ver estado actual de impresoras
    console.log('📋 ESTADO ACTUAL DE IMPRESORAS:');
    const { data: currentPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    if (currentPrinters) {
      currentPrinters.forEach(printer => {
        const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
        console.log(`   ${printer.name} (${printer.type}): ${status}`);
        console.log(`      ID: ${printer.id}`);
      });
    }
    
    // 2. Identificar impresoras a eliminar
    const starPrinter = currentPrinters?.find(p => p.type === 'kitchen');
    const xprinter = currentPrinters?.find(p => p.type === 'drink' || p.type === 'bar');
    
    console.log('\n🔍 IDENTIFICACIÓN:');
    if (starPrinter) {
      console.log(`✅ MANTENER: ${starPrinter.name} (${starPrinter.type})`);
    }
    if (xprinter) {
      console.log(`❌ ELIMINAR: ${xprinter.name} (${xprinter.type})`);
    }
    
    // 3. Eliminar xprinter de la base de datos
    if (xprinter) {
      console.log('\n🗑️  ELIMINANDO XPRINTER DE BASE DE DATOS...');
      
      const { error: deleteError } = await supabase
        .from('printers')
        .delete()
        .eq('id', xprinter.id);
      
      if (deleteError) {
        console.error('❌ Error eliminando xprinter:', deleteError);
      } else {
        console.log('✅ Xprinter eliminada de la base de datos');
      }
    }
    
    // 4. Configurar Star Micronics como única impresora
    if (starPrinter) {
      console.log('\n⚙️  CONFIGURANDO STAR MICRONICS COMO ÚNICA IMPRESORA...');
      
      const { error: updateError } = await supabase
        .from('printers')
        .update({
          name: 'Impresora Principal (Star Micronics BSC10)',
          is_active: true
        })
        .eq('id', starPrinter.id);
      
      if (updateError) {
        console.error('❌ Error actualizando impresora:', updateError);
      } else {
        console.log('✅ Star Micronics configurada como impresora principal');
      }
    }
    
    // 5. Verificar estado final
    console.log('\n📋 CONFIGURACIÓN FINAL:');
    const { data: finalPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    if (finalPrinters && finalPrinters.length > 0) {
      finalPrinters.forEach(printer => {
        const status = printer.is_active ? '🟢 ACTIVA' : '🔴 INACTIVA';
        console.log(`   ${printer.name} (${printer.type}): ${status}`);
      });
      console.log(`\n✅ Total de impresoras: ${finalPrinters.length} (objetivo: 1)`);
    }
    
    return {
      success: true,
      printersRemaining: finalPrinters?.length || 0,
      starPrinterConfigured: finalPrinters?.some(p => p.type === 'kitchen') || false
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return { success: false, error: error.message };
  }
}

async function updateDatabaseSchema() {
  console.log('\n📊 CONSIDERACIONES PARA ESQUEMA SIMPLIFICADO');
  console.log('=============================================');
  
  console.log('💡 CAMPOS QUE PODEMOS SIMPLIFICAR:');
  console.log('📋 Tabla orders:');
  console.log('   • kitchen_printed: ✅ MANTENER (único flag necesario)');
  console.log('   • drink_printed: ❌ YA NO NECESARIO (podemos mantener por compatibilidad)');
  
  console.log('\n🔄 OPCIONES PARA DRINK_PRINTED:');
  console.log('   Opción 1: Eliminar columna (cambio de esquema)');
  console.log('   Opción 2: Ignorar columna (sin cambios de esquema)');
  console.log('   Opción 3: Reutilizar como "printed" general');
  
  console.log('\n💡 RECOMENDACIÓN: Opción 2 (Ignorar)');
  console.log('   • Sin cambios de esquema');
  console.log('   • Código más simple');
  console.log('   • Fácil rollback si es necesario');
}

async function generateSinglePrinterService() {
  console.log('\n📄 SERVICIO SIMPLIFICADO PARA UNA IMPRESORA');
  console.log('===========================================');
  
  console.log('\n🍳 NUEVO printer_service.py (SIMPLIFICADO):');
  console.log('```python');
  console.log('import time');
  console.log('import os');
  console.log('from supabase import create_client, Client');
  console.log('');
  console.log('# Configuración');
  console.log('SUPABASE_URL = "https://osvgapxefsqqhltkabku.supabase.co"');
  console.log('SUPABASE_KEY = "tu_service_role_key"');
  console.log('RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"');
  console.log('');
  console.log('supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)');
  console.log('');
  console.log('def check_printer_active():');
  console.log('    """Verificar si la impresora está activa"""');
  console.log('    try:');
  console.log('        response = supabase.table("printers")\\');
  console.log('            .select("is_active")\\');
  console.log('            .eq("restaurant_id", RESTAURANT_ID)\\');
  console.log('            .eq("type", "kitchen")\\');
  console.log('            .single()\\');
  console.log('            .execute()');
  console.log('        ');
  console.log('        is_active = response.data.get("is_active", False)');
  console.log('        if not is_active:');
  console.log('            print("🔴 Impresora DESACTIVADA")');
  console.log('        return is_active');
  console.log('    except Exception as e:');
  console.log('        print(f"❌ Error verificando estado: {e}")');
  console.log('        return False');
  console.log('');
  console.log('def main_loop():');
  console.log('    print("🖨️  Servicio de impresora única iniciado (Star Micronics BSC10)")');
  console.log('    ');
  console.log('    while True:');
  console.log('        try:');
  console.log('            # 1. Verificar si impresora está activa');
  console.log('            if not check_printer_active():');
  console.log('                print("⏸️  Impresora desactivada, esperando...")');
  console.log('                time.sleep(10)');
  console.log('                continue');
  console.log('            ');
  console.log('            # 2. Buscar pedidos pendientes');
  console.log('            orders = supabase.table("orders")\\');
  console.log('                .select("*, order_items(*, menu_items(name))")\\');
  console.log('                .eq("restaurant_id", RESTAURANT_ID)\\');
  console.log('                .eq("kitchen_printed", False)\\');
  console.log('                .execute()');
  console.log('            ');
  console.log('            if not orders.data:');
  console.log('                time.sleep(5)');
  console.log('                continue');
  console.log('            ');
  console.log('            for order in orders.data:');
  console.log('                print(f"\\n🖨️  Imprimiendo pedido {order['id']} - {order['customer_name']}")');
  console.log('                ');
  console.log('                # 3. Imprimir TODOS los items (ya no hay filtrado)');
  console.log('                for item in order["order_items"]:');
  console.log('                    item_name = item["menu_items"]["name"] if item["menu_items"] else "Item desconocido"');
  console.log('                    print(f"   • {item[\'quantity\']}x {item_name}")');
  console.log('                ');
  console.log('                # AQUÍ VA TU CÓDIGO DE IMPRESIÓN FÍSICA');
  console.log('                ');
  console.log('                # 4. Marcar como impreso');
  console.log('                supabase.table("orders")\\');
  console.log('                    .update({"kitchen_printed": True})\\');
  console.log('                    .eq("id", order["id"])\\');
  console.log('                    .execute()');
  console.log('                ');
  console.log('                print(f"✅ Pedido {order[\'id\']} impreso correctamente")');
  console.log('            ');
  console.log('            time.sleep(5)');
  console.log('            ');
  console.log('        except Exception as e:');
  console.log('            print(f"❌ Error en loop principal: {e}")');
  console.log('            time.sleep(10)');
  console.log('');
  console.log('if __name__ == "__main__":');
  console.log('    main_loop()');
  console.log('```');
}

// Execute cleanup
cleanupForSinglePrinter().then(result => {
  if (result?.success) {
    updateDatabaseSchema();
    generateSinglePrinterService();
    console.log('\n🎉 LIMPIEZA COMPLETADA');
    console.log('Sistema simplificado para una sola impresora');
    console.log('Próximo paso: Implementar el servicio simplificado');
  } else {
    console.log('\n❌ Error en limpieza');
    if (result?.error) {
      console.log(`Error: ${result.error}`);
    }
  }
});
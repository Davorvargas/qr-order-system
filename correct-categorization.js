const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

async function generateCorrectCategorization() {
  console.log('🔄 CLASIFICACIÓN CORRECTA DE CATEGORÍAS');
  console.log('======================================');
  
  // Clasificación correcta basada en el análisis
  const categorization = {
    KITCHEN: {
      name: '🍳 IMPRESORA DE COCINA',
      description: 'Platos que requieren preparación en cocina',
      categories: [
        { id: 4, name: 'Picantes' },
        { id: 5, name: 'Platos con Carne de Cerdo' },
        { id: 6, name: 'Platos con Carne de Res' },
        { id: 7, name: 'Pescado' },
        { id: 8, name: 'Menu para Niños' },
        { id: 14, name: 'POSTRES' },
        { id: 15, name: 'ACOMPAÑAMIENTOS' },
        { id: 16, name: 'Almuerzo de Viernes' },
        { id: 17, name: 'Sandwiches de Viernes' }
      ]
    },
    BAR: {
      name: '🥤 IMPRESORA DE BAR',
      description: 'Bebidas y tragos que se preparan en el bar',
      categories: [
        { id: 9, name: 'Jugos' },
        { id: 10, name: 'Gaseosas' },
        { id: 11, name: 'Cervezas' },
        { id: 12, name: 'Bebidas con Alcohol' },
        { id: 13, name: 'Whisky y Vino' }
      ]
    }
  };
  
  console.log('\n📋 CLASIFICACIÓN DEFINITIVA:');
  console.log('============================');
  
  Object.entries(categorization).forEach(([type, config]) => {
    console.log(`\n${config.name}`);
    console.log(`${config.description}`);
    console.log(`Categorías (${config.categories.length}):`);
    
    config.categories.forEach(cat => {
      console.log(`   • ${cat.name} (ID: ${cat.id})`);
    });
  });
  
  // Generate Python code
  console.log('\n💻 CÓDIGO PYTHON CORRECTO:');
  console.log('==========================');
  
  const kitchenIds = categorization.KITCHEN.categories.map(c => c.id);
  const barIds = categorization.BAR.categories.map(c => c.id);
  
  console.log('\n🍳 Para printer_service.py (Raspberry Pi):');
  console.log('```python');
  console.log(`KITCHEN_CATEGORIES = [${kitchenIds.join(', ')}]  # Cocina`);
  console.log('');
  console.log('def should_print_kitchen(order_items):');
  console.log('    """Verificar si el pedido tiene items de cocina"""');
  console.log('    kitchen_items = []');
  console.log('    ');
  console.log('    for item in order_items:');
  console.log('        try:');
  console.log('            menu_item = supabase.table("menu_items")\\');
  console.log('                .select("id, name, category_id")\\');
  console.log('                .eq("id", item["menu_item_id"])\\');
  console.log('                .single()\\');
  console.log('                .execute()');
  console.log('            ');
  console.log('            if menu_item.data["category_id"] in KITCHEN_CATEGORIES:');
  console.log('                kitchen_items.append({');
  console.log('                    "name": menu_item.data["name"],');
  console.log('                    "quantity": item["quantity"]');
  console.log('                })');
  console.log('        except Exception as e:');
  console.log('            print(f"Error checking item {item[\"menu_item_id\"]}: {e}")');
  console.log('    ');
  console.log('    return kitchen_items  # Retorna items a imprimir o lista vacía');
  console.log('```');
  
  console.log('\n🥤 Para xprinter_service.py (Windows Tablet):');
  console.log('```python');
  console.log(`BAR_CATEGORIES = [${barIds.join(', ')}]  # Bar`);
  console.log('');
  console.log('def should_print_bar(order_items):');
  console.log('    """Verificar si el pedido tiene items de bar"""');
  console.log('    bar_items = []');
  console.log('    ');
  console.log('    for item in order_items:');
  console.log('        try:');
  console.log('            menu_item = supabase.table("menu_items")\\');
  console.log('                .select("id, name, category_id")\\');
  console.log('                .eq("id", item["menu_item_id"])\\');
  console.log('                .single()\\');
  console.log('                .execute()');
  console.log('            ');
  console.log('            if menu_item.data["category_id"] in BAR_CATEGORIES:');
  console.log('                bar_items.append({');
  console.log('                    "name": menu_item.data["name"],');
  console.log('                    "quantity": item["quantity"]');
  console.log('                })');
  console.log('        except Exception as e:');
  console.log('            print(f"Error checking item {item[\"menu_item_id\"]}: {e}")');
  console.log('    ');
  console.log('    return bar_items  # Retorna items a imprimir o lista vacía');
  console.log('```');
  
  return categorization;
}

async function createTestOrdersForCorrectFiltering() {
  console.log('\n🧪 CREANDO PEDIDOS DE PRUEBA PARA FILTRADO CORRECTO');
  console.log('==================================================');
  
  const testOrders = [
    {
      name: 'FILTRADO - Solo Cocina',
      table: '1',
      items: [
        { id: 39, name: 'CHARQUE', category: 'Carne de Res' },
        { id: 34, name: 'FRICASE', category: 'Carne de Cerdo' }
      ],
      expected: { kitchen: true, bar: false }
    },
    {
      name: 'FILTRADO - Solo Bar',
      table: '2', 
      items: [
        { id: 50, name: 'Coca Cola', category: 'Gaseosas' },
        { id: 46, name: 'Jarra Jugo de fruta', category: 'Jugos' }
      ],
      expected: { kitchen: false, bar: true }
    },
    {
      name: 'FILTRADO - Mixto',
      table: '3',
      items: [
        { id: 39, name: 'CHARQUE', category: 'Carne de Res' },
        { id: 50, name: 'Coca Cola', category: 'Gaseosas' }
      ],
      expected: { kitchen: true, bar: true }
    }
  ];
  
  console.log('\n📋 PEDIDOS DE PRUEBA SUGERIDOS:');
  
  testOrders.forEach((order, index) => {
    console.log(`\n${index + 1}. ${order.name}`);
    console.log(`   Mesa: ${order.table}`);
    console.log(`   Items:`);
    order.items.forEach(item => {
      console.log(`     • ${item.name} (${item.category})`);
    });
    console.log(`   Esperado: Cocina=${order.expected.kitchen}, Bar=${order.expected.bar}`);
  });
  
  console.log('\n💡 DESPUÉS DE CORREGIR LOS SERVICIOS:');
  console.log('1. Reiniciar ambos servicios Python');
  console.log('2. Crear estos pedidos de prueba');
  console.log('3. Verificar que cada impresora solo imprima sus items correspondientes');
  
  return testOrders;
}

async function generateCompleteServiceExample() {
  console.log('\n📄 EJEMPLO COMPLETO DE SERVICIO CORREGIDO');
  console.log('=========================================');
  
  console.log('\n🍳 printer_service.py (Raspberry Pi) - EJEMPLO COMPLETO:');
  console.log('```python');
  console.log('import time');
  console.log('import os');
  console.log('from supabase import create_client, Client');
  console.log('');
  console.log('# Configuración');
  console.log('SUPABASE_URL = "https://osvgapxefsqqhltkabku.supabase.co"');
  console.log('SUPABASE_KEY = "tu_service_role_key"');
  console.log('RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"');
  console.log('KITCHEN_CATEGORIES = [4, 5, 6, 7, 8, 14, 15, 16, 17]');
  console.log('');
  console.log('supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)');
  console.log('');
  console.log('def check_printer_active():');
  console.log('    """Verificar si la impresora de cocina está activa"""');
  console.log('    try:');
  console.log('        response = supabase.table("printers")\\');
  console.log('            .select("is_active")\\');
  console.log('            .eq("restaurant_id", RESTAURANT_ID)\\');
  console.log('            .eq("type", "kitchen")\\');
  console.log('            .single()\\');
  console.log('            .execute()');
  console.log('        return response.data.get("is_active", False)');
  console.log('    except Exception as e:');
  console.log('        print(f"Error checking printer status: {e}")');
  console.log('        return False');
  console.log('');
  console.log('def get_kitchen_items(order_items):');
  console.log('    """Filtrar solo items de cocina"""');
  console.log('    kitchen_items = []');
  console.log('    for item in order_items:');
  console.log('        try:');
  console.log('            menu_item = supabase.table("menu_items")\\');
  console.log('                .select("name, category_id")\\');
  console.log('                .eq("id", item["menu_item_id"])\\');
  console.log('                .single()\\');
  console.log('                .execute()');
  console.log('            ');
  console.log('            if menu_item.data["category_id"] in KITCHEN_CATEGORIES:');
  console.log('                kitchen_items.append({');
  console.log('                    "name": menu_item.data["name"],');
  console.log('                    "quantity": item["quantity"]');
  console.log('                })');
  console.log('        except Exception as e:');
  console.log('            print(f"Error processing item: {e}")');
  console.log('    return kitchen_items');
  console.log('');
  console.log('def main_loop():');
  console.log('    print("🍳 Servicio de impresora de cocina iniciado")');
  console.log('    while True:');
  console.log('        try:');
  console.log('            # 1. Verificar si impresora está activa');
  console.log('            if not check_printer_active():');
  console.log('                print("Impresora de cocina desactivada")');
  console.log('                time.sleep(10)');
  console.log('                continue');
  console.log('            ');
  console.log('            # 2. Buscar pedidos pendientes');
  console.log('            orders = supabase.table("orders")\\');
  console.log('                .select("*, order_items(*)")\\');
  console.log('                .eq("restaurant_id", RESTAURANT_ID)\\');
  console.log('                .eq("kitchen_printed", False)\\');
  console.log('                .execute()');
  console.log('            ');
  console.log('            for order in orders.data:');
  console.log('                # 3. Filtrar items de cocina');
  console.log('                kitchen_items = get_kitchen_items(order["order_items"])');
  console.log('                ');
  console.log('                if kitchen_items:');
  console.log('                    # 4. Imprimir comanda de cocina');
  console.log('                    print(f"Imprimiendo cocina - Pedido {order[\\"id\\"]}")');
  console.log('                    # AQUÍ VA TU CÓDIGO DE IMPRESIÓN FÍSICA');
  console.log('                    ');
  console.log('                    # 5. Marcar como impreso');
  console.log('                    supabase.table("orders")\\');
  console.log('                        .update({"kitchen_printed": True})\\');
  console.log('                        .eq("id", order["id"])\\');
  console.log('                        .execute()');
  console.log('            ');
  console.log('            time.sleep(5)');
  console.log('        except Exception as e:');
  console.log('            print(f"Error en loop principal: {e}")');
  console.log('            time.sleep(10)');
  console.log('');
  console.log('if __name__ == "__main__":');
  console.log('    main_loop()');
  console.log('```');
}

// Execute
generateCorrectCategorization().then(categorization => {
  if (categorization) {
    createTestOrdersForCorrectFiltering();
    generateCompleteServiceExample();
    console.log('\n🎯 CLASIFICACIÓN CORRECTA COMPLETADA');
    console.log('Templates de servicios corregidos generados');
  }
});
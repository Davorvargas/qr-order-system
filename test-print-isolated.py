
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

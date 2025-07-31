
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

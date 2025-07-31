
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
        print("\n⚠️  ADVERTENCIA: Esto reseteará los flags de impresión")
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

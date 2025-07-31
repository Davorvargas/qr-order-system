#!/usr/bin/env python3

import time
import os
from supabase import create_client, Client

SUPABASE_URL = "https://osvgapxefsqqhltkabku.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc"
RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_printer_active():
    try:
        response = supabase.table("printers").select("is_active").eq("restaurant_id", RESTAURANT_ID).eq("type", "kitchen").single().execute()
        is_active = response.data.get("is_active", False)
        if not is_active:
            print("IMPRESORA DESACTIVADA")
        return is_active
    except Exception as e:
        print(f"Error verificando estado: {e}")
        return False

def print_order(order):
    try:
        print(f"\n=== IMPRIMIENDO PEDIDO {order['id']} ===")
        print(f"Cliente: {order['customer_name']}")
        print(f"Mesa: {order.get('table_number', 'N/A')}")
        print(f"Total: Bs {order['total_price']}")
        print("Items:")
        
        for item in order["order_items"]:
            item_name = "Item desconocido"
            if item.get("menu_items") and item["menu_items"].get("name"):
                item_name = item["menu_items"]["name"]
            print(f"   - {item['quantity']}x {item_name}")
        
        if order.get('notes'):
            print(f"Notas: {order['notes']}")
        
        print("=" * 40)
        return True
    except Exception as e:
        print(f"Error imprimiendo pedido {order['id']}: {e}")
        return False

def main_loop():
    print("Servicio de impresora unica iniciado")
    print("Star Micronics BSC10 (Raspberry Pi)")
    print("Restaurante:", RESTAURANT_ID[:8] + "...")
    print("Iniciando monitoreo...\n")
    
    while True:
        try:
            if not check_printer_active():
                print("Impresora desactivada, esperando...")
                time.sleep(10)
                continue
            
            orders = supabase.table("orders").select("*, order_items(*, menu_items(name)), tables(table_number)").eq("restaurant_id", RESTAURANT_ID).eq("kitchen_printed", False).execute()
            
            if not orders.data:
                time.sleep(5)
                continue
            
            for order in orders.data:
                print(f"\nProcesando pedido {order['id']} - {order['customer_name']}")
                
                if order.get('tables') and order['tables'].get('table_number'):
                    order['table_number'] = order['tables']['table_number']
                
                if print_order(order):
                    supabase.table("orders").update({"kitchen_printed": True}).eq("id", order["id"]).execute()
                    print(f"Pedido {order['id']} impreso y marcado correctamente")
                else:
                    print(f"Error imprimiendo pedido {order['id']}")
            
            time.sleep(5)
            
        except KeyboardInterrupt:
            print("\nServicio detenido por usuario")
            break
        except Exception as e:
            print(f"Error en loop principal: {e}")
            time.sleep(10)

if __name__ == "__main__":
    try:
        main_loop()
    except KeyboardInterrupt:
        print("\nServicio finalizado")
    except Exception as e:
        print(f"Error fatal: {e}")
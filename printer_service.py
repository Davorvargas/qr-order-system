import os
import time
import gc
from dotenv import load_dotenv
from supabase import create_client, Client
from escpos.printer import Usb

# IDs de tu impresora
VENDOR_ID = 0x0519
PRODUCT_ID = 0x000b

# Carga variables de entorno
dotenv_path = os.path.join(os.path.dirname(__file__), '.env.local')
load_dotenv(dotenv_path=dotenv_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Faltan SUPABASE_URL o SUPABASE_KEY en .env.local")
    exit(1)

supabase: Client = create_client(url, key)

def print_order(order, order_items):
    try:
        p = Usb(VENDOR_ID, PRODUCT_ID)

        # Mesa grande
        p._raw(b'\x1d\x21\x11')
        p.text(f"MESA: {order['table_id']}\n")

        # Cliente y hora normal
        p._raw(b'\x1d\x21\x00')
        p.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
        p.text(f"Hora: {time.strftime('%H:%M:%S')} | ID: {order['id']}\n")
        p.text("----------------------------------------\n")

        # Artículos grandes
        p._raw(b'\x1d\x21\x11')
        for item in order_items:
            item_name = item['menu_items']['name'] if item.get('menu_items') else 'Artículo desconocido'
            p.text(f"{item['quantity']}x {item_name}\n")
        p._raw(b'\x1d\x21\x00')
        p.text("----------------------------------------\n")

        # Notas grandes si existen
        if order.get('notes'):
            p._raw(b'\x1d\x21\x11')
            p.text("Notas:\n")
            p.text(f"{order['notes']}\n\n")
            p._raw(b'\x1d\x21\x00')

        p.text("\n\n")
        p.cut()
        time.sleep(1)  # Espera a que termine la impresión
        del p
        gc.collect()
        print(f"Orden #{order['id']} impresa.")
    except Exception as e:
        print(f"Error al imprimir: {e}")

def main():
    print("Conectando a Supabase y esperando nuevas órdenes...")
    last_printed_order_id = 0

    # Busca el último ID impreso para no repetir
    response = supabase.table("orders").select("id").order("id", desc=True).limit(1).execute()
    if response.data:
        last_printed_order_id = response.data[0]['id']

    while True:
        try:
            # Busca órdenes nuevas con status 'order_placed'
            response = supabase.table("orders") \
                .select("*") \
                .gt("id", last_printed_order_id) \
                .eq("status", "order_placed") \
                .order("id") \
                .execute()

            if response.data:
                for order in response.data:
                    # Busca los artículos de la orden
                    items_resp = supabase.table('order_items').select('quantity, menu_items(name)').eq('order_id', order['id']).execute()
                    order_items = items_resp.data
                    print_order(order, order_items)
                    # Marca la orden como impresa
                    supabase.table("orders").update({"status": "printed"}).eq("id", order['id']).execute()
                    last_printed_order_id = order['id']

        except Exception as e:
            print(f"Error: {e}")
            time.sleep(10)

        time.sleep(5)

if __name__ == "__main__":
    main()
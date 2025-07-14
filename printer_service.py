import os
import time
import gc
import json
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from escpos.printer import Usb

# IDs de tu impresora
VENDOR_ID = 0x0519
PRODUCT_ID = 0x000b

# Archivo para la cola de impresión persistente
QUEUE_FILE = "print_queue.json"

# Carga variables de entorno
dotenv_path = os.path.join(os.path.dirname(__file__), '.env.local')
load_dotenv(dotenv_path=dotenv_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Faltan SUPABASE_URL o SUPABASE_KEY en .env.local")
    exit(1)

supabase: Client = create_client(url, key)

def load_print_queue():
    """Carga la cola de impresión desde el archivo"""
    try:
        if os.path.exists(QUEUE_FILE):
            with open(QUEUE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error cargando cola de impresión: {e}")
    return []

def save_print_queue(queue):
    """Guarda la cola de impresión en el archivo"""
    try:
        with open(QUEUE_FILE, 'w', encoding='utf-8') as f:
            json.dump(queue, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error guardando cola de impresión: {e}")

def add_to_print_queue(order, order_items):
    """Añade una orden a la cola de impresión"""
    queue = load_print_queue()
    queue_item = {
        'id': f"order_{order['id']}_{int(time.time())}",
        'order': order,
        'order_items': order_items,
        'added_at': datetime.now().isoformat(),
        'retry_count': 0,
        'max_retries': 5
    }
    queue.append(queue_item)
    save_print_queue(queue)
    print(f"Orden #{order['id']} añadida a la cola de impresión")

def test_printer_connection():
    """Prueba si la impresora está disponible"""
    printer = None
    try:
        printer = Usb(VENDOR_ID, PRODUCT_ID)
        # Intenta enviar un comando simple para verificar conexión
        printer._raw(b'\x1b\x40')  # Reset command
        return True
    except Exception as e:
        print(f"Impresora no disponible: {e}")
        return False
    finally:
        if printer:
            try:
                printer.close()
            except:
                pass
            del printer
        gc.collect()

def print_order_from_queue(queue_item):
    """Imprime una orden desde la cola"""
    printer = None
    try:
        order = queue_item['order']
        order_items = queue_item['order_items']
        
        print(f"🖨️  Iniciando impresión de orden #{order['id']}...")
        
        printer = Usb(VENDOR_ID, PRODUCT_ID)

        # Mesa grande
        printer._raw(b'\x1d\x21\x11')
        printer.text(f"MESA: {order['table_id']}\n")

        # Cliente y hora normal
        printer._raw(b'\x1d\x21\x00')
        printer.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
        printer.text(f"Hora: {time.strftime('%H:%M:%S')} | ID: {order['id']}\n")
        
        # Línea separadora
        printer.text("=" * 32 + "\n")
        printer.text("   COMANDA DE COCINA\n")
        printer.text("=" * 32 + "\n\n")

        # Productos - más grandes
        printer._raw(b'\x1d\x21\x01')
        for item in order_items:
            printer.text(f"{item['quantity']}x {item['menu_items']['name']}\n")

        printer.text("\n" + "=" * 32 + "\n")
        printer.text("  PREPARAR INMEDIATAMENTE\n")
        printer.text("=" * 32 + "\n\n\n")

        # Cortar papel
        printer.cut()
        
        print(f"✅ Orden #{order['id']} impresa exitosamente")
        return True

    except Exception as e:
        print(f"❌ Error imprimiendo orden #{queue_item['order']['id']}: {e}")
        return False
    finally:
        if printer:
            try:
                printer.close()
            except Exception as e:
                print(f"⚠️  Error cerrando impresora: {e}")
            del printer
        # Forzar liberación de memoria
        gc.collect()
        # Pequeña pausa para evitar problemas de recursos
        time.sleep(1)

def process_print_queue():
    """Procesa toda la cola de impresión"""
    queue = load_print_queue()
    if not queue:
        return
    
    print(f"📄 Procesando cola de impresión ({len(queue)} órdenes pendientes)...")
    
    # Verificar si la impresora está disponible
    if not test_printer_connection():
        print("⚠️  Impresora no disponible. Las órdenes permanecen en cola.")
        return
    
    successful_prints = []
    failed_prints = []
    
    for i, queue_item in enumerate(queue):
        print(f"📋 Procesando orden {i+1}/{len(queue)}: #{queue_item['order']['id']}")
        
        try:
            if print_order_from_queue(queue_item):
                # Impresión exitosa
                successful_prints.append(queue_item)
                # Actualizar estado en Supabase - COMANDA IMPRESA
                try:
                    supabase.table("orders").update({"status": "kitchen_printed"}).eq("id", queue_item['order']['id']).execute()
                    print(f"🍳 COMANDA impresa - Status actualizado a 'kitchen_printed' para orden #{queue_item['order']['id']}")
                except Exception as e:
                    print(f"Error actualizando estado en Supabase: {e}")
            else:
                # Impresión falló
                queue_item['retry_count'] += 1
                if queue_item['retry_count'] < queue_item['max_retries']:
                    failed_prints.append(queue_item)
                    print(f"🔄 Orden #{queue_item['order']['id']} reintentará ({queue_item['retry_count']}/{queue_item['max_retries']})")
                else:
                    print(f"❌ Orden #{queue_item['order']['id']} descartada tras {queue_item['max_retries']} intentos")
        except Exception as e:
            print(f"❌ Error crítico procesando orden #{queue_item['order']['id']}: {e}")
            # En caso de error crítico, mantener la orden en la cola para reintento
            queue_item['retry_count'] += 1
            if queue_item['retry_count'] < queue_item['max_retries']:
                failed_prints.append(queue_item)
            
        # Pausa entre impresiones para evitar saturar la impresora
        if i < len(queue) - 1:  # No pausar después de la última
            print("⏱️  Pausa entre impresiones...")
            time.sleep(2)
    
    # Actualizar la cola solo con las órdenes que fallaron y pueden reintentarse
    save_print_queue(failed_prints)
    
    if successful_prints:
        print(f"✅ {len(successful_prints)} órdenes impresas exitosamente")
    if failed_prints:
        print(f"⏳ {len(failed_prints)} órdenes permanecen en cola para reintento")

def print_order(order, order_items):
    """Función de compatibilidad - añade la orden a la cola"""
    add_to_print_queue(order, order_items)

def main():
    print("🖨️  Servicio de impresión iniciado")
    print("📡 Conectando a Supabase y esperando nuevas órdenes...")
    
    # Procesar cola existente al inicio
    process_print_queue()
    
    last_printed_order_id = 0

    # ✅ CORREGIDO: Al inicio, procesar TODAS las órdenes pendientes
    print("🔍 Buscando órdenes pendientes de imprimir...")
    response = supabase.table("orders") \
        .select("*") \
        .eq("status", "order_placed") \
        .order("id") \
        .execute()

    if response.data:
        print(f"📋 Encontradas {len(response.data)} órdenes pendientes")
        for order in response.data:
            # Busca los artículos de la orden
            items_resp = supabase.table('order_items').select('quantity, menu_items(name)').eq('order_id', order['id']).execute()
            order_items = items_resp.data
            
            # Añadir a cola
            add_to_print_queue(order, order_items)
            last_printed_order_id = max(last_printed_order_id, order['id'])
    else:
        print("✅ No hay órdenes pendientes")

    print(f"🚀 Monitoreo activo desde orden ID: {last_printed_order_id}")

    while True:
        try:
            # Procesar cola de impresión cada ciclo
            process_print_queue()
            
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
                    
                    # Añadir a cola en lugar de imprimir directamente
                    add_to_print_queue(order, order_items)
                    last_printed_order_id = order['id']

        except Exception as e:
            print(f"❌ Error en el ciclo principal: {e}")
            time.sleep(10)

        time.sleep(5)

if __name__ == "__main__":
    main()
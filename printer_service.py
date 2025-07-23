#!/usr/bin/env python3
"""
Servicio de Impresión Simple para QR Order System
Basado en python-escpos para Star Micronics BSC10

Este servicio monitorea Supabase directamente e imprime comandas
inmediatamente cuando detecta nuevas órdenes.
NO usa sistema de colas para evitar impresiones duplicadas.
"""

import os
import time
import signal
import sys
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from escpos.printer import Usb
from escpos.exceptions import USBNotFoundError, DeviceNotFoundError
import argparse

# Configuración de impresora Star Micronics BSC10
VENDOR_ID = 0x0519
PRODUCT_ID = 0x000b

# Control de ejecución
running = True
supabase = None

def signal_handler(sig, frame):
    """Maneja la señal de interrupción para salida limpia"""
    global running
    print("\nRecibida señal de interrupción. Cerrando servicio...")
    running = False

def load_environment():
    """Carga variables de entorno de Supabase"""
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env.local')
    load_dotenv(dotenv_path=dotenv_path)
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("[ERROR] Faltan SUPABASE_URL o SUPABASE_KEY en .env.local")
        sys.exit(1)
    
    return create_client(url, key)

def test_printer():
    """Prueba la conexión con la impresora"""
    try:
        printer = Usb(VENDOR_ID, PRODUCT_ID, profile="default")
        # Comando de reset simple para verificar comunicación
        printer._raw(b'\x1b\x40')
        printer.close()
        print("[OK] Impresora detectada y funcionando correctamente")
        return True
    except (USBNotFoundError, DeviceNotFoundError):
        print("[ERROR] Impresora no encontrada (USB 0519:000b)")
        print("   Verifica que la impresora esté conectada y encendida")
        return False
    except Exception as e:
        print(f"[ERROR] Error de conexión con impresora: {e}")
        return False

def print_kitchen_ticket(order):
    print(f"[DEBUG] Orden recibida en cocina: {order}")
    """Imprime un ticket de cocina para un pedido específico."""
    try:
        print("DEBUG ORDER:", order)
        p = Usb(VENDOR_ID, PRODUCT_ID, profile="TM-T88V")

        # Buscar el número de mesa real
        table_id = order.get('table_id')
        table_number = None
        print(f"[DEBUG] Buscando número de mesa para table_id: {table_id}")
        if table_id:
            table_resp = supabase.table('tables').select('table_number').eq('id', table_id).single().execute()
            print(f"[DEBUG] Resultado de lookup de mesa: {table_resp.data}")
            if table_resp.data and 'table_number' in table_resp.data:
                table_number = table_resp.data['table_number']
        mesa_str = table_number if table_number else 'Mesa desconocida'

        p.set(align='center', bold=True, width=2, height=2)
        p.text("COCINA\n")
        p.set(align='left', bold=False, width=1, height=1)
        p.text("----------------------------------------\n")
        p.set(bold=True)
        p.text(f"Pedido #{order['id']} - Mesa: {mesa_str}\n")
        p.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
        # Add order time
        order_time = order.get('created_at')
        if order_time:
            # Format timestamp if needed
            try:
                from dateutil import parser
                dt = parser.parse(order_time) if isinstance(order_time, str) else order_time
                order_time_str = dt.strftime('%d/%m/%Y %H:%M:%S')
            except Exception:
                order_time_str = str(order_time)
        else:
            from datetime import datetime
            order_time_str = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        p.text(f"Fecha: {order_time_str}\n")
        p.set(bold=False)
        p.text("----------------------------------------\n")

        # Imprimir platos (order_items)
        for item in order.get('order_items', []):
            print(f"[DEBUG] Item de orden: {item}")
            quantity = item.get('quantity', 0)
            item_name = item.get('menu_items', {}).get('name', 'Producto no encontrado')
            p.set(width=2, height=2)
            p.text(f"{quantity}x {item_name}\n")

            # Notas por ítem
            item_notes = item.get('notes')
            if item_notes:
                p.set(width=1, height=1, bold=False, align='left')
                p.text(f"  >> {item_notes}\n")
                p.set(width=1, height=1, bold=True)

        # Imprimir nota global si existe
        global_notes = order.get('notes')
        if global_notes:
            p.set(width=1, height=1, bold=True, align='left')
            p.text("\n--- Nota del pedido ---\n")
            p.set(width=1, height=1, bold=False, align='left')
            p.text(f"{global_notes}\n")

        p.text("\n")
        p.cut()
        p.close()
        print(f"[OK] Comanda de cocina para el pedido #{order['id']} impresa correctamente.")
        return True
    except Exception as e:
        print(f"[ERROR] No se pudo imprimir la comanda de cocina para el pedido #{order['id']}: {e}")
        return False

def print_single_order(order_id):
    """Imprime un solo pedido por ID y no actualiza el estado (lo hace la API)."""
    global supabase
    if not supabase:
        supabase = load_environment()
    
    print(f"[INFO] Solicitud de impresión manual para el pedido #{order_id}")
    response = supabase.table('orders').select('*, order_items(*, menu_items(*))').eq('id', order_id).single().execute()
    if response.data:
        print_kitchen_ticket(response.data)
    else:
        print(f"[ERROR] No se encontró el pedido con ID {order_id} para la impresión manual.")

def process_new_orders():
    global supabase
    if not supabase:
        supabase = load_environment()
    print("[INFO] Iniciando el servicio de impresión de cocina...")
    
    while running:
        try:
            # Ahora busca CUALQUIER orden que no esté impresa para la cocina.
            # Esto incluye nuevas y las que se marcaron para reimprimir.
            response = supabase.table('orders').select('*, notes, order_items(*, notes, menu_items(*))').eq('kitchen_printed', False).order('id').execute()
            
            new_orders = response.data
            
            if new_orders:
                print(f"[+] Se encontraron {len(new_orders)} pedidos para la cocina.")
                for order in new_orders:
                    # Se añade una comprobación del estado para no reimprimir completados/cancelados
                    if order['status'] in ['pending', 'in_progress']:
                        if print_kitchen_ticket(order):
                            print(f"[INFO] Marcando pedido #{order['id']} como impreso en cocina...")
                            
                            # Actualizar 'kitchen_printed'.
                            update_response = supabase.table('orders').update({'kitchen_printed': True}).eq('id', order['id']).execute()

                            # Comprobar si la actualización fue exitosa.
                            if update_response.data:
                                # Re-fetch the order to get the most up-to-date status.
                                refetch_response = supabase.table('orders').select('*').eq('id', order['id']).single().execute()

                                if refetch_response.data:
                                    updated_order = refetch_response.data
                                    print(f"[OK] Pedido #{order['id']} marcado como impreso en cocina.")

                                    # Comprobar si la otra impresora también ha terminado.
                                    if updated_order.get('drink_printed'):
                                        print(f"[INFO] Ambas impresoras terminaron. Moviendo pedido #{order['id']} a 'En Proceso'.")
                                        supabase.table('orders').update({'status': 'in_progress'}).eq('id', order['id']).execute()
                                    else:
                                        print(f"[INFO] Esperando la impresión de bebidas para el pedido #{order['id']}.")
                                else:
                                    print(f"[ERROR] No se pudo re-obtener el estado del pedido #{order['id']} después de actualizar.")
                            else:
                                print(f"[ERROR] FALLO AL ACTUALIZAR la base de datos para el pedido #{order['id']}. Respuesta: {update_response}")
                        else:
                            print(f"[ERROR] No se marcará el pedido #{order['id']} como impreso debido a un fallo de impresión.")
            else:
                print("[INFO] Buscando nuevos pedidos para la cocina...      ", end='\r')

        except Exception as e:
            print(f"\n[ERROR] Ocurrió un error en el bucle principal: {e}")
            print("[WARN] Esperando 60 segundos antes de reintentar para evitar spam de errores.")
            time.sleep(60)
        
        time.sleep(10)

def find_last_processed_order():
    """Esta función ya no es necesaria con la nueva lógica, pero se puede mantener por si se revierte."""
    return 0


def main():
    """Función principal del servicio"""
    global running, supabase
    
    # Configurar manejo de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("[INFO] === SERVICIO DE IMPRESIÓN SIMPLE ===")
    print("[INFO] Star Micronics BSC10 (USB 0519:000b)")
    print("[INFO] Sin sistema de colas - Impresión directa")
    
    # Cargar configuración
    supabase = load_environment()
    print("[OK] Conectado a Supabase")
    
    # Probar impresora
    if not test_printer():
        print("[ERROR] No se puede continuar sin impresora funcionando")
        sys.exit(1)
    
    # La lógica de 'last_checked_order_id' ya no es necesaria.
    print("[INFO] Iniciando monitoreo de todas las órdenes pendientes.")
    
    # Procesar órdenes (bucle infinito)
    process_new_orders()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--print-order", type=int, help="ID de la orden a imprimir")
    args = parser.parse_args()

    if args.print_order:
        print_single_order(args.print_order)
    else:
        main() 
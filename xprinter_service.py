#!/usr/bin/env python3
"""
Servicio de Impresión Simple para QR Order System
Adaptado para Xprinter XP-T80A (Windows)

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
from escpos.exceptions import USBNotFoundError
import argparse

# Configuración de impresora Xprinter XP-T80A
VENDOR_ID = 0x0483
PRODUCT_ID = 0x5743

# Control de ejecución
running = True
printer = None
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

def init_printer():
    """Inicializa y toma control de la impresora"""
    global printer
    
    try:
        printer = Usb(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
        print("[OK] Impresora Xprinter detectada y funcionando correctamente")
        return True
        
    except USBNotFoundError:
        print("[ERROR] Impresora no encontrada (USB 0483:5743)")
        print("   Verifica que la impresora esté conectada y encendida")
        return False
    except Exception as e:
        print(f"[ERROR] Error de conexión con impresora: {e}")
        return False

def close_printer():
    """Cierra la conexión con la impresora"""
    global printer
    if printer:
        try:
            printer.close()
        except:
            pass
        printer = None

def print_drink_ticket(order, receipt_mode=False):
    """Imprime una comanda de bar o un recibo para un pedido específico."""
    global printer
    try:
        if not printer:
            init_printer()
            if not printer:
                print("[ERROR] No se pudo inicializar la impresora para imprimir el ticket.")
                return False

        p = printer
        
        # Determinar el título y si mostrar precios
        if receipt_mode:
            title = "RECIBO CLIENTE"
            show_prices = True
        else:
            title = "COMANDA DE BAR"
            show_prices = False

        p.set(align='center', bold=True, width=2, height=2)
        p.text(title + "\n")
        p.set(align='left', bold=False, width=1, height=1)
        p.text("----------------------------------------\n")
        p.set(bold=True)
        p.text(f"Pedido #{order['id']} - Mesa: {order.get('table_id', 'N/A')}\n")
        p.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
        p.set(bold=False)
        p.text(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
        p.text("----------------------------------------\n\n")

        total_price = 0
        p.set(width=1, height=1, bold=True)
        for item in order.get('order_items', []):
            quantity = item.get('quantity', 0)
            menu_item = item.get('menu_items', {})
            item_name = menu_item.get('name', 'N/A')
            price = menu_item.get('price', 0)
            
            line_item = f"{quantity}x {item_name}"
            
            if show_prices:
                item_total = quantity * price
                total_price += item_total
                price_str = f"Bs {item_total:.2f}"
                # Ajustar el padding para alinear el precio a la derecha
                padding = ' ' * (40 - len(line_item) - len(price_str))
                p.text(line_item + padding + price_str + "\n")
            else:
                p.text(line_item + "\n")

        if show_prices:
            p.text("----------------------------------------\n")
            p.set(align='right', width=2, height=2, bold=True)
            p.text(f"TOTAL: Bs {total_price:.2f}\n")

        p.text("\n\n")
        p.cut()

        print(f"[OK] Ticket impreso correctamente para el pedido #{order['id']}.")
        return True
        
    except (USBNotFoundError, OSError) as e:
        print(f"[ERROR] Error de USB al imprimir: {e}. Reintentando una vez...")
        close_printer()
        time.sleep(5)
        # Segundo intento
        try:
            init_printer()
            if printer:
                print("[INFO] Segundo intento de impresión...")
                return False # Simplificamos y evitamos recursión compleja
            else:
                return False
        except Exception as e2:
            print(f"[ERROR] Falló el segundo intento de impresión: {e2}")
            return False
    except Exception as e:
        print(f"[ERROR] Error inesperado al imprimir: {e}")
        return False

def process_new_orders():
    """Busca y procesa nuevos pedidos que necesitan impresión de bebidas."""
    global supabase
    if not supabase:
        supabase = load_environment()
    print("[INFO] Iniciando el servicio de impresión de bebidas/recibos...")
    
    while running:
        try:
            # Ahora busca CUALQUIER orden que no esté impresa para bebidas.
            # Esto incluye nuevas y las que se marcaron para reimprimir.
            response = supabase.table('orders').select('*, order_items(*, menu_items(name, price))').eq('drink_printed', False).order('id').execute()
            
            new_orders = response.data
            
            if new_orders:
                print(f"[+] Se encontraron {len(new_orders)} nuevos pedidos para el bar.")
                for order in new_orders:
                    # Se añade una comprobación del estado para no reimprimir completados/cancelados
                    if order['status'] in ['pending', 'in_progress']:
                        if print_drink_ticket(order, receipt_mode=False):
                            print(f"[INFO] Marcando pedido #{order['id']} como impreso en bar...")
                            
                            # Actualizar 'drink_printed'.
                            update_response = supabase.table('orders').update({'drink_printed': True}).eq('id', order['id']).execute()

                            # Comprobar si la actualización fue exitosa.
                            if update_response.data:
                                # Re-fetch the order to get the most up-to-date status.
                                refetch_response = supabase.table('orders').select('*').eq('id', order['id']).single().execute()

                                if refetch_response.data:
                                    updated_order = refetch_response.data
                                    print(f"[OK] Pedido #{order['id']} marcado como impreso en bar.")

                                    # Comprobar si la otra impresora también ha terminado.
                                    if updated_order.get('kitchen_printed'):
                                        print(f"[INFO] Ambas impresoras terminaron. Moviendo pedido #{order['id']} a 'En Proceso'.")
                                        supabase.table('orders').update({'status': 'in_progress'}).eq('id', order['id']).execute()
                                    else:
                                        print(f"[INFO] Esperando la impresión de cocina para el pedido #{order['id']}.")
                                else:
                                    print(f"[ERROR] No se pudo re-obtener el estado del pedido #{order['id']} después de actualizar.")
                            else:
                                print(f"[ERROR] FALLO AL ACTUALIZAR la base de datos para el pedido #{order['id']}.")
                        else:
                            print(f"[ERROR] No se marcará el pedido #{order['id']} como impreso debido a un fallo de impresión.")
            else:
                print("[INFO] Buscando nuevos pedidos para el bar...      ", end='\r')

        except Exception as e:
            print(f"\n[ERROR] Ocurrió un error en el bucle principal: {e}")
            print("[WARN] Esperando 60 segundos antes de reintentar.")
            time.sleep(60)

        time.sleep(10)

def find_last_processed_order():
    """Esta función ya no es necesaria con la nueva lógica."""
    return 0

def print_single_order(order_id):
    """Imprime un solo pedido por ID, determinando si es comanda o recibo."""
    global supabase, printer
    if not supabase:
        supabase = load_environment()
    
    # Asegurar que la impresora esté inicializada para impresión manual
    if not printer:
        if not init_printer():
            print("[ERROR] No se puede imprimir sin impresora funcionando")
            return
    
    print(f"[INFO] Solicitud de impresión manual para el pedido #{order_id}")
    response = supabase.table('orders').select('*, order_items(*, menu_items(name, price))').eq('id', order_id).single().execute()
    
    if response.data:
        order = response.data
        # Si el estado es 'pending', es una comanda de bar nueva.
        # Si no, es una reimpresión o un recibo para un pedido en proceso/completado.
        is_receipt = order.get('status') != 'pending'
        print_drink_ticket(order, receipt_mode=is_receipt)
    else:
        print(f"[ERROR] No se encontró el pedido con ID {order_id} para la impresión manual.")

def main():
    """Función principal del servicio"""
    global running, supabase
    
    # Configurar manejo de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("[INFO] === SERVICIO DE IMPRESIÓN BEBIDAS ===")
    print("[INFO] Xprinter XP-T80A (USB 0483:5743)")
    print("[INFO] Sin sistema de colas - Impresión directa")
    
    # Cargar configuración
    supabase = load_environment()
    print("[OK] Conectado a Supabase")
    
    # Inicializar impresora
    if not init_printer():
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
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
last_checked_order_id = 0
printer = None  # type: Usb | None

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
        print("❌ Error: Faltan SUPABASE_URL o SUPABASE_KEY en .env.local")
        sys.exit(1)
    
    return create_client(url, key)

def init_printer():
    """Inicializa y toma control de la impresora"""
    global printer
    # type: () -> bool
    
    try:
        # Buscar la impresora, convirtiendo a lista para evitar ambigüedad
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

def print_drink_ticket(order, order_items):
    """
    Imprime una comanda de bebidas, con reintento de conexión.
    """
    global printer
    # type: (dict, list) -> bool
    
    for attempt in range(2): # Intentar hasta 2 veces
        try:
            if not printer:
                raise USBNotFoundError("El objeto de la impresora no está inicializado.")

            # Reset de impresora y configuración de caracteres
            printer.hw("init")
            printer.charcode('CP850')
            
            # === ENCABEZADO MESA ===
            printer.set(align='center', bold=True, width=2, height=1)
            printer.text(f"MESA {order['table_id']}\n")
            
            # Reset a tamaño normal y alinear izquierda
            printer.set(align='left', bold=False, width=1, height=1)
            
            # === INFORMACIÓN DEL PEDIDO ===
            now = datetime.now()
            printer.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
            printer.text(f"Hora: {now.strftime('%H:%M:%S')}\n")
            printer.text(f"ID Orden: {order['id']}\n")
            printer.text("=" * 32 + "\n")
            
            # === TÍTULO COMANDA ===
            printer.set(align='center')
            printer.text("COMANDA DE BEBIDAS\n")
            printer.set(align='left')
            printer.text("=" * 32 + "\n\n")
            
            # === PRODUCTOS ===
            printer.set(bold=True, width=2, height=1)
            for item in order_items:
                qty = item['quantity']
                name = item['menu_items']['name']
                printer.text(f"{qty}x {name}\n")
            
            printer.set(bold=False, width=1, height=1)
            
            # === NOTAS PARTICULARES ===
            if order.get('notes') and order['notes'].strip():
                printer.text("\n" + "-" * 32 + "\n")
                printer.set(bold=True, width=2, height=1)
                printer.text("NOTAS ESPECIALES:\n")
                printer.text(f"{order['notes']}\n")
                printer.set(bold=False, width=1, height=1)
                printer.text("-" * 32 + "\n")
            
            # === PIE ===
            printer.text("\n" + "=" * 32 + "\n")
            printer.set(align='center')
            printer.text("PREPARAR INMEDIATAMENTE\n")
            printer.set(align='left')
            printer.text("=" * 32 + "\n\n\n")
            
            printer.cut()
            
            print(f"[OK] Comanda de bebidas impresa: Mesa {order['table_id']}, Orden #{order['id']}")
            return True # Éxito, salir de la función
            
        except (USBNotFoundError, OSError) as e:
            print(f"[ERROR] Error de conexión en intento {attempt + 1}: {e}")
            if attempt == 0: # Si fue el primer intento fallido
                print("[+] Intentando reconectar en 3 segundos...")
                if printer:
                    try: printer.close()
                    except: pass
                
                time.sleep(3)
                if init_printer():
                    print("[OK] Reconexión exitosa. Reintentando imprimir...")
                    continue # Volver a intentar en el bucle
                else:
                    print("[ERROR] La reconexión falló.")
                    return False # Detener si la reconexión no funciona
            else:
                print("[ERROR] El reintento también falló.")
        except Exception as e:
            print(f"[ERROR] Error inesperado imprimiendo orden #{order['id']}: {e}")
            return False
            
    return False

def update_order_drink_status(supabase, order_id, status):
    """Actualiza solo el estado de impresión de bebidas en Supabase"""
    try:
        supabase.table("orders").update({"drink_printed": status}).eq("id", order_id).execute()
        return True
    except Exception as e:
        print(f"Error actualizando drink_printed para orden #{order_id}: {e}")
        return False

def get_order_items(supabase, order_id):
    """Obtiene los artículos de una orden"""
    try:
        response = supabase.table('order_items') \
            .select('quantity, menu_items(name)') \
            .eq('order_id', order_id) \
            .execute()
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo artículos de orden #{order_id}: {e}")
        return []

def process_new_orders(supabase):
    """Procesa órdenes nuevas que necesitan impresión de bebidas"""
    global last_checked_order_id
    
    try:
        # Buscar órdenes con status 'pending' que no han sido impresas en bebidas
        response = supabase.table("orders") \
            .select("*") \
            .eq("status", "pending") \
            .eq("drink_printed", False) \
            .gt("id", last_checked_order_id) \
            .order("id") \
            .execute()
        
        if not response.data:
            return  # No hay órdenes nuevas
        
        print(f"[INFO] Encontradas {len(response.data)} órdenes nuevas para imprimir bebidas")
        
        for order in response.data:
            order_id = order['id']
            
            # Obtener artículos de la orden
            order_items = get_order_items(supabase, order_id)
            if not order_items:
                print(f"[WARN] Orden #{order_id} no tiene artículos, saltando...")
                last_checked_order_id = order_id
                continue
            
            # Intentar imprimir comanda de bebidas
            if print_drink_ticket(order, order_items):
                # El endpoint se encarga de actualizar el estado.
                # Aquí solo marcamos la comanda como impresa para el servicio local.
                # Esto es importante para que no intente reimprimir en el siguiente ciclo.
                if update_order_drink_status(supabase, order_id, True):
                    print(f"[OK] Comanda de bebidas #{order_id} impresa por el servicio.")
                else:
                    print(f"[WARN] Orden #{order_id} impresa pero no se pudo actualizar estado")
            else:
                print(f"[ERROR] Error imprimiendo orden #{order_id}, se reintentará en el próximo ciclo")
            
            # Actualizar el último ID procesado para no volver a buscarlo
            last_checked_order_id = order_id
            
            # Pequeña pausa entre impresiones
            time.sleep(1)
            
    except Exception as e:
        print(f"❌ Error procesando órdenes nuevas: {e}")

def find_last_processed_order(supabase):
    """Encuentra la última orden procesada para evitar reimprimir"""
    try:
        # Buscar la orden más reciente (sin importar drink_printed)
        # para empezar desde ahí y solo procesar nuevas
        response = supabase.table("orders") \
            .select("id") \
            .order("id", desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            latest_id = response.data[0]['id']
            print(f"[INFO] Última orden en base de datos: {latest_id}")
            print("[INFO] Solo se procesarán órdenes NUEVAS a partir de ahora")
            return latest_id
        else:
            return 0
    except Exception as e:
        print(f"⚠️  Error buscando última orden procesada: {e}")
        return 0

def print_single_order(order_id):
    supabase = load_environment()
    if not init_printer():
        print("[ERROR] No se puede continuar sin impresora funcionando")
        return
    
    print(f"Buscando orden {order_id}...")
    response = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if not response.data:
        print(f"[ERROR] Orden {order_id} no encontrada")
        return
    order = response.data
    order_items = get_order_items(supabase, order_id)
    if not order_items:
        print(f"[ERROR] Orden {order_id} no tiene artículos")
        return
    print(f"Imprimiendo comanda de bebidas para orden {order_id}...")
    if print_drink_ticket(order, order_items):
        # La actualización de estado ahora la maneja el endpoint de la API
        print(f"[OK] Orden {order_id} impresa. El endpoint se encargará de actualizar el estado.")
    else:
        print(f"[ERROR] Error imprimiendo orden {order_id}")

def main():
    """Función principal del servicio"""
    global running, last_checked_order_id
    
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
    
    # Encontrar punto de inicio para evitar reimprimir órdenes
    last_checked_order_id = find_last_processed_order(supabase)
    print(f"[INFO] Iniciando monitoreo desde orden ID: {last_checked_order_id}")
    
    # Ciclo principal
    cycle_count = 0
    while running:
        try:
            cycle_count += 1
            
            # Mostrar estado cada 12 ciclos (1 minuto aprox)
            if cycle_count % 12 == 1:
                print(f"[INFO] Monitoreo activo - {datetime.now().strftime('%H:%M:%S')}")
            
            # Procesar órdenes nuevas
            process_new_orders(supabase)
            
            # Pausa antes del próximo ciclo
            time.sleep(5)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"[ERROR] Error en ciclo principal: {e}")
            print("[INFO] Reintentando en 10 segundos...")
            time.sleep(10)
    
    print("[INFO] Servicio de impresión detenido")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--print-order", type=int, help="ID de la orden a imprimir")
    args = parser.parse_args()

    if args.print_order:
        print_single_order(args.print_order)
    else:
        main() 
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
import json
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

def format_modifier_notes(notes):
    """
    Formatea las notas de modificadores para impresión legible.
    Convierte JSON como:
    {"selectedModifiers":{"Tipo de Preparación":["Con leche"],"Temperatura":["Frío"]},"original_notes":"prueba"}
    
    En texto legible:
    "Tipo de Preparación: Con leche, Temperatura: Frío\nprueba"
    """
    if not notes:
        return ""
    
    # Si no es JSON, devolver tal como está
    if not notes.strip().startswith('{'):
        return notes
    
    try:
        parsed_notes = json.loads(notes)
        formatted_parts = []
        
        # Procesar modificadores seleccionados
        if 'selectedModifiers' in parsed_notes:
            for group_name, modifiers in parsed_notes['selectedModifiers'].items():
                if modifiers:
                    formatted_parts.append(f"{group_name}: {', '.join(modifiers)}")
        
        # Agregar notas originales si existen
        if 'original_notes' in parsed_notes and parsed_notes['original_notes']:
            formatted_parts.append(parsed_notes['original_notes'])
        
        return '\n'.join(formatted_parts)
    except json.JSONDecodeError:
        return notes

def signal_handler(sig, frame):
    """Maneja la señal de interrupción para salida limpia"""
    global running
    print("\nRecibida señal de interrupción. Cerrando servicio...")
    running = False

def load_environment():
    """Carga variables de entorno de Supabase"""
    load_dotenv()
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("[ERROR] Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas")
        sys.exit(1)
    
    return create_client(supabase_url, supabase_key)

def test_printer():
    """Prueba la conexión con la impresora"""
    try:
        p = Usb(VENDOR_ID, PRODUCT_ID, profile="TM-T88V")
        p.text("Test de impresora - OK\n")
        p.cut()
        print(f"[OK] Impresora conectada correctamente")
        return True
    except (USBNotFoundError, DeviceNotFoundError) as e:
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
        p.text("SENDEROS\n")
        p.set(align='center', bold=False, width=1, height=1)
        p.text("RECIBO\n")
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
        
        # Imprimir items del pedido
        total_order = 0
        if 'order_items' in order and order['order_items']:
            for item in order['order_items']:
                menu_item = item.get('menu_items', {})
                item_name = menu_item.get('name', 'Producto desconocido') if menu_item else 'Producto desconocido'
                quantity = item.get('quantity', 1)
                price = item.get('price_at_order', 0)
                item_total = quantity * price
                total_order += item_total
                
                # Imprimir item principal
                p.set(bold=True)
                p.text(f"{quantity}x {item_name}\n")
                p.set(bold=False)
                p.text(f"    ${price:.2f} c/u = ${item_total:.2f}\n")
                
                # Imprimir notas del item si existen
                item_notes = item.get('notes')
                if item_notes:
                    formatted_notes = format_modifier_notes(item_notes)
                    if formatted_notes:
                        p.text(f"    Notas: {formatted_notes}\n")
        
        p.text("----------------------------------------\n")
        p.set(bold=True)
        p.text(f"TOTAL: ${total_order:.2f}\n")
        p.set(bold=False)
        
        # Imprimir notas generales del pedido si existen
        order_notes = order.get('notes')
        if order_notes:
            p.text("----------------------------------------\n")
            p.text(f"NOTAS DEL PEDIDO:\n{order_notes}\n")
        
        p.text("----------------------------------------\n")
        p.set(align='center')
        p.text("¡GRACIAS!\n")
        p.cut()
        
        print(f"[OK] Ticket impreso correctamente para pedido #{order['id']}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error imprimiendo pedido {order['id']}: {e}")
        return False

def print_single_order(order_id):
    """Imprime una orden específica por ID"""
    try:
        response = supabase.table('orders').select('*, order_items(*, menu_items(*))').eq('id', order_id).single().execute()
        if response.data:
            return print_kitchen_ticket(response.data)
        else:
            print(f"[ERROR] Orden {order_id} no encontrada")
            return False
    except Exception as e:
        print(f"[ERROR] Error obteniendo orden {order_id}: {e}")
        return False

def process_new_orders():
    global supabase
    if not supabase:
        supabase = load_environment()
    print("[INFO] Iniciando el servicio de impresión de recibos para SENDEROS...")
    
    # ID del restaurante Senderos
    senderos_restaurant_id = 'b333ede7-f67e-43d6-8652-9a918737d6e3'
    print(f"[INFO] Monitoreando pedidos del restaurante Senderos: {senderos_restaurant_id}")
    
    while running:
        try:
            # Buscar pedidos que no estén impresos (sistema simplificado)
            # Filtrar solo pedidos del restaurante Senderos
            response = supabase.table('orders').select('*, notes, order_items(*, notes, menu_items(*))').eq('kitchen_printed', False).eq('restaurant_id', senderos_restaurant_id).order('id').execute()
            
            new_orders = response.data
            
            if new_orders:
                print(f"[+] Se encontraron {len(new_orders)} pedidos para imprimir.")
                for order in new_orders:
                    # Solo imprimir pedidos pendientes o en proceso
                    if order['status'] in ['pending', 'in_progress']:
                        if print_kitchen_ticket(order):
                            print(f"[INFO] Marcando pedido #{order['id']} como impreso...")
                            
                            # Actualizar ambos campos para simplificar (una sola impresora)
                            update_response = supabase.table('orders').update({
                                'kitchen_printed': True,
                                'drink_printed': True,
                                'status': 'in_progress'
                            }).eq('id', order['id']).execute()

                            if update_response.data:
                                print(f"[OK] Pedido #{order['id']} impreso y movido a 'En Proceso'.")
                            else:
                                print(f"[ERROR] FALLO AL ACTUALIZAR la base de datos para el pedido #{order['id']}. Respuesta: {update_response}")
                        else:
                            print(f"[ERROR] No se marcará el pedido #{order['id']} como impreso debido a un fallo de impresión.")
            else:
                print("[INFO] Buscando nuevos pedidos...      ", end='\r')

        except Exception as e:
            print(f"\n[ERROR] Ocurrió un error en el bucle principal: {e}")
            print("[WARN] Esperando 60 segundos antes de reintentar para evitar spam de errores.")
            time.sleep(60)
        
        time.sleep(10)

def main():
    """Función principal del servicio"""
    global running, supabase
    
    # Configurar manejo de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("[INFO] === SERVICIO DE IMPRESIÓN SENDEROS ===")
    print("[INFO] Star Micronics BSC10 (USB 0519:000b)")
    print("[INFO] Impresión con precios - Una sola impresora")
    print("[INFO] Sistema simplificado sin print_jobs")
    
    # Cargar configuración
    supabase = load_environment()
    print("[OK] Conectado a Supabase")
    
    # Probar impresora
    if not test_printer():
        print("[ERROR] No se puede continuar sin impresora funcionando")
        sys.exit(1)
    
    # Sistema simplificado para una sola impresora
    print("[INFO] Iniciando monitoreo de pedidos para SENDEROS.")
    
    # Procesar órdenes (bucle infinito)
    process_new_orders()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--print-order", type=int, help="ID de la orden a imprimir")
    args = parser.parse_args()
    
    if args.print_order:
        # Imprimir una orden específica
        supabase = load_environment()
        print_single_order(args.print_order)
    else:
        # Ejecutar el servicio completo
        main() 
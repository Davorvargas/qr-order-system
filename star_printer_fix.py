#!/usr/bin/env python3
"""
COMPREHENSIVE FIX for Star Micronics Empty Ticket Issues
Addresses all identified root causes for Senderos printer problems
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
printer_connection = None

def signal_handler(sig, frame):
    """Maneja la señal de interrupción para salida limpia"""
    global running, printer_connection
    print("\nRecibida señal de interrupción. Cerrando servicio...")
    running = False
    if printer_connection:
        try:
            printer_connection.close()
        except:
            pass

def load_environment():
    """Carga variables de entorno de Supabase"""
    load_dotenv('.env.local')
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("[ERROR] Variables de entorno de Supabase no encontradas")
        sys.exit(1)
    
    return create_client(url, key)

def get_printer_connection():
    """Obtiene una conexión persistente a la impresora con el perfil correcto"""
    global printer_connection
    
    if printer_connection:
        return printer_connection
    
    try:
        # FIX 1: Usar perfil 'default' en lugar de 'TM-T88V' para Star Micronics
        printer_connection = Usb(VENDOR_ID, PRODUCT_ID, profile="default")
        print("[OK] Conexión a impresora Star Micronics establecida con perfil correcto")
        return printer_connection
    except (USBNotFoundError, DeviceNotFoundError) as e:
        print(f"[ERROR] Error de conexión con impresora Star Micronics: {e}")
        return None

def validate_order_data(order):
    """
    FIX 2: Validar integridad de datos antes de imprimir
    Retorna True si el pedido es válido para imprimir
    """
    if not order:
        print("[WARN] Pedido vacío - saltando impresión")
        return False
    
    if not order.get('id'):
        print("[WARN] Pedido sin ID - saltando impresión")
        return False
    
    order_items = order.get('order_items', [])
    if not order_items or len(order_items) == 0:
        print(f"[WARN] Pedido #{order.get('id')} sin items - saltando impresión")
        return False
    
    # Verificar que al menos un item tenga datos válidos
    valid_items = 0
    for item in order_items:
        if item.get('quantity', 0) > 0:
            menu_item = item.get('menu_items', {})
            if menu_item and menu_item.get('name'):
                valid_items += 1
            elif item.get('notes', '').find('custom_product') > -1:
                valid_items += 1
    
    if valid_items == 0:
        print(f"[WARN] Pedido #{order.get('id')} sin items válidos - saltando impresión")
        return False
    
    print(f"[OK] Pedido #{order.get('id')} validado - {valid_items} items válidos")
    return True

def format_modifier_notes(notes):
    """Formatea las notas de modificadores para impresión legible"""
    if not notes:
        return ""
    
    if not notes.strip().startswith('{'):
        return notes
    
    try:
        parsed_notes = json.loads(notes)
        formatted_parts = []
        
        if 'selectedModifiers' in parsed_notes:
            modifiers = parsed_notes['selectedModifiers']
            for group_name, selections in modifiers.items():
                if selections:
                    selections_str = ', '.join(selections)
                    formatted_parts.append(f"{group_name}: {selections_str}")
        
        if 'original_notes' in parsed_notes and parsed_notes['original_notes'].strip():
            formatted_parts.append(parsed_notes['original_notes'])
        
        return '\n'.join(formatted_parts)
    except (json.JSONDecodeError, KeyError, TypeError):
        return notes

def print_kitchen_ticket_fixed(order):
    """
    FIX 3: Versión mejorada de print_kitchen_ticket con mejor manejo de errores
    """
    print(f"[DEBUG] Iniciando impresión para pedido #{order.get('id')}")
    
    # FIX 2: Validar datos antes de proceder
    if not validate_order_data(order):
        return False
    
    try:
        # FIX 1: Usar conexión persistente con perfil correcto
        p = get_printer_connection()
        if not p:
            print(f"[ERROR] No se pudo conectar a la impresora")
            return False
        
        # Buscar el número de mesa real
        table_id = order.get('table_id')
        table_number = None
        if table_id:
            table_resp = supabase.table('tables').select('table_number').eq('id', table_id).single().execute()
            if table_resp.data and 'table_number' in table_resp.data:
                table_number = table_resp.data['table_number']
        mesa_str = table_number if table_number else 'Mesa desconocida'

        # Header del ticket
        p.set(align='center', bold=True, width=2, height=2)
        p.text("SENDEROS\n")
        p.set(align='center', bold=False, width=1, height=1)
        p.text("RECIBO\n")
        p.set(align='left', bold=False, width=1, height=1)
        p.text("----------------------------------------\n")
        
        # Información del pedido
        p.set(bold=True)
        p.text(f"Pedido #{order['id']} - Mesa: {mesa_str}\n")
        p.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
        
        # Fecha y hora
        order_time = order.get('created_at')
        if order_time:
            try:
                from dateutil import parser
                dt = parser.parse(order_time) if isinstance(order_time, str) else order_time
                order_time_str = dt.strftime('%d/%m/%Y %H:%M:%S')
            except Exception:
                order_time_str = str(order_time)
        else:
            order_time_str = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        p.text(f"Fecha: {order_time_str}\n")
        p.set(bold=False)
        p.text("----------------------------------------\n")

        # Imprimir items validados
        total_order = 0
        order_items = order.get('order_items', [])
        items_printed = 0
        
        for item in order_items:
            quantity = item.get('quantity', 0)
            if quantity <= 0:
                continue
            
            # Obtener nombre del producto
            menu_item = item.get('menu_items', {})
            if menu_item and menu_item.get('name'):
                item_name = menu_item.get('name')
            else:
                # Producto personalizado
                item_notes = item.get('notes', '')
                if item_notes and item_notes.startswith('{'):
                    try:
                        parsed_notes = json.loads(item_notes)
                        if parsed_notes.get('type') == 'custom_product':
                            item_name = parsed_notes.get('name', 'Producto Especial')
                        else:
                            item_name = 'Producto Especial'
                    except:
                        item_name = 'Producto Especial'
                else:
                    item_name = 'Producto Especial'
            
            price_per_unit = item.get('price_at_order', 0) or menu_item.get('price', 0) or 0
            item_total = price_per_unit * quantity
            total_order += item_total
            items_printed += 1
            
            # Línea del producto con precio
            p.set(width=1, height=1, bold=True)
            p.text(f"{quantity}x {item_name}\n")
            p.set(width=1, height=1, bold=False)
            p.text(f"    Bs. {price_per_unit:.2f} c/u = Bs. {item_total:.2f}\n")

            # Notas por ítem
            item_notes = item.get('notes')
            if item_notes:
                formatted_notes = format_modifier_notes(item_notes)
                if formatted_notes:
                    p.set(width=1, height=1, bold=False, align='left')
                    p.text(f"  >> {formatted_notes}\n")

        # Verificar que se imprimieron items
        if items_printed == 0:
            print(f"[ERROR] No se imprimieron items para el pedido #{order['id']}")
            return False

        # Nota global del pedido
        global_notes = order.get('notes')
        if global_notes:
            formatted_global_notes = format_modifier_notes(global_notes)
            if formatted_global_notes:
                p.set(width=1, height=1, bold=True, align='left')
                p.text("\n--- Nota del pedido ---\n")
                p.set(width=1, height=1, bold=False, align='left')
                p.text(f"{formatted_global_notes}\n")

        # Total
        p.text("----------------------------------------\n")
        p.set(width=2, height=2, bold=True, align='center')
        p.text(f"TOTAL: Bs. {total_order:.2f}\n")
        p.set(width=1, height=1, bold=False, align='left')
        p.text("----------------------------------------\n")
        
        # Footer
        p.set(align='center', bold=False)
        p.text("Gracias por su visita\n")
        p.text("SENDEROS\n")

        p.text("\n\n")
        p.cut()
        
        print(f"[OK] Ticket impreso exitosamente - Pedido #{order['id']}, {items_printed} items, Total: Bs. {total_order:.2f}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error al imprimir pedido #{order.get('id')}: {e}")
        # FIX 3: Reset conexión en caso de error
        global printer_connection
        printer_connection = None
        return False

def process_new_orders_fixed():
    """
    FIX 4: Versión mejorada del procesamiento de órdenes
    """
    global supabase
    if not supabase:
        supabase = load_environment()
    
    print("[INFO] Servicio de impresión MEJORADO para SENDEROS iniciado")
    
    senderos_restaurant_id = 'b333ede7-f67e-43d6-8652-9a918737d6e3'
    print(f"[INFO] Monitoreando pedidos del restaurante: {senderos_restaurant_id}")
    
    consecutive_errors = 0
    max_consecutive_errors = 5
    
    while running:
        try:
            # Buscar pedidos no impresos
            response = supabase.table('orders').select(
                '*, notes, order_items(*, notes, menu_items(*))'
            ).eq('kitchen_printed', False).eq(
                'restaurant_id', senderos_restaurant_id
            ).order('id').execute()
            
            new_orders = response.data
            
            if new_orders:
                print(f"[+] Encontrados {len(new_orders)} pedidos para procesar")
                for order in new_orders:
                    if order['status'] in ['pending', 'in_progress']:
                        success = print_kitchen_ticket_fixed(order)
                        
                        if success:
                            # Marcar como impreso
                            update_response = supabase.table('orders').update({
                                'kitchen_printed': True,
                                'drink_printed': True,
                                'status': 'in_progress'
                            }).eq('id', order['id']).execute()
                            
                            if update_response.data:
                                print(f"[OK] Pedido #{order['id']} marcado como impreso")
                                consecutive_errors = 0  # Reset error counter
                            else:
                                print(f"[ERROR] Fallo al actualizar BD para pedido #{order['id']}")
                        else:
                            print(f"[ERROR] Fallo de impresión para pedido #{order['id']}")
                            consecutive_errors += 1
                            
                            if consecutive_errors >= max_consecutive_errors:
                                print(f"[CRITICAL] {consecutive_errors} errores consecutivos - reiniciando conexión")
                                global printer_connection
                                printer_connection = None
                                consecutive_errors = 0
                                time.sleep(30)  # Pausa más larga
            else:
                print("[INFO] Buscando nuevos pedidos...", end='\r')
                consecutive_errors = 0

        except Exception as e:
            print(f"\n[ERROR] Error en bucle principal: {e}")
            consecutive_errors += 1
            sleep_time = min(60, 10 * consecutive_errors)  # Backoff exponencial
            print(f"[WARN] Esperando {sleep_time}s antes de reintentar")
            time.sleep(sleep_time)
        
        time.sleep(10)

def main():
    """Función principal mejorada"""
    global running, supabase
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("[INFO] === SERVICIO DE IMPRESIÓN SENDEROS - VERSIÓN CORREGIDA ===")
    print("[INFO] Star Micronics BSC10 con perfil correcto")
    print("[INFO] Validación de datos mejorada")
    print("[INFO] Manejo de errores robusto")
    
    supabase = load_environment()
    print("[OK] Conectado a Supabase")
    
    # Probar conexión inicial
    if not get_printer_connection():
        print("[ERROR] No se puede continuar sin impresora funcionando")
        sys.exit(1)
    
    print("[INFO] Iniciando monitoreo mejorado...")
    process_new_orders_fixed()

if __name__ == "__main__":
    main()

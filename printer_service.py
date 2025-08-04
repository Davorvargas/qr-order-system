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
        
        # Manejar notas de modificadores
        if 'selectedModifiers' in parsed_notes:
            modifier_lines = []
            for group, options in parsed_notes['selectedModifiers'].items():
                if isinstance(options, list) and options:
                    modifier_lines.append(f"{group}: {'/'.join(options)}")
            
            modifier_text = ", ".join(modifier_lines)
            
            # Agregar notas originales si existen
            if parsed_notes.get('original_notes'):
                return f"{modifier_text}\n{parsed_notes['original_notes']}"
            
            return modifier_text
        
        # Manejar productos especiales
        if parsed_notes.get('type') == 'custom_product' and parsed_notes.get('original_notes'):
            return parsed_notes['original_notes']
        
        # Manejar otras notas con original_notes
        if parsed_notes.get('original_notes'):
            return parsed_notes['original_notes']
        
        # Si no podemos parsear la estructura, devolver el JSON original
        return notes
        
    except (json.JSONDecodeError, KeyError, TypeError):
        # Si falla el parsing, devolver las notas tal como están
        return notes

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

        # Imprimir platos (order_items) con precios
        total_order = 0
        for item in order.get('order_items', []):
            print(f"[DEBUG] Item de orden: {item}")
            quantity = item.get('quantity', 0)
            item_name = item.get('menu_items', {}).get('name', 'Producto no encontrado')
            price_per_unit = item.get('price_at_order', 0) or item.get('menu_items', {}).get('price', 0) or 0
            item_total = price_per_unit * quantity
            total_order += item_total
            
            # Línea del producto con precio
            p.set(width=1, height=1, bold=True)
            p.text(f"{quantity}x {item_name}\n")
            p.set(width=1, height=1, bold=False)
            p.text(f"    Bs. {price_per_unit:.2f} c/u = Bs. {item_total:.2f}\n")

            # Notas por ítem (formateadas para legibilidad)
            item_notes = item.get('notes')
            if item_notes:
                formatted_notes = format_modifier_notes(item_notes)
                if formatted_notes:
                    p.set(width=1, height=1, bold=False, align='left')
                    p.text(f"  >> {formatted_notes}\n")

        # Imprimir nota global si existe (formateada)
        global_notes = order.get('notes')
        if global_notes:
            formatted_global_notes = format_modifier_notes(global_notes)
            if formatted_global_notes:
                p.set(width=1, height=1, bold=True, align='left')
                p.text("\n--- Nota del pedido ---\n")
                p.set(width=1, height=1, bold=False, align='left')
                p.text(f"{formatted_global_notes}\n")

        # Imprimir total
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
        p.close()
        print(f"[OK] Recibo con precios para el pedido #{order['id']} impreso correctamente.")
        return True
    except Exception as e:
        print(f"[ERROR] No se pudo imprimir el recibo para el pedido #{order['id']}: {e}")
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

def print_cash_register_report(report_data):
    """Imprime un reporte de cierre de caja en formato 80mm."""
    try:
        print(f"[DEBUG] Imprimiendo reporte de cierre de caja: {report_data}")
        p = Usb(VENDOR_ID, PRODUCT_ID, profile="TM-T88V")

        # Header
        p.set(align='center', bold=True, width=2, height=2)
        p.text("SENDEROS\n")
        p.set(align='center', bold=False, width=1, height=1)
        p.text("REPORTE DE CIERRE\n")
        p.set(align='left', bold=False, width=1, height=1)
        p.text("----------------------------------------\n")
        
        # Información general
        p.set(bold=True)
        p.text(f"Cajero: {report_data.get('cashierName', 'N/A')}\n")
        p.set(bold=False)
        
        # Fechas
        opening_time = report_data.get('openingTime')
        closing_time = report_data.get('closingTime')
        if opening_time:
            try:
                from dateutil import parser
                dt = parser.parse(opening_time) if isinstance(opening_time, str) else opening_time
                opening_str = dt.strftime('%d/%m/%Y %H:%M')
            except Exception:
                opening_str = str(opening_time)
        else:
            opening_str = "N/A"
            
        if closing_time:
            try:
                from dateutil import parser
                dt = parser.parse(closing_time) if isinstance(closing_time, str) else closing_time
                closing_str = dt.strftime('%d/%m/%Y %H:%M')
            except Exception:
                closing_str = str(closing_time)
        else:
            closing_str = "N/A"
            
        p.text(f"Apertura: {opening_str}\n")
        p.text(f"Cierre: {closing_str}\n")
        p.text("----------------------------------------\n")
        
        # Resumen de ventas
        p.set(bold=True)
        p.text("RESUMEN DE VENTAS\n")
        p.set(bold=False)
        p.text(f"Ventas Totales: Bs {report_data.get('totalSales', 0):.2f}\n")
        
        # Solo mostrar estadísticas si no es histórico
        if not report_data.get('isHistorical', False):
            p.text(f"Transacciones: {report_data.get('transactionCount', 0)}\n")
            p.text(f"Pedidos Completados: {report_data.get('completedOrders', 0)}\n")
            p.text(f"Pedidos Cancelados: {report_data.get('cancelledOrders', 0)}\n")
        else:
            p.text("Transacciones: N/A\n")
            p.text("Pedidos Completados: N/A\n")
            p.text("Pedidos Cancelados: N/A\n")
        
        p.text("----------------------------------------\n")
        
        # Desglose por método de pago
        p.set(bold=True)
        p.text("DESGLOSE POR PAGO\n")
        p.set(bold=False)
        p.text(f"Efectivo: Bs {report_data.get('totalCash', 0):.2f}\n")
        p.text(f"QR: Bs {report_data.get('totalQr', 0):.2f}\n")
        p.text(f"Tarjeta: Bs {report_data.get('totalCard', 0):.2f}\n")
        p.text("----------------------------------------\n")
        
        # Control de efectivo
        p.set(bold=True)
        p.text("CONTROL DE EFECTIVO\n")
        p.set(bold=False)
        p.text(f"Apertura: Bs {report_data.get('openingAmount', 0):.2f}\n")
        p.text(f"Ventas Efectivo: Bs {report_data.get('totalCash', 0):.2f}\n")
        p.text(f"Esperado: Bs {report_data.get('expectedCash', 0):.2f}\n")
        p.text(f"Real: Bs {report_data.get('actualCash', 0):.2f}\n")
        
        # Diferencia
        difference = report_data.get('difference', 0)
        p.set(bold=True)
        if difference >= 0:
            p.text(f"DIFERENCIA: +Bs {difference:.2f}\n")
        else:
            p.text(f"DIFERENCIA: -Bs {abs(difference):.2f}\n")
        p.set(bold=False)
        
        p.text("----------------------------------------\n")
        
        # Footer
        p.set(align='center', bold=False)
        p.text("Reporte generado automáticamente\n")
        p.text("Sistema QR Order\n")
        
        if report_data.get('isHistorical', False):
            p.text("⚠️ REPORTE HISTÓRICO\n")
            p.text("Datos limitados\n")
        
        p.text("\n\n")
        p.cut()
        p.close()
        print(f"[OK] Reporte de cierre de caja impreso correctamente.")
        return True
    except Exception as e:
        print(f"[ERROR] No se pudo imprimir el reporte de cierre de caja: {e}")
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
            # Procesar reportes de cierre de caja primero (prioridad alta)
            print_jobs_response = supabase.table('print_jobs').select('*').eq('status', 'pending').eq('job_type', 'cash_register_report').order('created_at').execute()
            
            if print_jobs_response.data:
                print(f"[+] Se encontraron {len(print_jobs_response.data)} reportes de cierre de caja para imprimir.")
                for job in print_jobs_response.data:
                    if print_cash_register_report(job['data']):
                        # Marcar como completado
                        update_response = supabase.table('print_jobs').update({
                            'status': 'completed',
                            'completed_at': datetime.now().isoformat()
                        }).eq('id', job['id']).execute()
                        
                        if update_response.data:
                            print(f"[OK] Reporte de cierre de caja procesado y marcado como completado.")
                        else:
                            print(f"[ERROR] No se pudo marcar el reporte como completado.")
                    else:
                        # Marcar como fallido
                        update_response = supabase.table('print_jobs').update({
                            'status': 'failed',
                            'error_message': 'Error de impresión'
                        }).eq('id', job['id']).execute()
                        print(f"[ERROR] Reporte de cierre de caja falló y fue marcado como fallido.")
            
            # Buscar pedidos que no estén impresos (sistema de una sola impresora)
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
                print("[INFO] Buscando nuevos pedidos y reportes...      ", end='\r')

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
    
    print("[INFO] === SERVICIO DE IMPRESIÓN SENDEROS ===")
    print("[INFO] Star Micronics BSC10 (USB 0519:000b)")
    print("[INFO] Impresión con precios - Una sola impresora")
    print("[INFO] Manejo de pedidos y reportes de cierre de caja")
    
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
        print_single_order(args.print_order)
    else:
        main() 
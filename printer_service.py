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
last_checked_order_id = 0

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

def test_printer():
    """Prueba la conexión con la impresora"""
    try:
        printer = Usb(VENDOR_ID, PRODUCT_ID, profile="default")
        # Comando de reset simple para verificar comunicación
        printer._raw(b'\x1b\x40')
        printer.close()
        print("✅ Impresora detectada y funcionando correctamente")
        return True
    except (USBNotFoundError, DeviceNotFoundError):
        print("❌ Error: Impresora no encontrada (USB 0519:000b)")
        print("   Verifica que la impresora esté conectada y encendida")
        return False
    except Exception as e:
        print(f"❌ Error de conexión con impresora: {e}")
        return False

def print_kitchen_ticket(order, order_items):
    """
    Imprime una comanda de cocina en formato normal
    Con doble ancho solo para mesa, items y notas especiales
    """
    printer = None
    try:
        # Crear conexión
        printer = Usb(VENDOR_ID, PRODUCT_ID, profile="default")
        
        # Reset de impresora (ESC @)
        printer._raw(b'\x1b\x40')
        
        # Configurar codificación para caracteres especiales
        printer.charcode('CP850')
        
        # === ENCABEZADO MESA ===
        # Centrar texto (ESC a 1)
        printer._raw(b'\x1b\x61\x01')
        # Doble ancho solo para mesa (GS ! 16)
        printer._raw(b'\x1d\x21\x10')
        printer.text(f"MESA {order['table_id']}\n")
        
        # Reset a tamaño normal (GS ! 0)
        printer._raw(b'\x1d\x21\x00')
        # Alinear izquierda (ESC a 0)
        printer._raw(b'\x1b\x61\x00')
        
        # === INFORMACIÓN DEL PEDIDO ===
        now = datetime.now()
        printer.text(f"Cliente: {order.get('customer_name', 'N/A')}\n")
        printer.text(f"Hora: {now.strftime('%H:%M:%S')}\n")
        printer.text(f"ID Orden: {order['id']}\n")
        
        # Línea separadora
        printer.text("=" * 32 + "\n")
        
        # === TÍTULO COMANDA ===
        # Centrar (ESC a 1)
        printer._raw(b'\x1b\x61\x01')
        printer.text("COMANDA DE COCINA\n")
        
        # Alinear izquierda
        printer._raw(b'\x1b\x61\x00')
        printer.text("=" * 32 + "\n\n")
        
        # === PRODUCTOS ===
        # Doble ancho para items (GS ! 16)
        printer._raw(b'\x1d\x21\x10')
        for item in order_items:
            qty = item['quantity']
            name = item['menu_items']['name']
            printer.text(f"{qty}x {name}\n")
        
        # Reset a tamaño normal (GS ! 0)
        printer._raw(b'\x1d\x21\x00')
        
        # === NOTAS PARTICULARES ===
        if order.get('notes') and order['notes'].strip():
            printer.text("\n")
            printer.text("-" * 32 + "\n")
            printer._raw(b'\x1d\x21\x10')
            printer.text("NOTAS ESPECIALES:\n")
            printer.text(f"{order['notes']}\n")
            
            # Reset a tamaño normal (GS ! 0)
            printer._raw(b'\x1d\x21\x00')
            printer.text("-" * 32 + "\n")
        
        # === PIE ===
        printer.text("\n" + "=" * 32 + "\n")
        
        # Centrar (ESC a 1)
        printer._raw(b'\x1b\x61\x01')
        printer.text("PREPARAR INMEDIATAMENTE\n")
        
        # Alinear izquierda
        printer._raw(b'\x1b\x61\x00')
        printer.text("=" * 32 + "\n\n\n")
        
        # Corte de papel
        printer.cut()
        
        print(f"Comanda impresa: Mesa {order['table_id']}, Orden #{order['id']}")
        return True
        
    except Exception as e:
        print(f"❌ Error imprimiendo orden #{order['id']}: {e}")
        return False
    finally:
        if printer:
            try:
                printer.close()
            except:
                pass

def update_order_status(supabase, order_id, new_status):
    """Actualiza el estado de una orden en Supabase"""
    try:
        response = supabase.table("orders").update({"status": new_status}).eq("id", order_id).execute()
        print(f"Respuesta de Supabase al actualizar estado: {response}")
        if hasattr(response, "data") and response.data:
            print(f"Estado actualizado: Orden #{order_id} -> {new_status}")
            return True
        else:
            print(f"❌ No se pudo actualizar el estado de la orden #{order_id}. Respuesta: {response}")
            return False
    except Exception as e:
        print(f"Error actualizando estado de orden #{order_id}: {e}")
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
    """Procesa órdenes nuevas que necesitan impresión de comanda"""
    global last_checked_order_id
    
    try:
        # Buscar órdenes con status 'order_placed' más recientes que la última procesada
        response = supabase.table("orders") \
            .select("*") \
            .eq("status", "order_placed") \
            .gt("id", last_checked_order_id) \
            .order("id") \
            .execute()
        
        if not response.data:
            return  # No hay órdenes nuevas
        
        print(f"📋 Encontradas {len(response.data)} órdenes nuevas para imprimir")
        
        for order in response.data:
            order_id = order['id']
            
            # Obtener artículos de la orden
            order_items = get_order_items(supabase, order_id)
            if not order_items:
                print(f"⚠️  Orden #{order_id} no tiene artículos, saltando...")
                last_checked_order_id = order_id
                continue
            
            # Intentar imprimir comanda
            if print_kitchen_ticket(order, order_items):
                # Si la impresión fue exitosa, actualizar estado
                if update_order_status(supabase, order_id, "kitchen_printed"):
                    print(f"✅ Orden #{order_id} procesada completamente")
                else:
                    print(f"⚠️  Orden #{order_id} impresa pero no se pudo actualizar estado")
            else:
                print(f"❌ Error imprimiendo orden #{order_id}, se reintentará en el próximo ciclo")
            
            # Actualizar el último ID procesado solo si todo salió bien
            last_checked_order_id = order_id
            
            # Pequeña pausa entre impresiones
            time.sleep(1)
            
    except Exception as e:
        print(f"❌ Error procesando órdenes nuevas: {e}")

def find_last_processed_order(supabase):
    """Encuentra la última orden procesada para evitar reimprimir"""
    try:
        # Buscar la orden más reciente que NO esté en estado 'order_placed'
        response = supabase.table("orders") \
            .select("id") \
            .neq("status", "order_placed") \
            .order("id", desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            return response.data[0]['id']
        else:
            return 0
    except Exception as e:
        print(f"⚠️  Error buscando última orden procesada: {e}")
        return 0

def print_single_order(order_id):
    supabase = load_environment()
    print(f"Buscando orden {order_id}...")
    response = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if not response.data:
        print(f"❌ Orden {order_id} no encontrada")
        return
    order = response.data
    order_items = get_order_items(supabase, order_id)
    if not order_items:
        print(f"❌ Orden {order_id} no tiene artículos")
        return
    print(f"Imprimiendo comanda para orden {order_id}...")
    if print_kitchen_ticket(order, order_items):
        print(f"Intentando actualizar status a kitchen_printed para orden {order_id}...")
        if update_order_status(supabase, order_id, "kitchen_printed"):
            print(f"Orden {order_id} impresa y actualizada a kitchen_printed")
        else:
            print(f"⚠️  Orden {order_id} impresa pero no se pudo actualizar status")
    else:
        print(f"❌ Error imprimiendo orden {order_id}")

def main():
    """Función principal del servicio"""
    global running, last_checked_order_id
    
    # Configurar manejo de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("🖨️  === SERVICIO DE IMPRESIÓN SIMPLE ===")
    print("📡 Star Micronics BSC10 (USB 0519:000b)")
    print("🔄 Sin sistema de colas - Impresión directa")
    
    # Cargar configuración
    supabase = load_environment()
    print("✅ Conectado a Supabase")
    
    # Probar impresora
    if not test_printer():
        print("❌ No se puede continuar sin impresora funcionando")
        sys.exit(1)
    
    # Encontrar punto de inicio para evitar reimprimir órdenes
    last_checked_order_id = find_last_processed_order(supabase)
    print(f"🚀 Iniciando monitoreo desde orden ID: {last_checked_order_id}")
    
    # Ciclo principal
    cycle_count = 0
    while running:
        try:
            cycle_count += 1
            
            # Mostrar estado cada 12 ciclos (1 minuto aprox)
            if cycle_count % 12 == 1:
                print(f"⏰ Monitoreo activo - {datetime.now().strftime('%H:%M:%S')}")
            
            # Procesar órdenes nuevas
            process_new_orders(supabase)
            
            # Pausa antes del próximo ciclo
            time.sleep(5)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"❌ Error en ciclo principal: {e}")
            print("🔄 Reintentando en 10 segundos...")
            time.sleep(10)
    
    print("🛑 Servicio de impresión detenido")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--print-order", type=int, help="ID de la orden a imprimir")
    args = parser.parse_args()

    if args.print_order:
        print_single_order(args.print_order)
    else:
        main() 
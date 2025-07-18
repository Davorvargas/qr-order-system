#!/usr/bin/env python3
"""
Servicio de impresión para computadora (Xprinter XP-T80A)
Imprime solo pedidos nuevos, usando el campo drink_printed para evitar duplicados.
Inspirado en printer_service.py (Raspberry Pi)
"""

import requests
import time
import sys
from datetime import datetime
import platform

# CREDENCIALES DE SUPABASE (YA CONFIGURADAS):
SUPABASE_URL = "https://osvgapxefsqqhltkabku.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDMxMjUsImV4cCI6MjA2NjM3OTEyNX0.LFTPv0veT2nRBBzTgV5eWgjBn0D7GbUTAtAnD5lObcQ"

# VID y PID de la Xprinter XP-T80A
XPRINTER_VID = 0x0483
XPRINTER_PID = 0x5743

def encontrar_impresora():
    try:
        import usb.core
        dev = usb.core.find(idVendor=XPRINTER_VID, idProduct=XPRINTER_PID)
        if dev is not None:
            print(f"✅ Xprinter XP-T80A detectada correctamente (VID: {hex(XPRINTER_VID)}, PID: {hex(XPRINTER_PID)})")
            return dev
        print(f"❌ No se encontró la Xprinter XP-T80A (VID: {hex(XPRINTER_VID)}, PID: {hex(XPRINTER_PID)})")
        return None
    except ImportError:
        print("❌ Instala: pip install pyusb requests")
        return None
    except Exception as e:
        print(f"❌ Error buscando impresora: {e}")
        return None

def imprimir_ticket(order):
    try:
        import usb.core
        import usb.util
        impresora = usb.core.find(idVendor=XPRINTER_VID, idProduct=XPRINTER_PID)
        if impresora is None:
            print("❌ Impresora no encontrada al intentar imprimir")
            return False
        ESC = b'\x1B'
        GS = b'\x1D'
        ticket = ESC + b'@'
        ticket += ESC + b'a\x01' + GS + b'!\x10'
        ticket += f"MESA: {order['table_id']}\n".encode('utf-8')
        ticket += GS + b'!\x00'
        ticket += ESC + b'a\x00'
        ticket += f"Pedido #{order['id']}\n".encode('utf-8')
        ticket += f"Cliente: {order['customer_name']}\n".encode('utf-8')
        ticket += f"Hora: {datetime.now().strftime('%H:%M:%S')}\n".encode('utf-8')
        ticket += ("-" * 32 + "\n").encode('utf-8')
        for item in order.get('order_items', []):
            if item.get('menu_items'):
                nombre = item['menu_items']['name']
                cantidad = item['quantity']
                ticket += GS + b'!\x10'
                ticket += f"{cantidad}x {nombre}\n".encode('utf-8')
                ticket += GS + b'!\x00'
        if order.get('notes'):
            ticket += ("-" * 32 + "\n").encode('utf-8')
            ticket += GS + b'!\x10' + "NOTAS ESPECIALES\n".encode('utf-8')
            ticket += GS + b'!\x00' + f"{order['notes']}\n".encode('utf-8')
        ticket += ("-" * 32 + "\n").encode('utf-8')
        ticket += ESC + b'a\x01'
        ticket += f"Total: Bs {order.get('total_price', 0):.2f}\n".encode('utf-8')
        ticket += b'\n' * 3
        ticket += GS + b'V\x00'
        try:
            # Solo en Linux: liberar el driver del kernel si el método existe
            if platform.system() == "Linux":
                if hasattr(impresora, "is_kernel_driver_active") and impresora.is_kernel_driver_active(0):
                    if hasattr(impresora, "detach_kernel_driver"):
                        impresora.detach_kernel_driver(0)
            if hasattr(impresora, "set_configuration"):
                impresora.set_configuration()
            if hasattr(impresora, "get_active_configuration"):
                cfg = impresora.get_active_configuration()
            else:
                print("❌ No se pudo obtener la configuración activa de la impresora")
                return False
            intf = cfg[(0, 0)]
            out_ep = None
            for ep in intf:
                if usb.util.endpoint_direction(ep.bEndpointAddress) == usb.util.ENDPOINT_OUT:
                    out_ep = ep
                    break
            if out_ep is not None:
                out_ep.write(ticket)
                print(f"✅ Ticket impreso para pedido #{order['id']}")
                return True
            else:
                print("❌ No se encontró endpoint de salida")
                return False
        except Exception as e:
            print(f"❌ Error USB: {e}")
            return False
    except Exception as e:
        print(f"❌ Error imprimiendo: {e}")
        return False

def marcar_como_impreso(order_id):
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json'
        }
        url = f"{SUPABASE_URL}/rest/v1/orders"
        data = {'drink_printed': True}
        params = {'id': f'eq.{order_id}'}
        requests.patch(url, headers=headers, json=data, params=params)
    except Exception as e:
        print(f"❌ Error marcando como impreso: {e}")

def get_new_orders():
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json'
        }
        url = f"{SUPABASE_URL}/rest/v1/orders"
        params = {
            'select': '*,order_items(*,menu_items(*))',
            'drink_printed': 'eq.false',
            'order': 'id.asc',
            'limit': 10
        }
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error en Supabase: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error verificando pedidos: {e}")
        return []

def main():
    print("🖨️ Iniciando servicio de impresión para computadora...")
    impresora = encontrar_impresora()
    if not impresora:
        input("Presiona Enter para salir...")
        return
    print("✅ Todo listo. Monitoreando pedidos nuevos...")
    try:
        while True:
            orders = get_new_orders()
            if not orders:
                time.sleep(5)
                continue
            for order in orders:
                if imprimir_ticket(order):
                    marcar_como_impreso(order['id'])
                time.sleep(1)
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n🛑 Servicio detenido")

if __name__ == "__main__":
    main() 
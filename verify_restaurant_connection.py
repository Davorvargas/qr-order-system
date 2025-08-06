#!/usr/bin/env python3
"""
Script para verificar la conexión al WiFi del restaurante
y probar la conectividad con Supabase
"""

import subprocess
import time
import requests
import json
from supabase import create_client, Client

# Configuración de Supabase
SUPABASE_URL = "https://osvgapxefsqqhltkabku.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc"
RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"

def run_command(command, description=""):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n🔧 {description}")
    print(f"Comando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Éxito: {result.stdout}")
            return True, result.stdout
        else:
            print(f"❌ Error: {result.stderr}")
            return False, result.stderr
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False, str(e)

def check_wifi_connection():
    """Verifica la conexión WiFi actual"""
    print("\n📡 VERIFICANDO CONEXIÓN WIFI")
    print("=" * 40)
    
    # Verificar red actual
    success, output = run_command("iwgetid", "Red WiFi actual")
    if success:
        print(f"📶 Conectado a: {output.strip()}")
    
    # Verificar IP
    success, output = run_command("hostname -I", "Dirección IP")
    if success:
        print(f"🌐 IP: {output.strip()}")
    
    # Verificar conectividad básica
    success, _ = run_command("ping -c 3 8.8.8.8", "Conectividad a Internet")
    if success:
        print("✅ Conexión a Internet funcionando")
        return True
    else:
        print("❌ No hay conexión a Internet")
        return False

def check_supabase_connection():
    """Verifica la conexión a Supabase"""
    print("\n☁️  VERIFICANDO CONEXIÓN A SUPABASE")
    print("=" * 40)
    
    try:
        # Crear cliente Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Probar conexión consultando restaurantes
        response = supabase.table("restaurants").select("id, name").eq("id", RESTAURANT_ID).execute()
        
        if response.data:
            restaurant = response.data[0]
            print(f"✅ Conexión a Supabase exitosa")
            print(f"🏪 Restaurante: {restaurant['name']}")
            print(f"🆔 ID: {restaurant['id']}")
            return True
        else:
            print("❌ No se encontró el restaurante en Supabase")
            return False
            
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {e}")
        return False

def check_printer_status():
    """Verifica el estado de la impresora en Supabase"""
    print("\n🖨️  VERIFICANDO ESTADO DE IMPRESORA")
    print("=" * 40)
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Consultar impresora de cocina
        response = supabase.table("printers").select("*").eq("restaurant_id", RESTAURANT_ID).eq("type", "kitchen").execute()
        
        if response.data:
            printer = response.data[0]
            status = "🟢 ACTIVA" if printer['is_active'] else "🔴 INACTIVA"
            print(f"📋 Impresora: {printer['name']}")
            print(f"🏷️  Tipo: {printer['type']}")
            print(f"📊 Estado: {status}")
            print(f"🌐 IP: {printer.get('ip_address', 'N/A')}")
            return printer['is_active']
        else:
            print("❌ No se encontró impresora de cocina configurada")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando impresora: {e}")
        return False

def test_printer_service():
    """Prueba el servicio de impresora"""
    print("\n🧪 PROBANDO SERVICIO DE IMPRESORA")
    print("=" * 40)
    
    # Verificar si el archivo existe
    success, _ = run_command("ls -la printer_service.py", "Verificando archivo del servicio")
    if not success:
        print("❌ Archivo printer_service.py no encontrado")
        return False
    
    # Verificar dependencias
    try:
        import escpos
        print("✅ Biblioteca escpos disponible")
    except ImportError:
        print("❌ Biblioteca escpos no disponible")
        print("Instala con: pip3 install python-escpos")
        return False
    
    try:
        import supabase
        print("✅ Biblioteca supabase disponible")
    except ImportError:
        print("❌ Biblioteca supabase no disponible")
        print("Instala con: pip3 install supabase")
        return False
    
    print("✅ Todas las dependencias están disponibles")
    return True

def show_network_info():
    """Muestra información detallada de la red"""
    print("\n📊 INFORMACIÓN DETALLADA DE RED")
    print("=" * 40)
    
    commands = [
        ("iwconfig", "Configuración WiFi"),
        ("ip route", "Tabla de rutas"),
        ("cat /etc/resolv.conf", "Servidores DNS"),
        ("systemctl status wpa_supplicant", "Estado wpa_supplicant"),
        ("systemctl status dhcpcd", "Estado dhcpcd")
    ]
    
    for command, description in commands:
        run_command(command, description)

def main():
    """Función principal"""
    print("🏪 VERIFICADOR DE CONEXIÓN AL RESTAURANTE")
    print("=" * 50)
    
    # Verificar conexión WiFi
    wifi_ok = check_wifi_connection()
    
    if not wifi_ok:
        print("\n❌ PROBLEMA: No hay conexión a Internet")
        print("📝 SOLUCIONES:")
        print("1. Verifica que el WiFi del restaurante esté funcionando")
        print("2. Verifica la contraseña del WiFi")
        print("3. Ejecuta: sudo python3 wifi_config_restaurant.py")
        return
    
    # Verificar conexión a Supabase
    supabase_ok = check_supabase_connection()
    
    if not supabase_ok:
        print("\n❌ PROBLEMA: No se puede conectar a Supabase")
        print("📝 POSIBLES CAUSAS:")
        print("1. Problema de conectividad a Internet")
        print("2. Firewall bloqueando la conexión")
        print("3. Configuración incorrecta de Supabase")
        return
    
    # Verificar estado de impresora
    printer_active = check_printer_status()
    
    # Probar servicio de impresora
    service_ok = test_printer_service()
    
    # Mostrar información detallada
    show_network_info()
    
    # Resumen final
    print("\n📋 RESUMEN DE VERIFICACIÓN")
    print("=" * 40)
    print(f"📡 WiFi: {'✅ OK' if wifi_ok else '❌ ERROR'}")
    print(f"☁️  Supabase: {'✅ OK' if supabase_ok else '❌ ERROR'}")
    print(f"🖨️  Impresora: {'✅ ACTIVA' if printer_active else '❌ INACTIVA'}")
    print(f"🔧 Servicio: {'✅ OK' if service_ok else '❌ ERROR'}")
    
    if wifi_ok and supabase_ok and printer_active and service_ok:
        print("\n🎉 ¡TODO LISTO!")
        print("=" * 20)
        print("✅ Tu Raspberry Pi está configurada correctamente")
        print("✅ Puedes ejecutar el servicio de impresora:")
        print("   python3 printer_service.py")
    else:
        print("\n⚠️  PROBLEMAS DETECTADOS")
        print("=" * 30)
        if not wifi_ok:
            print("• Configura el WiFi del restaurante")
        if not supabase_ok:
            print("• Verifica la conectividad a Internet")
        if not printer_active:
            print("• Activa la impresora en el dashboard")
        if not service_ok:
            print("• Instala las dependencias faltantes")

if __name__ == "__main__":
    main() 
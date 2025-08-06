#!/usr/bin/env python3
"""
Script para configurar WiFi del restaurante en Raspberry Pi
Conecta primero al hotspot del teléfono, luego configura la WiFi del restaurante
"""

import os
import sys
import subprocess
import time
import json
from pathlib import Path

def run_command(command, description=""):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n🔧 {description}")
    print(f"Comando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Éxito: {result.stdout}")
            return True
        else:
            print(f"❌ Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Excepción: {e}")
        return False

def check_wifi_status():
    """Verifica el estado actual de WiFi"""
    print("\n📡 VERIFICANDO ESTADO DE WIFI")
    print("=" * 40)
    
    # Verificar interfaces WiFi
    run_command("iwconfig", "Interfaces WiFi disponibles")
    run_command("ip addr show", "Direcciones IP")
    run_command("iwgetid", "Red WiFi actual")

def backup_wifi_config():
    """Hace backup de la configuración actual de WiFi"""
    print("\n💾 HACIENDO BACKUP DE CONFIGURACIÓN WIFI")
    print("=" * 40)
    
    backup_file = f"/etc/wpa_supplicant/wpa_supplicant.conf.backup.{int(time.time())}"
    
    if run_command(f"sudo cp /etc/wpa_supplicant/wpa_supplicant.conf {backup_file}", 
                   "Creando backup de configuración WiFi"):
        print(f"✅ Backup guardado en: {backup_file}")
        return backup_file
    return None

def add_restaurant_wifi(ssid, password):
    """Agrega la configuración WiFi del restaurante"""
    print(f"\n🏪 CONFIGURANDO WIFI DEL RESTAURANTE")
    print("=" * 40)
    print(f"SSID: {ssid}")
    print(f"Password: {'*' * len(password)}")
    
    # Crear configuración WiFi
    wifi_config = f"""
network={{
    ssid="{ssid}"
    psk="{password}"
    key_mgmt=WPA-PSK
    priority=1
}}
"""
    
    # Guardar configuración temporal
    config_file = "/tmp/restaurant_wifi.conf"
    with open(config_file, 'w') as f:
        f.write(wifi_config)
    
    print(f"✅ Configuración guardada en: {config_file}")
    
    # Agregar al archivo wpa_supplicant
    if run_command(f"sudo cat {config_file} >> /etc/wpa_supplicant/wpa_supplicant.conf",
                   "Agregando configuración WiFi del restaurante"):
        print("✅ Configuración agregada exitosamente")
        return True
    return False

def restart_wifi_services():
    """Reinicia los servicios de WiFi"""
    print("\n🔄 REINICIANDO SERVICIOS DE WIFI")
    print("=" * 40)
    
    commands = [
        ("sudo systemctl restart wpa_supplicant", "Reiniciando wpa_supplicant"),
        ("sudo systemctl restart dhcpcd", "Reiniciando dhcpcd"),
        ("sudo ifconfig wlan0 down", "Desconectando WiFi"),
        ("sudo ifconfig wlan0 up", "Reconectando WiFi")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print(f"⚠️  Advertencia: {description} falló")
            time.sleep(2)

def test_restaurant_connection():
    """Prueba la conexión al WiFi del restaurante"""
    print("\n🧪 PROBANDO CONEXIÓN AL RESTAURANTE")
    print("=" * 40)
    
    # Esperar a que se establezca la conexión
    print("⏳ Esperando conexión...")
    time.sleep(10)
    
    # Verificar conexión
    if run_command("ping -c 3 8.8.8.8", "Probando conectividad a Internet"):
        print("✅ Conexión exitosa al WiFi del restaurante")
        return True
    else:
        print("❌ No se pudo conectar al WiFi del restaurante")
        return False

def show_current_networks():
    """Muestra las redes WiFi configuradas"""
    print("\n📋 REDES WIFI CONFIGURADAS")
    print("=" * 40)
    
    run_command("sudo cat /etc/wpa_supplicant/wpa_supplicant.conf", 
               "Mostrando configuración WiFi actual")

def main():
    """Función principal"""
    print("🏪 CONFIGURADOR DE WIFI DEL RESTAURANTE")
    print("=" * 50)
    print("Este script te ayudará a configurar la WiFi del restaurante")
    print("en tu Raspberry Pi.")
    print("\n📋 PASOS:")
    print("1. Conecta tu Raspberry Pi al hotspot de tu teléfono")
    print("2. Ejecuta este script")
    print("3. Ingresa los datos del WiFi del restaurante")
    print("4. El script configurará automáticamente la conexión")
    
    # Verificar estado actual
    check_wifi_status()
    
    # Hacer backup
    backup_file = backup_wifi_config()
    if not backup_file:
        print("❌ No se pudo hacer backup. Abortando...")
        return
    
    # Solicitar datos del restaurante
    print("\n🏪 DATOS DEL WIFI DEL RESTAURANTE")
    print("=" * 40)
    
    ssid = input("Ingresa el nombre del WiFi del restaurante: ").strip()
    if not ssid:
        print("❌ SSID requerido. Abortando...")
        return
    
    password = input("Ingresa la contraseña del WiFi del restaurante: ").strip()
    if not password:
        print("❌ Contraseña requerida. Abortando...")
        return
    
    # Confirmar
    print(f"\n📋 RESUMEN:")
    print(f"SSID: {ssid}")
    print(f"Password: {'*' * len(password)}")
    
    confirm = input("\n¿Continuar? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Operación cancelada")
        return
    
    # Agregar configuración WiFi
    if add_restaurant_wifi(ssid, password):
        # Reiniciar servicios
        restart_wifi_services()
        
        # Probar conexión
        if test_restaurant_connection():
            print("\n🎉 ¡CONFIGURACIÓN EXITOSA!")
            print("=" * 30)
            print("✅ WiFi del restaurante configurado")
            print("✅ Conexión probada y funcionando")
            print(f"📁 Backup guardado en: {backup_file}")
            
            # Mostrar redes configuradas
            show_current_networks()
            
            print("\n📝 PRÓXIMOS PASOS:")
            print("1. Desconecta tu Raspberry Pi del hotspot")
            print("2. La Raspberry Pi se conectará automáticamente al WiFi del restaurante")
            print("3. Ejecuta el servicio de impresora: python3 printer_service.py")
        else:
            print("\n⚠️  ADVERTENCIA:")
            print("La configuración se agregó pero no se pudo conectar.")
            print("Verifica los datos del WiFi del restaurante.")
    else:
        print("\n❌ ERROR:")
        print("No se pudo configurar el WiFi del restaurante.")
        print(f"Puedes restaurar el backup desde: {backup_file}")

if __name__ == "__main__":
    # Verificar que se ejecute como root
    if os.geteuid() != 0:
        print("❌ Este script debe ejecutarse como root (sudo)")
        print("Ejecuta: sudo python3 wifi_config_restaurant.py")
        sys.exit(1)
    
    main() 
# 🔧 GUÍA DE IMPLEMENTACIÓN - FILTRADO DE IMPRESORAS

## 📋 RESUMEN DE CAMBIOS NECESARIOS

### 🎯 OBJETIVO
Modificar los servicios Python para que:
1. **Respeten el estado `is_active`** de las impresoras
2. **Filtren por categorías** (cocina vs bar)
3. **Solo impriman items correspondientes**

---

## 🍳 CAMBIOS EN `printer_service.py` (Raspberry Pi)

### 📂 Ubicación
```
Raspberry Pi: ~/printer_service.py
```

### 🔧 MODIFICACIONES NECESARIAS

#### 1. Agregar constantes de categorías
```python
# Al inicio del archivo, después de imports
KITCHEN_CATEGORIES = [4, 5, 6, 7, 8, 14, 15, 16, 17]  # IDs de categorías de cocina
RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"
```

#### 2. Agregar función para verificar estado de impresora
```python
def check_printer_active():
    """Verificar si la impresora de cocina está activa"""
    try:
        response = supabase.table("printers")\
            .select("is_active")\
            .eq("restaurant_id", RESTAURANT_ID)\
            .eq("type", "kitchen")\
            .single()\
            .execute()
        
        is_active = response.data.get("is_active", False)
        if not is_active:
            print("🔴 Impresora de cocina DESACTIVADA")
        return is_active
    except Exception as e:
        print(f"❌ Error verificando estado de impresora: {e}")
        return False
```

#### 3. Agregar función para filtrar items de cocina
```python
def get_kitchen_items(order_items):
    """Filtrar solo items que corresponden a cocina"""
    kitchen_items = []
    
    for item in order_items:
        try:
            # Obtener categoría del item
            menu_item = supabase.table("menu_items")\
                .select("id, name, category_id")\
                .eq("id", item["menu_item_id"])\
                .single()\
                .execute()
            
            category_id = menu_item.data.get("category_id")
            
            # Verificar si pertenece a cocina
            if category_id in KITCHEN_CATEGORIES:
                kitchen_items.append({
                    "id": menu_item.data["id"],
                    "name": menu_item.data["name"],
                    "quantity": item["quantity"],
                    "category_id": category_id
                })
                print(f"✅ Item de cocina: {menu_item.data['name']} (x{item['quantity']})")
            else:
                print(f"⏭️  Item de bar saltado: {menu_item.data['name']} (categoría {category_id})")
                
        except Exception as e:
            print(f"❌ Error procesando item {item['menu_item_id']}: {e}")
    
    return kitchen_items
```

#### 4. Modificar el loop principal
```python
def main_loop():
    print("🍳 Servicio de impresora de cocina iniciado")
    print(f"📋 Categorías de cocina: {KITCHEN_CATEGORIES}")
    
    while True:
        try:
            # 1. VERIFICAR SI IMPRESORA ESTÁ ACTIVA
            if not check_printer_active():
                print("⏸️  Impresora desactivada, esperando...")
                time.sleep(10)
                continue
            
            # 2. BUSCAR PEDIDOS PENDIENTES
            orders = supabase.table("orders")\
                .select("*, order_items(*)")\
                .eq("restaurant_id", RESTAURANT_ID)\
                .eq("kitchen_printed", False)\
                .execute()
            
            if not orders.data:
                # print("📭 No hay pedidos pendientes para cocina")
                time.sleep(5)
                continue
            
            for order in orders.data:
                print(f"\n🔍 Procesando pedido {order['id']} - {order['customer_name']}")
                
                # 3. FILTRAR ITEMS DE COCINA
                kitchen_items = get_kitchen_items(order["order_items"])
                
                if kitchen_items:
                    print(f"🍽️  Items de cocina encontrados: {len(kitchen_items)}")
                    
                    # 4. IMPRIMIR COMANDA DE COCINA
                    print(f"🖨️  Imprimiendo comanda de cocina - Pedido {order['id']}")
                    
                    # AQUÍ VA TU CÓDIGO DE IMPRESIÓN FÍSICA EXISTENTE
                    # Usar la lista kitchen_items para imprimir solo items de cocina
                    
                    # 5. MARCAR COMO IMPRESO
                    supabase.table("orders")\
                        .update({"kitchen_printed": True})\
                        .eq("id", order["id"])\
                        .execute()
                    
                    print(f"✅ Comanda de cocina impresa - Pedido {order['id']}")
                else:
                    print(f"⏭️  Sin items de cocina en pedido {order['id']}")
            
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ Error en loop principal: {e}")
            time.sleep(10)
```

---

## 🥤 CAMBIOS EN `xprinter_service.py` (Windows Tablet)

### 📂 Ubicación
```
Windows Tablet: C:\path\to\xprinter_service.py
```

### 🔧 MODIFICACIONES NECESARIAS

#### 1. Agregar constantes de categorías
```python
# Al inicio del archivo, después de imports
BAR_CATEGORIES = [9, 10, 11, 12, 13]  # IDs de categorías de bar
RESTAURANT_ID = "d4503f1b-9fc5-48aa-ada6-354775e57a67"
```

#### 2. Agregar función para verificar estado de impresora
```python
def check_printer_active():
    """Verificar si la impresora de bar está activa"""
    try:
        response = supabase.table("printers")\
            .select("is_active")\
            .eq("restaurant_id", RESTAURANT_ID)\
            .eq("type", "drink")\
            .single()\
            .execute()
        
        is_active = response.data.get("is_active", False)
        if not is_active:
            print("🔴 Impresora de bar DESACTIVADA")
        return is_active
    except Exception as e:
        print(f"❌ Error verificando estado de impresora: {e}")
        return False
```

#### 3. Agregar función para filtrar items de bar
```python
def get_bar_items(order_items):
    """Filtrar solo items que corresponden a bar"""
    bar_items = []
    
    for item in order_items:
        try:
            # Obtener categoría del item
            menu_item = supabase.table("menu_items")\
                .select("id, name, category_id")\
                .eq("id", item["menu_item_id"])\
                .single()\
                .execute()
            
            category_id = menu_item.data.get("category_id")
            
            # Verificar si pertenece a bar
            if category_id in BAR_CATEGORIES:
                bar_items.append({
                    "id": menu_item.data["id"],
                    "name": menu_item.data["name"],
                    "quantity": item["quantity"],
                    "category_id": category_id
                })
                print(f"✅ Item de bar: {menu_item.data['name']} (x{item['quantity']})")
            else:
                print(f"⏭️  Item de cocina saltado: {menu_item.data['name']} (categoría {category_id})")
                
        except Exception as e:
            print(f"❌ Error procesando item {item['menu_item_id']}: {e}")
    
    return bar_items
```

#### 4. Modificar el loop principal
```python
def main_loop():
    print("🥤 Servicio de impresora de bar iniciado")
    print(f"📋 Categorías de bar: {BAR_CATEGORIES}")
    
    while True:
        try:
            # 1. VERIFICAR SI IMPRESORA ESTÁ ACTIVA
            if not check_printer_active():
                print("⏸️  Impresora desactivada, esperando...")
                time.sleep(10)
                continue
            
            # 2. BUSCAR PEDIDOS PENDIENTES
            orders = supabase.table("orders")\
                .select("*, order_items(*)")\
                .eq("restaurant_id", RESTAURANT_ID)\
                .eq("drink_printed", False)\
                .execute()
            
            if not orders.data:
                # print("📭 No hay pedidos pendientes para bar")
                time.sleep(5)
                continue
            
            for order in orders.data:
                print(f"\n🔍 Procesando pedido {order['id']} - {order['customer_name']}")
                
                # 3. FILTRAR ITEMS DE BAR
                bar_items = get_bar_items(order["order_items"])
                
                if bar_items:
                    print(f"🥤 Items de bar encontrados: {len(bar_items)}")
                    
                    # 4. IMPRIMIR COMANDA DE BAR
                    print(f"🖨️  Imprimiendo comanda de bar - Pedido {order['id']}")
                    
                    # AQUÍ VA TU CÓDIGO DE IMPRESIÓN FÍSICA EXISTENTE
                    # Usar la lista bar_items para imprimir solo items de bar
                    
                    # 5. MARCAR COMO IMPRESO
                    supabase.table("orders")\
                        .update({"drink_printed": True})\
                        .eq("id", order["id"])\
                        .execute()
                    
                    print(f"✅ Comanda de bar impresa - Pedido {order['id']}")
                else:
                    print(f"⏭️  Sin items de bar en pedido {order['id']}")
            
            time.sleep(5)
            
        except Exception as e:
            print(f"❌ Error en loop principal: {e}")
            time.sleep(10)
```

---

## 🚀 PASOS PARA IMPLEMENTAR

### 1. 🍳 Raspberry Pi (Cocina)
```bash
# 1. Hacer backup del archivo actual
cp printer_service.py printer_service.py.backup

# 2. Editar printer_service.py
nano printer_service.py

# 3. Implementar los cambios de arriba

# 4. Reiniciar el servicio
sudo systemctl restart printer-service
# o
sudo pkill -f printer_service.py
python3 printer_service.py
```

### 2. 🥤 Windows Tablet (Bar)
```cmd
# 1. Hacer backup del archivo actual
copy xprinter_service.py xprinter_service.py.backup

# 2. Editar xprinter_service.py
notepad xprinter_service.py

# 3. Implementar los cambios de arriba

# 4. Reiniciar el servicio
# Ctrl+C para detener si está corriendo
python xprinter_service.py
```

### 3. 🧪 Ejecutar Pruebas
```bash
# Desde la PC de desarrollo
node automated-filtering-test.js
```

---

## 📊 RESULTADOS ESPERADOS

Después de implementar los cambios, las pruebas automatizadas deberían mostrar:

```
🏆 RESULTADOS FINALES:
   Exitosas: 4/4
   Porcentaje: 100%

🎉 ¡FILTRADO COMPLETAMENTE FUNCIONAL!
✅ Los servicios Python respetan categorías
✅ Los servicios Python respetan estado is_active
✅ Sistema de impresión distribuido optimizado
```

---

## 🔍 TROUBLESHOOTING

### Si las pruebas fallan:

1. **Verificar logs de servicios**
   - Raspberry Pi: `journalctl -u printer-service -f`
   - Windows: Consola donde corre el script

2. **Verificar categorías**
   - Ejecutar: `node category-analysis.js`
   - Confirmar IDs de categorías

3. **Verificar conexión BD**
   - Probar queries manuales
   - Verificar service_role_key

4. **Verificar estados de impresoras**
   - Ejecutar: `node check-real-printers.js`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Backup de archivos originales
- [ ] Modificar `printer_service.py` con filtrado y verificación de estado
- [ ] Modificar `xprinter_service.py` con filtrado y verificación de estado  
- [ ] Reiniciar ambos servicios
- [ ] Ejecutar `node automated-filtering-test.js`
- [ ] Verificar 4/4 tests exitosos
- [ ] Probar manualmente con pedidos reales

---

¡Con estos cambios, tu sistema de impresión distribuido será completamente funcional y optimizado! 🎉
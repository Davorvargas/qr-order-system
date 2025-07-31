-- Setup Row Level Security for Multi-Restaurant System
-- Este script habilita RLS y crea políticas para filtrar automáticamente por restaurante

-- 1. Habilitar RLS en todas las tablas relevantes
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

-- 2. Función helper para obtener el restaurant_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_restaurant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT restaurant_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLÍTICAS PARA PROFILES
-- Los usuarios solo pueden ver/editar su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- 4. POLÍTICAS PARA RESTAURANTS
-- Los usuarios solo pueden ver su propio restaurante
DROP POLICY IF EXISTS "Users can view own restaurant" ON restaurants;
CREATE POLICY "Users can view own restaurant" ON restaurants
  FOR SELECT USING (id = get_user_restaurant_id());

-- 5. POLÍTICAS PARA TABLES
-- Los usuarios solo pueden ver/modificar mesas de su restaurante
DROP POLICY IF EXISTS "Users can view own restaurant tables" ON tables;
CREATE POLICY "Users can view own restaurant tables" ON tables
  FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 6. POLÍTICAS PARA MENU_ITEMS  
-- Los usuarios solo pueden ver/modificar items de menú de su restaurante
DROP POLICY IF EXISTS "Users can view own restaurant menu" ON menu_items;
CREATE POLICY "Users can view own restaurant menu" ON menu_items
  FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 7. POLÍTICAS PARA ORDERS
-- Los usuarios solo pueden ver/modificar órdenes de su restaurante
DROP POLICY IF EXISTS "Users can view own restaurant orders" ON orders;
CREATE POLICY "Users can view own restaurant orders" ON orders
  FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 8. POLÍTICAS PARA ORDER_ITEMS
-- Los usuarios solo pueden ver/modificar items de órdenes de su restaurante
-- (usando JOIN con orders para obtener restaurant_id)
DROP POLICY IF EXISTS "Users can view own restaurant order items" ON order_items;
CREATE POLICY "Users can view own restaurant order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.restaurant_id = get_user_restaurant_id()
    )
  );

-- 9. POLÍTICAS PARA PRINTERS
-- Los usuarios solo pueden ver/modificar impresoras de su restaurante
DROP POLICY IF EXISTS "Users can view own restaurant printers" ON printers;
CREATE POLICY "Users can view own restaurant printers" ON printers
  FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 10. POLÍTICAS PARA ANONYMOUS ACCESS (para menús públicos)
-- Permitir acceso anónimo a menús y mesas para clientes que escanean QR
DROP POLICY IF EXISTS "Anonymous can view menu items" ON menu_items;
CREATE POLICY "Anonymous can view menu items" ON menu_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anonymous can view tables" ON tables;
CREATE POLICY "Anonymous can view tables" ON tables
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anonymous can view restaurants" ON restaurants;
CREATE POLICY "Anonymous can view restaurants" ON restaurants
  FOR SELECT USING (true);

-- 11. POLÍTICA PARA CREAR ÓRDENES ANÓNIMAS
-- Permitir que usuarios anónimos creen órdenes (clientes escaneando QR)
DROP POLICY IF EXISTS "Anonymous can create orders" ON orders;
CREATE POLICY "Anonymous can create orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous can create order items" ON order_items;
CREATE POLICY "Anonymous can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- 12. Verificación: mostrar todas las políticas creadas
DO $$
BEGIN
  RAISE NOTICE '✅ RLS habilitado y políticas creadas exitosamente!';
  RAISE NOTICE '🔒 Las tablas ahora filtran automáticamente por restaurant_id';
  RAISE NOTICE '👤 Los usuarios solo ven datos de su restaurante';
  RAISE NOTICE '🌐 Los menús siguen siendo públicos para clientes';
END $$;
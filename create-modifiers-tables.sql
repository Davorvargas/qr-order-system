-- ============================================
-- SISTEMA DE MODIFICADORES PARA PRODUCTOS
-- ============================================

-- Tabla de grupos de modificadores (ej: "Temperatura", "Tipo de Preparación")
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL, -- "Temperatura", "Tipo de Preparación", "Tipo de Leche"
  is_required BOOLEAN DEFAULT false, -- Si el cliente DEBE seleccionar una opción
  min_selections INTEGER DEFAULT 0, -- Mínimo de opciones a seleccionar
  max_selections INTEGER DEFAULT 1, -- Máximo de opciones a seleccionar (1 = radio, >1 = checkbox)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de modificadores/opciones dentro de cada grupo
CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Caliente", "Frío", "Con agua", "Con leche"
  price_modifier DECIMAL(10,2) DEFAULT 0, -- +3.00 para "Frío", +0.00 para "Caliente"
  is_default BOOLEAN DEFAULT false, -- Opción seleccionada por defecto
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar modificadores seleccionados en pedidos
CREATE TABLE order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id),
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id),
  price_at_order DECIMAL(10,2) NOT NULL, -- Precio del modificador al momento del pedido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_modifier_groups_menu_item ON modifier_groups(menu_item_id);
CREATE INDEX idx_modifier_groups_restaurant ON modifier_groups(restaurant_id);
CREATE INDEX idx_modifiers_group ON modifiers(modifier_group_id);
CREATE INDEX idx_order_item_modifiers_order_item ON order_item_modifiers(order_item_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - MULTI-TENANT
-- ============================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para modifier_groups
CREATE POLICY "Users can view modifier groups from their restaurant" ON modifier_groups
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert modifier groups to their restaurant" ON modifier_groups
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update modifier groups from their restaurant" ON modifier_groups
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modifier groups from their restaurant" ON modifier_groups
  FOR DELETE USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Políticas RLS para modifiers (heredan del grupo)
CREATE POLICY "Users can view modifiers from their restaurant" ON modifiers
  FOR SELECT USING (
    modifier_group_id IN (
      SELECT id FROM modifier_groups WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert modifiers to their restaurant" ON modifiers
  FOR INSERT WITH CHECK (
    modifier_group_id IN (
      SELECT id FROM modifier_groups WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update modifiers from their restaurant" ON modifiers
  FOR UPDATE USING (
    modifier_group_id IN (
      SELECT id FROM modifier_groups WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete modifiers from their restaurant" ON modifiers
  FOR DELETE USING (
    modifier_group_id IN (
      SELECT id FROM modifier_groups WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Políticas RLS para order_item_modifiers (heredan del order_item)
CREATE POLICY "Users can view order item modifiers from their restaurant" ON order_item_modifiers
  FOR SELECT USING (
    order_item_id IN (
      SELECT oi.id FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert order item modifiers to their restaurant" ON order_item_modifiers
  FOR INSERT WITH CHECK (
    order_item_id IN (
      SELECT oi.id FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================
-- FUNCIONES HELPER
-- ============================================

-- Función para obtener el precio total de un producto con modificadores
CREATE OR REPLACE FUNCTION calculate_item_total_price(
  menu_item_id INTEGER,
  selected_modifier_ids UUID[]
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  base_price DECIMAL(10,2);
  modifier_total DECIMAL(10,2) := 0;
  modifier_price DECIMAL(10,2);
BEGIN
  -- Obtener precio base del producto
  SELECT price INTO base_price
  FROM menu_items
  WHERE id = menu_item_id;
  
  -- Sumar modificadores
  IF selected_modifier_ids IS NOT NULL THEN
    FOR i IN 1..array_length(selected_modifier_ids, 1) LOOP
      SELECT price_modifier INTO modifier_price
      FROM modifiers
      WHERE id = selected_modifier_ids[i];
      
      modifier_total := modifier_total + COALESCE(modifier_price, 0);
    END LOOP;
  END IF;
  
  RETURN COALESCE(base_price, 0) + modifier_total;
END;
$$;

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_modifier_groups_updated_at
  BEFORE UPDATE ON modifier_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifiers_updated_at
  BEFORE UPDATE ON modifiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE modifier_groups IS 'Grupos de modificadores para productos del menú (ej: Temperatura, Tipo de Leche)';
COMMENT ON TABLE modifiers IS 'Opciones específicas dentro de cada grupo de modificadores';
COMMENT ON TABLE order_item_modifiers IS 'Modificadores seleccionados en cada item de pedido';

COMMENT ON COLUMN modifier_groups.is_required IS 'Si true, el cliente debe seleccionar al menos una opción';
COMMENT ON COLUMN modifier_groups.max_selections IS '1 = radio button, >1 = checkboxes múltiples';
COMMENT ON COLUMN modifiers.price_modifier IS 'Cantidad a sumar/restar del precio base del producto';
COMMENT ON COLUMN modifiers.is_default IS 'Opción seleccionada por defecto en el frontend';
COMMENT ON COLUMN order_item_modifiers.price_at_order IS 'Precio del modificador congelado al momento del pedido';
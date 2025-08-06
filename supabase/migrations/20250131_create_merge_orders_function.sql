-- Función para fusionar órdenes
CREATE OR REPLACE FUNCTION merge_orders(
  source_order_ids INTEGER[],
  target_order_id INTEGER,
  new_total DECIMAL(10,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  source_order_id INTEGER;
  merged_notes TEXT;
BEGIN
  -- Iniciar transacción
  BEGIN
    -- Mover todos los items de las órdenes fuente a la orden objetivo
    UPDATE order_items 
    SET order_id = target_order_id
    WHERE order_id = ANY(source_order_ids);
    
    -- Actualizar el total de la orden objetivo
    UPDATE orders 
    SET total_price = new_total,
        notes = CASE 
          WHEN notes IS NOT NULL AND notes != '' THEN 
            notes || ' | Órdenes fusionadas: ' || array_to_string(source_order_ids, ', ')
          ELSE 
            'Órdenes fusionadas: ' || array_to_string(source_order_ids, ', ')
        END
    WHERE id = target_order_id;
    
    -- Marcar las órdenes fuente como fusionadas (cambiar status a 'merged')
    UPDATE orders 
    SET status = 'merged',
        notes = CASE 
          WHEN notes IS NOT NULL AND notes != '' THEN 
            notes || ' | Fusionada en orden: ' || target_order_id
          ELSE 
            'Fusionada en orden: ' || target_order_id
        END
    WHERE id = ANY(source_order_ids);
    
    -- Commit implícito
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback implícito
      RAISE EXCEPTION 'Error al fusionar órdenes: %', SQLERRM;
  END;
END;
$$;

-- Agregar el estado 'merged' al enum si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
    CREATE TYPE order_status_enum AS ENUM (
      'pending', 'in_progress', 'completed', 'cancelled', 'merged'
    );
  ELSE
    -- Agregar 'merged' al enum existente si no está presente
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status_enum')
      AND enumlabel = 'merged'
    ) THEN
      ALTER TYPE order_status_enum ADD VALUE 'merged';
    END IF;
  END IF;
END $$; 
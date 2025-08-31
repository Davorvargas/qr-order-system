-- Update merge_orders function to preserve complete merge history
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
  all_merged_orders TEXT[];
  existing_merged_orders TEXT;
  current_order_notes TEXT;
BEGIN
  -- Iniciar transacción
  BEGIN
    -- Recopilar todos los IDs de órdenes que han sido fusionadas
    all_merged_orders := ARRAY[]::TEXT[];
    
    -- Agregar los IDs fuente actuales
    FOR source_order_id IN SELECT unnest(source_order_ids) LOOP
      all_merged_orders := all_merged_orders || source_order_id::TEXT;
      
      -- Obtener notas de la orden fuente para extraer órdenes previamente fusionadas
      SELECT notes INTO current_order_notes 
      FROM orders 
      WHERE id = source_order_id;
      
      -- Extraer órdenes previamente fusionadas de las notas
      IF current_order_notes IS NOT NULL AND current_order_notes LIKE '%Órdenes fusionadas:%' THEN
        existing_merged_orders := substring(current_order_notes FROM 'Órdenes fusionadas: ([0-9, ]+)');
        IF existing_merged_orders IS NOT NULL THEN
          -- Agregar las órdenes previamente fusionadas
          all_merged_orders := all_merged_orders || string_to_array(existing_merged_orders, ', ');
        END IF;
      END IF;
    END LOOP;
    
    -- Remover duplicados y ordenar
    SELECT array_agg(DISTINCT order_id ORDER BY order_id::INTEGER) 
    INTO all_merged_orders 
    FROM unnest(all_merged_orders) AS order_id;
    
    -- Mover todos los items de las órdenes fuente a la orden objetivo
    UPDATE order_items 
    SET order_id = target_order_id
    WHERE order_id = ANY(source_order_ids);
    
    -- Actualizar el total de la orden objetivo
    UPDATE orders 
    SET total_price = new_total,
        notes = CASE 
          WHEN notes IS NOT NULL AND notes != '' THEN 
            notes || ' | Órdenes fusionadas: ' || array_to_string(all_merged_orders, ', ')
          ELSE 
            'Órdenes fusionadas: ' || array_to_string(all_merged_orders, ', ')
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
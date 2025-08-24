-- Función RPC para obtener analytics del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_restaurant_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  revenue_today DECIMAL(10,2) := 0;
  revenue_yesterday DECIMAL(10,2) := 0;
  orders_today INTEGER := 0;
  orders_yesterday INTEGER := 0;
  top_items JSON;
  low_items JSON;
  payment_methods JSON;
  result JSON;
BEGIN
  -- Revenue y órdenes de hoy
  SELECT 
    COALESCE(SUM(total_price), 0),
    COUNT(*)
  INTO revenue_today, orders_today
  FROM orders 
  WHERE restaurant_id = p_restaurant_id 
    AND DATE(created_at) = CURRENT_DATE
    AND status NOT IN ('cancelled', 'refunded');

  -- Revenue y órdenes de ayer
  SELECT 
    COALESCE(SUM(total_price), 0),
    COUNT(*)
  INTO revenue_yesterday, orders_yesterday
  FROM orders 
  WHERE restaurant_id = p_restaurant_id 
    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
    AND status NOT IN ('cancelled', 'refunded');

  -- Top 5 productos más vendidos (hoy)
  WITH today_items AS (
    SELECT 
      COALESCE(mi.name, 
        CASE 
          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN
            COALESCE(
              (oi.notes::json->>'name'),
              'Producto Especial'
            )
          ELSE 'Producto Especial'
        END
      ) as name,
      SUM(oi.quantity) as quantity,
      SUM(oi.price_at_order * oi.quantity) as revenue
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = p_restaurant_id 
      AND DATE(o.created_at) = CURRENT_DATE
      AND o.status NOT IN ('cancelled', 'refunded')
    GROUP BY 1
    ORDER BY quantity DESC
    LIMIT 5
  )
  SELECT json_agg(
    json_build_object(
      'name', name,
      'quantity', quantity,
      'revenue', revenue
    )
  ) INTO top_items
  FROM today_items;

  -- Bottom 5 productos menos vendidos (últimos 7 días para tener más datos)
  WITH week_items AS (
    SELECT 
      COALESCE(mi.name, 
        CASE 
          WHEN oi.notes IS NOT NULL AND oi.notes LIKE '{%' THEN
            COALESCE(
              (oi.notes::json->>'name'),
              'Producto Especial'
            )
          ELSE 'Producto Especial'
        END
      ) as name,
      SUM(oi.quantity) as quantity,
      SUM(oi.price_at_order * oi.quantity) as revenue
    FROM order_items oi
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.restaurant_id = p_restaurant_id 
      AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '7 days'
      AND o.status NOT IN ('cancelled', 'refunded')
    GROUP BY 1
    HAVING SUM(oi.quantity) > 0
    ORDER BY quantity ASC
    LIMIT 5
  )
  SELECT json_agg(
    json_build_object(
      'name', name,
      'quantity', quantity,
      'revenue', revenue
    )
  ) INTO low_items
  FROM week_items;

  -- Métodos de pago (hoy)
  WITH payment_stats AS (
    SELECT 
      COALESCE(payment_method, 'No especificado') as method,
      SUM(total_price) as total,
      COUNT(*) as count
    FROM orders 
    WHERE restaurant_id = p_restaurant_id 
      AND DATE(created_at) = CURRENT_DATE
      AND status NOT IN ('cancelled', 'refunded')
    GROUP BY payment_method
  )
  SELECT json_agg(
    json_build_object(
      'method', method,
      'total', total,
      'count', count
    )
  ) INTO payment_methods
  FROM payment_stats;

  -- Construir resultado final
  result := json_build_object(
    'revenue_today', revenue_today,
    'revenue_yesterday', revenue_yesterday,
    'orders_today', orders_today,
    'orders_yesterday', orders_yesterday,
    'top_items', COALESCE(top_items, '[]'::json),
    'low_items', COALESCE(low_items, '[]'::json),
    'payment_methods', COALESCE(payment_methods, '[]'::json)
  );

  RETURN result;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(UUID) TO anon;

-- Comentario para documentación
COMMENT ON FUNCTION get_dashboard_analytics IS 'Obtiene analytics del dashboard para un restaurante específico';
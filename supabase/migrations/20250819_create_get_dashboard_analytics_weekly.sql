-- Create analytics function used by admin dashboard (weekly)
-- Returns KPIs and datasets expected by the UI

CREATE OR REPLACE FUNCTION public.get_dashboard_analytics_weekly(p_restaurant_id uuid)
RETURNS json
LANGUAGE sql
AS $$
WITH 
  days AS (
    SELECT generate_series(0, 6) AS d
  ),
  weekly AS (
    SELECT 
      to_char((CURRENT_DATE AT TIME ZONE 'America/La_Paz' - d)::date, 'Day')::text AS day,
      (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - d)::date AS date,
      COALESCE(
        (
          SELECT SUM(o.total_price)
          FROM public.orders o
          WHERE o.restaurant_id = p_restaurant_id
            AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - d)
            AND o.status NOT IN ('cancelled', 'refunded')
        ), 0
      )::numeric AS revenue,
      COALESCE(
        (
          SELECT COUNT(*)
          FROM public.orders o
          WHERE o.restaurant_id = p_restaurant_id
            AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - d)
            AND o.status NOT IN ('cancelled', 'refunded')
        ), 0
      )::int AS orders,
      COALESCE(
        (
          SELECT SUM(oi.cost_at_order * oi.quantity)
          FROM public.order_items oi
          JOIN public.orders o ON o.id = oi.order_id
          WHERE o.restaurant_id = p_restaurant_id
            AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - d)
            AND o.status NOT IN ('cancelled', 'refunded')
        ), 0
      )::numeric AS cost
    FROM days
  ),
  revenue_today AS (
    SELECT COALESCE(SUM(o.total_price), 0)::numeric AS value
    FROM public.orders o
    WHERE o.restaurant_id = p_restaurant_id
      AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = CURRENT_DATE AT TIME ZONE 'America/La_Paz'
      AND o.status NOT IN ('cancelled', 'refunded')
  ),
  orders_today AS (
    SELECT COALESCE(COUNT(*), 0)::int AS value
    FROM public.orders o
    WHERE o.restaurant_id = p_restaurant_id
      AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = CURRENT_DATE AT TIME ZONE 'America/La_Paz'
      AND o.status NOT IN ('cancelled', 'refunded')
  ),
  revenue_yesterday AS (
    SELECT COALESCE(SUM(o.total_price), 0)::numeric AS value
    FROM public.orders o
    WHERE o.restaurant_id = p_restaurant_id
      AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - INTERVAL '1 day')
      AND o.status NOT IN ('cancelled', 'refunded')
  ),
  orders_yesterday AS (
    SELECT COALESCE(COUNT(*), 0)::int AS value
    FROM public.orders o
    WHERE o.restaurant_id = p_restaurant_id
      AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - INTERVAL '1 day')
      AND o.status NOT IN ('cancelled', 'refunded')
  ),
  top_items AS (
    SELECT json_agg(x) AS data FROM (
      SELECT 
        COALESCE(mi.name, 'Producto Especial') AS name,
        SUM(oi.quantity)::int AS quantity,
        SUM(oi.price_at_order * oi.quantity)::numeric AS revenue
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      LEFT JOIN public.menu_items mi ON mi.id = oi.menu_item_id
      WHERE o.restaurant_id = p_restaurant_id
        AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = CURRENT_DATE AT TIME ZONE 'America/La_Paz'
        AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY 1
      ORDER BY quantity DESC
      LIMIT 5
    ) x
  ),
  low_items AS (
    SELECT json_agg(x) AS data FROM (
      SELECT 
        COALESCE(mi.name, 'Producto Especial') AS name,
        SUM(oi.quantity)::int AS quantity,
        SUM(oi.price_at_order * oi.quantity)::numeric AS revenue
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      LEFT JOIN public.menu_items mi ON mi.id = oi.menu_item_id
      WHERE o.restaurant_id = p_restaurant_id
        AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') >= (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - INTERVAL '7 days')
        AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY 1
      HAVING SUM(oi.quantity) > 0
      ORDER BY quantity ASC
      LIMIT 5
    ) x
  ),
  payment_methods AS (
    SELECT json_agg(x) AS data FROM (
      SELECT 
        COALESCE(o.payment_method, 'No especificado') AS method,
        SUM(o.total_price)::numeric AS total,
        COUNT(*)::int AS count
      FROM public.orders o
      WHERE o.restaurant_id = p_restaurant_id
        AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') = CURRENT_DATE AT TIME ZONE 'America/La_Paz'
        AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY 1
    ) x
  ),
  item_profit AS (
    SELECT 
      COALESCE(mi.name, 'Producto Especial') AS name,
      SUM(oi.quantity)::int AS quantity,
      SUM(oi.price_at_order * oi.quantity)::numeric AS revenue,
      SUM(oi.cost_at_order * oi.quantity)::numeric AS cost,
      CASE WHEN SUM(oi.price_at_order * oi.quantity) > 0
        THEN ( (SUM(oi.price_at_order * oi.quantity) - SUM(oi.cost_at_order * oi.quantity))
             / SUM(oi.price_at_order * oi.quantity) ) * 100
        ELSE 0 END AS profit_margin
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    LEFT JOIN public.menu_items mi ON mi.id = oi.menu_item_id
    WHERE o.restaurant_id = p_restaurant_id
      AND DATE(o.created_at AT TIME ZONE 'America/La_Paz') >= (CURRENT_DATE AT TIME ZONE 'America/La_Paz' - INTERVAL '30 days')
      AND o.status NOT IN ('cancelled', 'refunded')
    GROUP BY 1
    HAVING SUM(oi.quantity) > 0
  ),
  averages AS (
    SELECT 
      AVG(quantity)::numeric AS avg_quantity,
      AVG(profit_margin)::numeric AS avg_margin
    FROM item_profit
  ),
  stars AS (
    SELECT json_agg(x) AS data FROM (
      SELECT name, quantity, profit_margin
      FROM item_profit, averages
      WHERE profit_margin >= avg_margin AND quantity >= avg_quantity
      ORDER BY profit_margin DESC, quantity DESC
    ) x
  ),
  gems AS (
    SELECT json_agg(x) AS data FROM (
      SELECT name, quantity, profit_margin
      FROM item_profit, averages
      WHERE profit_margin >= avg_margin AND quantity < avg_quantity
      ORDER BY profit_margin DESC
    ) x
  ),
  popular AS (
    SELECT json_agg(x) AS data FROM (
      SELECT name, quantity, profit_margin
      FROM item_profit, averages
      WHERE profit_margin < avg_margin AND quantity >= avg_quantity
      ORDER BY quantity DESC
    ) x
  ),
  problems AS (
    SELECT json_agg(x) AS data FROM (
      SELECT name, quantity, profit_margin
      FROM item_profit, averages
      WHERE profit_margin < avg_margin AND quantity < avg_quantity
      ORDER BY profit_margin ASC, quantity ASC
    ) x
  )
SELECT json_build_object(
  'revenue_today',        (SELECT value FROM revenue_today),
  'revenue_yesterday',    (SELECT value FROM revenue_yesterday),
  'orders_today',         (SELECT value FROM orders_today),
  'orders_yesterday',     (SELECT value FROM orders_yesterday),
  'weekly_data',          (SELECT json_agg(json_build_object(
                              'day', day,
                              'date', to_char(date, 'YYYY-MM-DD'),
                              'revenue', revenue,
                              'orders', orders,
                              'cost', cost
                            ) ORDER BY date ASC) FROM weekly),
  'top_items',            COALESCE((SELECT data FROM top_items), '[]'::json),
  'low_items',            COALESCE((SELECT data FROM low_items), '[]'::json),
  'payment_methods',      COALESCE((SELECT data FROM payment_methods), '[]'::json),
  'profit_matrix',        json_build_object(
                            'stars',    COALESCE((SELECT data FROM stars), '[]'::json),
                            'gems',     COALESCE((SELECT data FROM gems), '[]'::json),
                            'popular',  COALESCE((SELECT data FROM popular), '[]'::json),
                            'problems', COALESCE((SELECT data FROM problems), '[]'::json)
                          )
);
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics_weekly(uuid) TO authenticated;



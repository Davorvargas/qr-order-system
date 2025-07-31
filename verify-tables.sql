-- Verification script to check tables for the restaurant
-- Restaurant ID: d4503f1b-9fc5-48aa-ada6-354775e57a67 (Restaurante Principal)

-- 1. Check restaurant exists
SELECT 
    'Restaurant Information:' as section,
    id,
    name,
    created_at
FROM restaurants 
WHERE id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

-- 2. Count current tables for this restaurant
SELECT 
    'Current Table Count:' as section,
    COUNT(*) as total_tables
FROM tables 
WHERE restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

-- 3. List all current tables with details
SELECT 
    'Table Details:' as section,
    table_number,
    id,
    created_at
FROM tables 
WHERE restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67'
ORDER BY CAST(table_number AS INTEGER);

-- 4. Check for missing table numbers (1-10)
WITH expected_tables AS (
    SELECT generate_series(1, 10)::text as expected_table_number
),
existing_tables AS (
    SELECT table_number 
    FROM tables 
    WHERE restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67'
)
SELECT 
    'Missing Tables:' as section,
    et.expected_table_number as missing_table_number
FROM expected_tables et
LEFT JOIN existing_tables ext ON et.expected_table_number = ext.table_number
WHERE ext.table_number IS NULL
ORDER BY CAST(et.expected_table_number AS INTEGER);

-- 5. Summary status
SELECT 
    CASE 
        WHEN COUNT(*) = 10 THEN 'COMPLETE: All 10 tables exist'
        ELSE 'INCOMPLETE: Only ' || COUNT(*) || ' tables exist, need ' || (10 - COUNT(*)) || ' more'
    END as status,
    COUNT(*) as current_count,
    10 as target_count
FROM tables 
WHERE restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
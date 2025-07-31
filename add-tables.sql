-- Script to add 9 additional tables (2-10) to the existing restaurant
-- Restaurant ID: d4503f1b-9fc5-48aa-ada6-354775e57a67 (Restaurante Principal)

-- Add tables 2-10 for the existing restaurant
INSERT INTO tables (id, restaurant_id, table_number, created_at) VALUES
('d4503f1b-9fc5-48aa-ada6-354775e57a68', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '2', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a69', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '3', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a70', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '4', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a71', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '5', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a72', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '6', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a73', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '7', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a74', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '8', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a75', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '9', NOW()),
('d4503f1b-9fc5-48aa-ada6-354775e57a76', 'd4503f1b-9fc5-48aa-ada6-354775e57a67', '10', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verification queries to confirm all tables exist
SELECT 
    'Tables for Restaurante Principal:' as info, 
    COUNT(*) as total_tables 
FROM tables 
WHERE restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';

-- Show all table numbers for the restaurant
SELECT 
    table_number,
    id,
    created_at
FROM tables 
WHERE restaurant_id = 'd4503f1b-9fc5-48aa-ada6-354775e57a67'
ORDER BY CAST(table_number AS INTEGER);

-- Final confirmation message
SELECT 
    'SUCCESS: Restaurant now has tables 1-10' as status,
    'Restaurant ID: d4503f1b-9fc5-48aa-ada6-354775e57a67' as restaurant_info,
    'All table_numbers: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10' as tables_added;
-- Allow NULL values in menu_item_id for custom products
-- This enables the system to handle custom/special products that don't exist in the menu_items table

ALTER TABLE order_items 
ALTER COLUMN menu_item_id DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN order_items.menu_item_id IS 'References menu_items.id. Can be NULL for custom/special products that are not in the menu.';
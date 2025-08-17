-- Migration: Fix foreign key constraint for menu_items deletion
-- This allows menu_items to be deleted by setting order_items.menu_item_id to NULL
-- instead of blocking the deletion

-- Drop the existing constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

-- Recreate the constraint with ON DELETE SET NULL
ALTER TABLE order_items 
ADD CONSTRAINT order_items_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL;

-- Add a comment to document this change
COMMENT ON CONSTRAINT order_items_menu_item_id_fkey ON order_items IS 
'Foreign key constraint that sets menu_item_id to NULL when the referenced menu_item is deleted, preserving order history';
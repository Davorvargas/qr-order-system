-- Add archived field to orders table for soft delete functionality
-- This allows orders to be hidden from dashboard without losing historical data

ALTER TABLE orders 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering by archived status
CREATE INDEX idx_orders_archived ON orders(archived);

-- Add index for common dashboard query (restaurant_id + archived + created_at)
CREATE INDEX idx_orders_dashboard ON orders(restaurant_id, archived, created_at);

-- Update any existing orders to set archived = false (just to be explicit)
UPDATE orders SET archived = FALSE WHERE archived IS NULL;
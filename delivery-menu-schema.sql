-- DELIVERY MENU DATABASE SCHEMA
-- Run these commands in order to set up delivery menu functionality

-- 1. Create menu type enum
CREATE TYPE menu_type_enum AS ENUM ('regular', 'delivery', 'both');

-- 2. Add menu_type to menu_items table
ALTER TABLE menu_items
ADD COLUMN menu_type menu_type_enum DEFAULT 'regular';

-- 3. Add delivery-specific fields to orders table (SAFELY - preserving existing data)
-- First add new columns as nullable
ALTER TABLE orders
ADD COLUMN customer_phone VARCHAR(20),
ADD COLUMN customer_address TEXT,
ADD COLUMN delivery_date DATE,
ADD COLUMN delivery_time TIME,
ADD COLUMN customer_nit_carnet VARCHAR(50), -- Either NIT or Carnet in same field
ADD COLUMN customer_razon_social VARCHAR(255),
ADD COLUMN order_type VARCHAR(20) DEFAULT 'regular' CHECK (order_type IN ('regular', 'delivery'));

-- CRITICAL: Make table_id nullable for delivery orders (SAFE - existing data keeps values)
-- This will NOT affect existing data since all existing orders have table_id values
ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL;

-- Add conditional constraints to ensure data integrity based on order type
-- This protects against invalid data while allowing both order types
ALTER TABLE orders ADD CONSTRAINT check_order_type_fields
CHECK (
  (order_type = 'regular' AND table_id IS NOT NULL) OR
  (order_type = 'delivery' AND
   customer_phone IS NOT NULL AND
   customer_address IS NOT NULL AND
   delivery_date IS NOT NULL AND
   delivery_time IS NOT NULL)
);

-- Set all existing orders to 'regular' type (SAFE - preserves current functionality)
UPDATE orders SET order_type = 'regular' WHERE order_type IS NULL;

-- 4. Create restaurant settings table for delivery configuration
CREATE TABLE restaurant_delivery_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    delivery_enabled BOOLEAN DEFAULT false,
    delivery_link_id VARCHAR(50) UNIQUE, -- for generating public delivery links
    theme_color VARCHAR(7) DEFAULT '#000000', -- hex color for restaurant theme
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id)
);

-- 5. Add RLS policies for restaurant_delivery_settings
ALTER TABLE restaurant_delivery_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view delivery settings for their restaurant
CREATE POLICY "Users can view delivery settings for their restaurant" ON restaurant_delivery_settings
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Admins can manage delivery settings for their restaurant
CREATE POLICY "Admins can manage delivery settings for their restaurant" ON restaurant_delivery_settings
    FOR ALL USING (
        restaurant_id IN (
            SELECT restaurant_id FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Public can view delivery settings via delivery_link_id
CREATE POLICY "Public can view delivery settings via link" ON restaurant_delivery_settings
    FOR SELECT USING (delivery_link_id IS NOT NULL);

-- 6. Create function to generate delivery link
CREATE OR REPLACE FUNCTION generate_delivery_link(p_restaurant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    link_id TEXT;
BEGIN
    -- Generate a random link ID
    link_id := encode(gen_random_bytes(8), 'base64url');

    -- Update or insert delivery settings
    INSERT INTO restaurant_delivery_settings (restaurant_id, delivery_link_id, delivery_enabled)
    VALUES (p_restaurant_id, link_id, true)
    ON CONFLICT (restaurant_id)
    DO UPDATE SET
        delivery_link_id = link_id,
        delivery_enabled = true,
        updated_at = NOW();

    RETURN link_id;
END;
$$;

-- 7. Add indexes for better performance
CREATE INDEX idx_menu_items_menu_type ON menu_items(menu_type);
CREATE INDEX idx_menu_items_restaurant_menu_type ON menu_items(restaurant_id, menu_type);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_restaurant_order_type ON orders(restaurant_id, order_type);
CREATE INDEX idx_delivery_settings_link_id ON restaurant_delivery_settings(delivery_link_id);

-- 8. Update existing menu items to have 'regular' type by default
UPDATE menu_items SET menu_type = 'regular' WHERE menu_type IS NULL;

-- 9. Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_delivery_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delivery_settings_updated_at
    BEFORE UPDATE ON restaurant_delivery_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_settings_updated_at();

-- 10. Set up Rosse Coffee with pink theme and delivery enabled
DO $$
DECLARE
    rosse_restaurant_id UUID;
    delivery_link TEXT;
BEGIN
    -- Get Rosse Coffee restaurant ID
    SELECT id INTO rosse_restaurant_id
    FROM restaurants
    WHERE name = 'Rosse Coffee'
    LIMIT 1;

    -- If restaurant exists, set up delivery settings
    IF rosse_restaurant_id IS NOT NULL THEN
        -- Generate delivery link
        delivery_link := generate_delivery_link(rosse_restaurant_id);

        -- Update theme color to pink
        UPDATE restaurant_delivery_settings
        SET theme_color = '#ec4899' -- Pink color
        WHERE restaurant_id = rosse_restaurant_id;

        -- Output the delivery link
        RAISE NOTICE 'Rosse Coffee delivery link: %', delivery_link;
    ELSE
        RAISE NOTICE 'Rosse Coffee restaurant not found. Please create it first.';
    END IF;
END;
$$;
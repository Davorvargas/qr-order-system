-- Fix public access to modifier tables for QR menu system
-- This script adds the missing public RLS policies for anonymous users

-- 1. Remove any restrictive policies that might block anonymous access
DROP POLICY IF EXISTS "Users can view modifier groups from their restaurant" ON modifier_groups;
DROP POLICY IF EXISTS "Users can view modifiers from their restaurant" ON modifiers;

-- 2. Ensure RLS is enabled on modifier tables
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY;

-- 3. Add public SELECT policies for anonymous access (QR menu users)
DROP POLICY IF EXISTS "Anonymous can view modifier groups" ON modifier_groups;
CREATE POLICY "Anonymous can view modifier groups" ON modifier_groups
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anonymous can view modifiers" ON modifiers;
CREATE POLICY "Anonymous can view modifiers" ON modifiers
  FOR SELECT USING (true);

-- 4. Allow anonymous users to create order item modifiers when placing orders
DROP POLICY IF EXISTS "Anonymous can create order item modifiers" ON order_item_modifiers;
CREATE POLICY "Anonymous can create order item modifiers" ON order_item_modifiers
  FOR INSERT WITH CHECK (true);

-- 5. Re-add the authenticated user policies for staff access
DROP POLICY IF EXISTS "Staff can manage modifier groups" ON modifier_groups;
CREATE POLICY "Staff can manage modifier groups" ON modifier_groups
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can manage modifiers" ON modifiers;
CREATE POLICY "Staff can manage modifiers" ON modifiers
  FOR ALL USING (
    modifier_group_id IN (
      SELECT id FROM modifier_groups WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 6. Staff can view order item modifiers from their restaurant
DROP POLICY IF EXISTS "Staff can view order item modifiers" ON order_item_modifiers;
CREATE POLICY "Staff can view order item modifiers" ON order_item_modifiers
  FOR SELECT USING (
    order_item_id IN (
      SELECT oi.id FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 7. Verification message
DO $$
BEGIN
  RAISE NOTICE '✅ Public modifier access policies created successfully!';
  RAISE NOTICE '🌐 Anonymous users can now view modifier groups and modifiers';
  RAISE NOTICE '🔒 Staff users can still manage their restaurant modifiers';
  RAISE NOTICE '📱 QR menu system should now work properly with modifiers';
END $$;
-- Fix conflicting RLS policies for modifiers
-- Remove old policies that require authentication
DROP POLICY IF EXISTS "Users can view modifier groups from their restaurant" ON modifier_groups;
DROP POLICY IF EXISTS "Users can insert modifier groups to their restaurant" ON modifier_groups;
DROP POLICY IF EXISTS "Users can update modifier groups from their restaurant" ON modifier_groups;
DROP POLICY IF EXISTS "Users can delete modifier groups from their restaurant" ON modifier_groups;

DROP POLICY IF EXISTS "Users can view modifiers from their restaurant" ON modifiers;
DROP POLICY IF EXISTS "Users can insert modifiers to their restaurant" ON modifiers;
DROP POLICY IF EXISTS "Users can update modifiers from their restaurant" ON modifiers;
DROP POLICY IF EXISTS "Users can delete modifiers from their restaurant" ON modifiers;

-- Verify only public policies remain
-- modifier_groups should have: modifier_groups_public_select
-- modifiers should have: modifiers_public_select 
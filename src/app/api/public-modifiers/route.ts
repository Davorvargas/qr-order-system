// src/app/api/public-modifiers/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');

    if (!menuItemId) {
      return NextResponse.json(
        { error: 'menuItemId parameter is required' },
        { status: 400 }
      );
    }

    // Obtener el restaurant_id del menu_item
    const { data: menuItem, error: menuItemError } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', parseInt(menuItemId))
      .single();

    if (menuItemError || !menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Obtener grupos de modificadores con sus opciones (acceso público)
    const { data: modifierGroups, error } = await supabase
      .from('modifier_groups')
      .select(`
        id,
        name,
        is_required,
        min_selections,
        max_selections,
        display_order,
        modifiers (
          id,
          name,
          price_modifier,
          is_default,
          display_order
        )
      `)
      .eq('menu_item_id', parseInt(menuItemId))
      .eq('restaurant_id', menuItem.restaurant_id)
      .order('display_order')
      .order('display_order', { foreignTable: 'modifiers' });

    if (error) {
      console.error('Error fetching modifiers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch modifiers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: modifierGroups || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
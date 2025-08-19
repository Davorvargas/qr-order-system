// src/app/api/public-modifiers/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Public modifiers API called');
    
    // Create anonymous Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    console.log('📡 Anonymous Supabase client created');
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');

    if (!menuItemId) {
      console.log('❌ No menuItemId provided');
      return NextResponse.json(
        { error: 'menuItemId parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking for menu item:', menuItemId);
    
    // Obtener el restaurant_id del menu_item
    const { data: menuItem, error: menuItemError } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', parseInt(menuItemId))
      .single();

    console.log('📦 Menu item query result:', { menuItem, error: menuItemError });

    if (menuItemError || !menuItem) {
      console.log('❌ Menu item not found:', menuItemError);
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    console.log('🔍 Looking for modifier groups for restaurant:', menuItem.restaurant_id);
    
    // Obtener grupos de modificadores con sus opciones (acceso público)
    // Excluir grupos archivados para mantener consistencia con API privada
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
      .not('name', 'like', '[ARCHIVED_%')
      .order('display_order')
      .order('display_order', { foreignTable: 'modifiers' });

    console.log('📦 Modifier groups query result:', { 
      modifierGroups: modifierGroups?.length || 0, 
      error 
    });

    if (error) {
      console.error('❌ Error fetching modifiers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch modifiers' },
        { status: 500 }
      );
    }

    console.log('✅ Returning modifier groups:', modifierGroups?.length || 0);
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
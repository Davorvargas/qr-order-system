// src/app/api/modifiers/route.ts
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

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Obtener restaurant_id del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.restaurant_id) {
      return NextResponse.json(
        { error: 'User not associated with any restaurant' },
        { status: 403 }
      );
    }

    // Obtener grupos de modificadores con sus opciones
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
      .eq('restaurant_id', profile.restaurant_id)
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { menuItemId, groups } = body;

    if (!menuItemId || !groups) {
      return NextResponse.json(
        { error: 'menuItemId and groups are required' },
        { status: 400 }
      );
    }

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Obtener restaurant_id del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.restaurant_id) {
      return NextResponse.json(
        { error: 'User not associated with any restaurant' },
        { status: 403 }
      );
    }

    // Eliminar grupos existentes (y sus modificadores por cascada)
    await supabase
      .from('modifier_groups')
      .delete()
      .eq('menu_item_id', menuItemId)
      .eq('restaurant_id', profile.restaurant_id);

    // Crear nuevos grupos y modificadores
    for (const group of groups) {
      const { data: newGroup, error: groupError } = await supabase
        .from('modifier_groups')
        .insert({
          menu_item_id: menuItemId,
          restaurant_id: profile.restaurant_id,
          name: group.name,
          is_required: group.is_required || false,
          min_selections: group.min_selections || 0,
          max_selections: group.max_selections || 1,
          display_order: group.display_order || 0
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating modifier group:', groupError);
        return NextResponse.json(
          { error: 'Failed to create modifier group' },
          { status: 500 }
        );
      }

      // Crear modificadores para este grupo
      if (group.modifiers && group.modifiers.length > 0) {
        const modifiersToInsert = group.modifiers.map((modifier: any, index: number) => ({
          modifier_group_id: newGroup.id,
          name: modifier.name,
          price_modifier: modifier.price_modifier || 0,
          is_default: modifier.is_default || false,
          display_order: modifier.display_order || index
        }));

        const { error: modifiersError } = await supabase
          .from('modifiers')
          .insert(modifiersToInsert);

        if (modifiersError) {
          console.error('Error creating modifiers:', modifiersError);
          return NextResponse.json(
            { error: 'Failed to create modifiers' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Modifiers configured successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
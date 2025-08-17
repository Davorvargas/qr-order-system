// src/app/api/modifiers/route.ts
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
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
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Obtener restaurant_id del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('restaurant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!profile?.restaurant_id) {
      console.error('User not associated with restaurant:', { userId: user.id, profile });
      return NextResponse.json(
        { error: 'User not associated with any restaurant' },
        { status: 403 }
      );
    }

    console.log('Fetching modifiers for:', { menuItemId, restaurantId: profile.restaurant_id, userRole: profile.role });

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
        { error: 'Failed to fetch modifiers', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: modifierGroups || []
    });

  } catch (error) {
    console.error('Unexpected error in GET modifiers:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { menuItemId, groups } = body;

    console.log('Received modifier save request:', { menuItemId, groupsCount: groups?.length });

    if (!menuItemId || !groups) {
      return NextResponse.json(
        { error: 'menuItemId and groups are required' },
        { status: 400 }
      );
    }

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error in POST:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Obtener restaurant_id del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('restaurant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error in POST:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!profile?.restaurant_id) {
      console.error('User not associated with restaurant in POST:', { userId: user.id, profile });
      return NextResponse.json(
        { error: 'User not associated with any restaurant' },
        { status: 403 }
      );
    }

    console.log('Processing modifier save for:', { menuItemId, restaurantId: profile.restaurant_id, userRole: profile.role });

    // Usar service client para operaciones que requieren bypassing RLS
    console.log('Creating service client...');
    const serviceSupabase = createServiceClient();
    console.log('Service client created successfully');

    // Eliminar grupos existentes (y sus modificadores por cascada)
    console.log('Deleting existing modifier groups for:', { menuItemId, restaurantId: profile.restaurant_id });
    const { error: deleteError } = await serviceSupabase
      .from('modifier_groups')
      .delete()
      .eq('menu_item_id', menuItemId)
      .eq('restaurant_id', profile.restaurant_id);

    if (deleteError) {
      console.error('Error deleting existing modifier groups:', deleteError);
      console.error('Delete error details:', JSON.stringify(deleteError, null, 2));
      return NextResponse.json(
        { error: 'Failed to delete existing modifier groups', details: deleteError.message },
        { status: 500 }
      );
    }
    
    console.log('Successfully deleted existing modifier groups');

    console.log('Deleted existing modifier groups, creating new ones...');

    // Crear nuevos grupos y modificadores
    for (const group of groups) {
      console.log('Creating modifier group:', group.name);
      
      const groupData = {
        menu_item_id: menuItemId,
        restaurant_id: profile.restaurant_id,
        name: group.name,
        is_required: group.is_required || false,
        min_selections: group.min_selections || 0,
        max_selections: group.max_selections || 1,
        display_order: group.display_order || 0
      };
      
      console.log('Creating modifier group with data:', groupData);
      
      const { data: newGroup, error: groupError } = await serviceSupabase
        .from('modifier_groups')
        .insert(groupData)
        .select()
        .single();

      if (groupError) {
        console.error('Error creating modifier group:', groupError);
        console.error('Group error details:', JSON.stringify(groupError, null, 2));
        console.error('Group data that failed:', groupData);
        return NextResponse.json(
          { error: 'Failed to create modifier group', details: groupError.message },
          { status: 500 }
        );
      }
      
      console.log('Successfully created modifier group:', newGroup.id);

      // Crear modificadores para este grupo
      if (group.modifiers && group.modifiers.length > 0) {
        console.log(`Creating ${group.modifiers.length} modifiers for group ${group.name}`);
        
        const modifiersToInsert = group.modifiers.map((modifier: any, index: number) => ({
          modifier_group_id: newGroup.id,
          name: modifier.name,
          price_modifier: modifier.price_modifier || 0,
          is_default: modifier.is_default || false,
          display_order: modifier.display_order || index
        }));

        const { error: modifiersError } = await serviceSupabase
          .from('modifiers')
          .insert(modifiersToInsert);

        if (modifiersError) {
          console.error('Error creating modifiers:', modifiersError);
          return NextResponse.json(
            { error: 'Failed to create modifiers', details: modifiersError.message },
            { status: 500 }
          );
        }
      }
    }

    console.log('Successfully saved all modifiers');

    return NextResponse.json({
      success: true,
      message: 'Modifiers configured successfully'
    });

  } catch (error) {
    console.error('Unexpected error in POST modifiers:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
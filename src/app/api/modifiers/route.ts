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

    // Obtener solo grupos de modificadores activos (excluir los archivados por nombre)
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
      .not('name', 'like', '[ARCHIVED_%')
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
    console.log('=== STARTING MODIFIERS API POST ===');
    
    const supabase = await createClient();
    const body = await request.json();
    const { menuItemId, groups } = body;

    console.log('Received modifier save request:', { menuItemId, groupsCount: groups?.length });

    if (!menuItemId || !groups) {
      console.error('Missing required parameters:', { menuItemId, hasGroups: !!groups });
      return NextResponse.json(
        { error: 'menuItemId and groups are required' },
        { status: 400 }
      );
    }

    // Verificar autenticación
    console.log('Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error in POST:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.log('Authentication successful for user:', user.id);

    // Obtener restaurant_id del usuario
    console.log('Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('restaurant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error in POST:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: profileError.message },
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

    // Verificar que las variables de entorno estén disponibles
    console.log('Checking environment variables...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { 
        hasSupabaseUrl: !!supabaseUrl, 
        hasServiceRoleKey: !!serviceRoleKey 
      });
      return NextResponse.json(
        { error: 'Server configuration error - missing environment variables' },
        { status: 500 }
      );
    }
    console.log('Environment variables are available');

    // Usar service client para operaciones que requieren bypassing RLS
    console.log('Creating service client...');
    const serviceSupabase = createServiceClient();
    console.log('Service client created successfully');

    // Archivar grupos existentes usando prefijo de nombre (preserva integridad referencial)
    console.log('Archiving existing modifier groups for:', { menuItemId, restaurantId: profile.restaurant_id });
    
    // Obtener grupos existentes que no están ya archivados
    const { data: existingGroups, error: fetchError } = await serviceSupabase
      .from('modifier_groups')
      .select('id, name')
      .eq('menu_item_id', menuItemId)
      .eq('restaurant_id', profile.restaurant_id)
      .not('name', 'like', '[ARCHIVED_%');

    if (fetchError) {
      console.error('Error fetching existing groups for archiving:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch existing modifier groups', details: fetchError.message },
        { status: 500 }
      );
    }

    if (existingGroups && existingGroups.length > 0) {
      const archiveDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Archivar cada grupo agregando prefijo al nombre
      for (const group of existingGroups) {
        const archivedName = `[ARCHIVED_${archiveDate}] ${group.name}`;
        const { error: archiveError } = await serviceSupabase
          .from('modifier_groups')
          .update({ name: archivedName })
          .eq('id', group.id);

        if (archiveError) {
          console.error('Error archiving group:', group.id, archiveError);
          return NextResponse.json(
            { error: 'Failed to archive existing modifier groups', details: archiveError.message },
            { status: 500 }
          );
        }
        
        console.log(`Successfully archived group: ${group.name} -> ${archivedName}`);
      }
    }
    
    console.log('Successfully archived existing modifier groups');
    console.log('Archived existing modifier groups, creating new ones...');

    // Crear nuevos grupos y modificadores
    for (const group of groups) {
      console.log('Creating modifier group:', group.name);
      
      const { data: newGroup, error: groupError } = await serviceSupabase
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
        console.error('Group error details:', JSON.stringify(groupError, null, 2));
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
          console.error('Modifiers error details:', JSON.stringify(modifiersError, null, 2));
          return NextResponse.json(
            { error: 'Failed to create modifiers', details: modifiersError.message },
            { status: 500 }
          );
        }
        
        console.log(`Successfully created ${group.modifiers.length} modifiers for group ${group.name}`);
      }
    }

    console.log('Successfully saved all modifiers');
    console.log('=== MODIFIERS API POST COMPLETED SUCCESSFULLY ===');

    return NextResponse.json({
      success: true,
      message: 'Modifiers configured successfully'
    });

  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN MODIFIERS API POST ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
// src/app/api/calculate-price/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { menuItemId, selectedModifierIds } = body;

    if (!menuItemId) {
      return NextResponse.json(
        { error: 'menuItemId is required' },
        { status: 400 }
      );
    }

    // Obtener precio base del producto
    const { data: menuItem, error: menuError } = await supabase
      .from('menu_items')
      .select('price')
      .eq('id', menuItemId)
      .single();

    if (menuError || !menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    let totalPrice = menuItem.price || 0;

    // Calcular modificadores si se proporcionaron
    if (selectedModifierIds && selectedModifierIds.length > 0) {
      const { data: modifiers, error: modifiersError } = await supabase
        .from('modifiers')
        .select('price_modifier')
        .in('id', selectedModifierIds);

      if (modifiersError) {
        console.error('Error fetching modifiers:', modifiersError);
        return NextResponse.json(
          { error: 'Failed to fetch modifier prices' },
          { status: 500 }
        );
      }

      // Sumar precios de modificadores
      const modifierTotal = modifiers?.reduce(
        (sum, modifier) => sum + (modifier.price_modifier || 0),
        0
      ) || 0;

      totalPrice += modifierTotal;
    }

    return NextResponse.json({
      success: true,
      data: {
        basePrice: menuItem.price || 0,
        totalPrice: totalPrice,
        modifierIds: selectedModifierIds || []
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
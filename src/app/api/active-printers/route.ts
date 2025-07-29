import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurant_id is required' },
        { status: 400 }
      );
    }

    // Fetch only active printers for the restaurant
    const { data: printers, error } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('type');

    if (error) {
      console.error('Error fetching active printers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch active printers' },
        { status: 500 }
      );
    }

    // Group by type for easier consumption
    const activePrinters = {
      restaurant_id: restaurantId,
      printers: printers || [],
      by_type: {
        kitchen: printers?.filter(p => p.type === 'kitchen') || [],
        drink: printers?.filter(p => p.type === 'drink') || [],
        receipt: printers?.filter(p => p.type === 'receipt') || []
      },
      total_active: printers?.length || 0,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(activePrinters);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
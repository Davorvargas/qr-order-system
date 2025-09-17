import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // First check if restaurant already exists
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('name', 'Rosse Coffee')
      .single()

    if (existingRestaurant) {
      return NextResponse.json({
        success: true,
        restaurant: existingRestaurant,
        message: 'Restaurant already exists',
        restaurantId: existingRestaurant.id
      })
    }

    // Create restaurant
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: 'Rosse Coffee'
      })
      .select()
      .single()

    if (restaurantError) {
      return NextResponse.json({
        success: false,
        error: restaurantError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      restaurant: restaurantData,
      message: 'Restaurant created successfully',
      restaurantId: restaurantData.id
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred'
    }, { status: 500 })
  }
}
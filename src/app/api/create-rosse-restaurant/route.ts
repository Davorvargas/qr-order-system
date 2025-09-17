import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Create restaurant directly
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: 'Rosse Coffee'
      })
      .select()

    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError)
      return NextResponse.json({
        success: false,
        error: restaurantError.message
      }, { status: 500 })
    }

    const newRestaurant = restaurantData[0]

    return NextResponse.json({
      success: true,
      restaurant: newRestaurant,
      message: 'Restaurant created successfully',
      note: 'Admin user needs to be created separately via Supabase Auth'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred'
    }, { status: 500 })
  }
}
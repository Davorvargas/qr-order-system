import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get restaurant_id from query params
    const url = new URL(req.url)
    const restaurantId = url.searchParams.get('restaurant_id')
    
    if (!restaurantId) {
      return new Response(
        JSON.stringify({ error: 'restaurant_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch only active printers for the restaurant
    const { data: printers, error } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('type')

    if (error) {
      console.error('Error fetching active printers:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch active printers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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
    }

    return new Response(
      JSON.stringify(activePrinters),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
// supabase/functions/_shared/cors.ts

// These are standard CORS headers. They tell the browser that it's safe
// for your website to make requests to your Edge Function.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
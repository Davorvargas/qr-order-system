// src/utils/supabase/service.ts
// Cliente especial para operaciones de servicio que bypassa RLS

import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try different possible environment variable names
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_KEY ||
                    process.env.SUPABASE_SERVICE_KEY;
  
  console.log('Service client env check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceKey,
    urlValue: supabaseUrl,
    serviceKeyPrefix: serviceKey ? serviceKey.substring(0, 20) + '...' : 'undefined',
    envKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  if (!serviceKey) {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY is not defined in production environment. Available env vars: ${Object.keys(process.env).filter(key => key.includes('SUPABASE')).join(', ')}`);
  }
  
  return createClient(supabaseUrl, serviceKey);
}
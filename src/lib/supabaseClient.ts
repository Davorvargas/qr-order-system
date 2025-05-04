// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are loaded correctly
if (!supabaseUrl) {
  throw new Error("Supabase URL not found. Make sure NEXT_PUBLIC_SUPABASE_URL is set in your .env.local file.");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase anon key not found. Make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is set in your .env.local file.");
}

// Create and export the Supabase client instance
// We can use this instance elsewhere in our app to interact with Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
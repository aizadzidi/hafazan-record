import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/supabase'

// Create a Supabase client for use in the browser
export const createClient = () => {
  return createBrowserClient<Database>(
    // Your Supabase project URL - store this in .env.local
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Your Supabase anon key - store this in .env.local
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 
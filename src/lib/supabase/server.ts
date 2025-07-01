import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/supabase'

// Create a Supabase client for use in Server Components and API routes
export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    // Your Supabase project URL - store this in .env.local
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Your Supabase anon key - store this in .env.local
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )
} 
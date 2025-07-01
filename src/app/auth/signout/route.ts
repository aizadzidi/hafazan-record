import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = createClient()

  // Sign out user
  await supabase.auth.signOut()

  // Redirect to login page
  return NextResponse.redirect(`${requestUrl.origin}/login`)
} 
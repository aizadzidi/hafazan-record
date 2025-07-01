import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      throw new Error('No code provided')
    }

    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      throw error
    }

    // Redirect to login page on success
    return NextResponse.redirect(`${requestUrl.origin}/login`)
  } catch (error: any) {
    console.error('Auth callback error:', error)
    // Redirect to login page with error
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=${encodeURIComponent(error.message)}`)
  }
} 
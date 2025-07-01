import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession()

  // If not logged in, redirect to login
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {session.user.email}</p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
} 
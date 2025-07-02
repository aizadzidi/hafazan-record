import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import UserManagement from '@/components/admin/UserManagement'

export default async function AdminPage() {
  const supabase = createClient()

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession()

  // If not logged in, redirect to login
  if (!session) {
    redirect('/login')
  }

  // Fetch user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // If not admin, redirect to dashboard
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} profile={profile} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-5 sm:px-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <UserManagement />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
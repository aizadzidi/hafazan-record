import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HafazanList from '@/components/hafazan/HafazanList'
import AddHafazanRecord from '@/components/hafazan/AddHafazanRecord'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default async function DashboardPage() {
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

  // Fetch user's hafazan records
  const { data: hafazanRecords } = await supabase
    .from('hafazan_records')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} profile={profile} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {profile?.role === 'admin' ? (
          <div className="px-4 py-5 sm:px-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
                <p className="text-gray-600">Please go to the admin section to manage users.</p>
                <a 
                  href="/admin"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Admin Dashboard
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-5 sm:px-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <AddHafazanRecord />
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <HafazanList initialRecords={hafazanRecords || []} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 
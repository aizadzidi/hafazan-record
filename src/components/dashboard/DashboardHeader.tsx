'use client'

import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

export default function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.role === 'admin' ? 'Admin Dashboard' : 'Hafazan Record System'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Admin Panel
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
} 
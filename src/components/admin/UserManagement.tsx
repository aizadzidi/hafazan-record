'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { toast } from 'react-hot-toast'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student' as const,
    teacher_id: ''
  })
  const [teachers, setTeachers] = useState<Profile[]>([])

  const supabase = createClient()

  // Fetch all users and teachers
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch all users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        setUsers(profiles || [])
        setTeachers(profiles?.filter(p => p.role === 'teacher') || [])
        setIsLoading(false)
      } catch (error: any) {
        toast.error('Failed to fetch users')
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError

      if (!authData.user) throw new Error('Failed to create user')

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: authData.user.email,
          full_name: newUser.full_name,
          role: newUser.role,
          teacher_id: newUser.role === 'student' ? newUser.teacher_id : null
        })

      if (profileError) {
        // If profile creation fails, we should delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      toast.success('User created successfully')
      
      // Reset form
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'student',
        teacher_id: ''
      })

      // Refresh users list
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(profiles || [])
      setTeachers(profiles?.filter(p => p.role === 'teacher') || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    setIsLoading(true)

    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) throw authError

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      toast.success('User deleted successfully')
      setUsers(users.filter(user => user.id !== userId))
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'teacher' | 'student') => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          teacher_id: null // Remove teacher_id when changing roles
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Role updated successfully')
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole, teacher_id: null } : user
      ))
      if (newRole === 'teacher') {
        setTeachers([...teachers, users.find(u => u.id === userId)!])
      } else {
        setTeachers(teachers.filter(t => t.id !== userId))
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignTeacher = async (studentId: string, teacherId: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ teacher_id: teacherId })
        .eq('id', studentId)

      if (error) throw error

      toast.success('Teacher assigned successfully')
      setUsers(users.map(user => 
        user.id === studentId ? { ...user, teacher_id: teacherId } : user
      ))
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign teacher')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New User Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({ 
                  ...newUser, 
                  role: e.target.value as 'admin' | 'teacher' | 'student',
                  teacher_id: e.target.value === 'student' ? newUser.teacher_id : ''
                })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {newUser.role === 'student' && (
            <div>
              <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
                Assign Teacher
              </label>
              <select
                id="teacher_id"
                value={newUser.teacher_id}
                onChange={(e) => setNewUser({ ...newUser, teacher_id: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || teacher.username || 'Unnamed Teacher'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.username || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role || ''}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as 'admin' | 'teacher' | 'student')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'student' ? (
                      <select
                        value={user.teacher_id || ''}
                        onChange={(e) => handleAssignTeacher(user.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name || teacher.username || 'Unnamed Teacher'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 
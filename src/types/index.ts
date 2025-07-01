// User roles in the application
export type UserRole = 'admin' | 'teacher' | 'parent'

// Base user type extending Supabase user
export type User = {
  id: string
  email: string
  role: UserRole
}

// Student type
export type Student = {
  id: string
  name: string
  parent_id: string
  teacher_id: string
}

// Report type for tasmik/murajaah
export type Report = {
  id: string
  student_id: string
  type: 'tasmik' | 'murajaah'
  surah: number
  from_ayah: number
  to_ayah: number
  grade: string
  created_at: string
} 
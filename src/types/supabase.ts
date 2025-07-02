export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hafazan_records: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          student_id: string
          juzuk: number
          surah_name: string
          page_from: number
          page_to: number
          ayat_from: number
          ayat_to: number
          status: 'new' | 'in_progress' | 'completed'
          grade: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          student_id: string
          juzuk: number
          surah_name: string
          page_from: number
          page_to: number
          ayat_from: number
          ayat_to: number
          status?: 'new' | 'in_progress' | 'completed'
          grade?: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          student_id?: string
          juzuk?: number
          surah_name?: string
          page_from?: number
          page_to?: number
          ayat_from?: number
          ayat_to?: number
          status?: 'new' | 'in_progress' | 'completed'
          grade?: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | null
          notes?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'teacher' | 'student' | null
          teacher_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'teacher' | 'student' | null
          teacher_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'teacher' | 'student' | null
          teacher_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
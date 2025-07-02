'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

// List of surahs for the dropdown
const SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd",
  "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara",
  "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah",
  "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar",
  "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
  "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat",
  "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid",
  "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah",
  "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam",
  "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir",
  "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
  "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams",
  "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr",
  "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur",
  "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar",
  "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
]

const GRADES = [
  { value: 'mumtaz', label: 'Mumtaz' },
  { value: 'jayyid_jiddan', label: 'Jayyid Jiddan' },
  { value: 'jayyid', label: 'Jayyid' }
]

export default function AddHafazanRecord() {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Profile[]>([])
  const [formData, setFormData] = useState({
    student_id: '',
    juzuk: '',
    surah_name: '',
    page_from: '',
    page_to: '',
    ayat_from: '',
    ayat_to: '',
    grade: '',
    notes: ''
  })

  const supabase = createClient()

  // Fetch students for the current teacher
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: students, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .eq('teacher_id', user.id)

        if (error) throw error
        setStudents(students || [])
      } catch (error: any) {
        toast.error('Failed to fetch students')
      }
    }

    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // Validate form data
      if (!formData.student_id || !formData.juzuk || !formData.surah_name || 
          !formData.page_from || !formData.page_to || !formData.ayat_from || !formData.ayat_to) {
        throw new Error('Please fill in all required fields')
      }

      const juzuk = parseInt(formData.juzuk)
      const pageFrom = parseInt(formData.page_from)
      const pageTo = parseInt(formData.page_to)
      const ayatFrom = parseInt(formData.ayat_from)
      const ayatTo = parseInt(formData.ayat_to)

      if (juzuk < 1 || juzuk > 30) {
        throw new Error('Juzuk must be between 1 and 30')
      }

      if (pageFrom > pageTo) {
        throw new Error('Starting page must be less than or equal to ending page')
      }

      if (ayatFrom > ayatTo) {
        throw new Error('Starting verse must be less than or equal to ending verse')
      }

      // Insert the record
      const { error } = await supabase.from('hafazan_records').insert({
        user_id: user.id,
        student_id: formData.student_id,
        juzuk,
        surah_name: formData.surah_name,
        page_from: pageFrom,
        page_to: pageTo,
        ayat_from: ayatFrom,
        ayat_to: ayatTo,
        grade: formData.grade || null,
        notes: formData.notes || null,
        status: 'new'
      })

      if (error) throw error

      // Reset form and show success message
      setFormData({
        student_id: '',
        juzuk: '',
        surah_name: '',
        page_from: '',
        page_to: '',
        ayat_from: '',
        ayat_to: '',
        grade: '',
        notes: ''
      })
      toast.success('Record added successfully')

      // Refresh the page to update the list
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add record')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Add New Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
            Student *
          </label>
          <select
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.full_name || student.username || 'Unnamed Student'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="juzuk" className="block text-sm font-medium text-gray-700">
              Juzuk *
            </label>
            <input
              type="number"
              id="juzuk"
              name="juzuk"
              value={formData.juzuk}
              onChange={handleChange}
              min="1"
              max="30"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="surah_name" className="block text-sm font-medium text-gray-700">
              Surah Name *
            </label>
            <select
              id="surah_name"
              name="surah_name"
              value={formData.surah_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a surah</option>
              {SURAHS.map(surah => (
                <option key={surah} value={surah}>{surah}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="page_from" className="block text-sm font-medium text-gray-700">
              Starting Page *
            </label>
            <input
              type="number"
              id="page_from"
              name="page_from"
              value={formData.page_from}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="page_to" className="block text-sm font-medium text-gray-700">
              Ending Page *
            </label>
            <input
              type="number"
              id="page_to"
              name="page_to"
              value={formData.page_to}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ayat_from" className="block text-sm font-medium text-gray-700">
              Starting Verse *
            </label>
            <input
              type="number"
              id="ayat_from"
              name="ayat_from"
              value={formData.ayat_from}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="ayat_to" className="block text-sm font-medium text-gray-700">
              Ending Verse *
            </label>
            <input
              type="number"
              id="ayat_to"
              name="ayat_to"
              value={formData.ayat_to}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            Grade
          </label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a grade</option>
            {GRADES.map(grade => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add any notes or comments about this memorization record..."
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Record'}
          </button>
        </div>
      </form>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { toast } from 'react-hot-toast'

type HafazanRecord = Database['public']['Tables']['hafazan_records']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface HafazanListProps {
  initialRecords: HafazanRecord[]
}

const GRADES = {
  mumtaz: { label: 'Mumtaz', class: 'bg-green-100 text-green-800' },
  jayyid_jiddan: { label: 'Jayyid Jiddan', class: 'bg-blue-100 text-blue-800' },
  jayyid: { label: 'Jayyid', class: 'bg-yellow-100 text-yellow-800' }
}

export default function HafazanList({ initialRecords }: HafazanListProps) {
  const [records, setRecords] = useState<HafazanRecord[]>(initialRecords)
  const [students, setStudents] = useState<Record<string, Profile>>({})
  const supabase = createClient()

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentIds = [...new Set(records.map(record => record.student_id))]
        if (studentIds.length === 0) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', studentIds)

        if (error) throw error

        const studentsMap = (data || []).reduce((acc, student) => {
          acc[student.id] = student
          return acc
        }, {} as Record<string, Profile>)

        setStudents(studentsMap)
      } catch (error: any) {
        toast.error('Failed to fetch student details')
      }
    }

    fetchStudents()
  }, [records])

  const updateStatus = async (record: HafazanRecord, newStatus: HafazanRecord['status']) => {
    try {
      const { error } = await supabase
        .from('hafazan_records')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', record.id)

      if (error) throw error

      setRecords(records.map(r => 
        r.id === record.id ? { ...r, status: newStatus } : r
      ))
      toast.success('Status updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const { error } = await supabase
        .from('hafazan_records')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRecords(records.filter(r => r.id !== id))
      toast.success('Record deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record')
    }
  }

  const getStatusColor = (status: HafazanRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Hafazan Records</h2>
      <div className="space-y-4">
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No records found. Start by adding a new record.</p>
        ) : (
          records.map(record => (
            <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">
                      {students[record.student_id]?.full_name || 'Loading...'}
                    </h3>
                    {record.grade && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${GRADES[record.grade].class}`}>
                        {GRADES[record.grade].label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Juzuk {record.juzuk} • {record.surah_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pages: {record.page_from} - {record.page_to} • 
                    Verses: {record.ayat_from} - {record.ayat_to}
                  </p>
                  {record.notes && (
                    <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => updateStatus(record, 'new')}
                  className={`px-3 py-1 rounded text-sm ${
                    record.status === 'new' ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => updateStatus(record, 'in_progress')}
                  className={`px-3 py-1 rounded text-sm ${
                    record.status === 'in_progress' ? 'bg-yellow-600 text-white' : 'bg-yellow-200 hover:bg-yellow-300'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(record, 'completed')}
                  className={`px-3 py-1 rounded text-sm ${
                    record.status === 'completed' ? 'bg-green-600 text-white' : 'bg-green-200 hover:bg-green-300'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 
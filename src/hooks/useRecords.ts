import { useState, useEffect, useCallback } from 'react'
import { supabase, type Record } from '@/lib/supabase'

export function useRecords() {
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  async function addRecord(record: Omit<Record, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('records')
        .insert([record])
        .select()
        .single()

      if (error) throw error
      await fetchRecords()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  async function deleteRecord(id: string) {
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchRecords()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    records,
    isLoading,
    error,
    fetchRecords,
    addRecord,
    deleteRecord,
  }
}

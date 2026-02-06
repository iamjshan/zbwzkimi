import { useState, useEffect, useCallback } from 'react'
import { supabase, type User } from '@/lib/supabase'

export function usePersonnel() {
  const [personnel, setPersonnel] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPersonnel = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPersonnel(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPersonnel()
  }, [fetchPersonnel])

  async function addPersonnel(email: string, password: string, name: string, role: 'admin' | 'operator' = 'operator') {
    try {
      // 使用 service role key 创建用户（需要后端支持）
      // 这里使用普通注册流程，然后更新角色
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('创建用户失败')

      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            role,
          }
        ])

      if (profileError) throw profileError

      await fetchPersonnel()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  async function updatePersonnel(id: string, updates: Partial<User>) {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchPersonnel()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  async function deletePersonnel(id: string) {
    try {
      // 删除用户资料
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (profileError) throw profileError

      await fetchPersonnel()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  async function updatePassword(id: string, newPassword: string) {
    try {
      // 需要管理员权限或用户本人
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: newPassword
      })

      if (error) throw error
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    personnel,
    isLoading,
    error,
    fetchPersonnel,
    addPersonnel,
    updatePersonnel,
    deletePersonnel,
    updatePassword,
  }
}

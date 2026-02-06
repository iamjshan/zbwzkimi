import { useState, useEffect, useCallback } from 'react'
import { supabase, type Message } from '@/lib/supabase'

export function useMessages(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!userId) return
    
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`recipient_id.eq.${userId},recipient_id.eq.all`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])

      // 计算未读数
      const unread = (data || []).filter(
        msg => !msg.read_by.includes(userId)
      ).length
      setUnreadCount(unread)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  async function sendMessage(message: Omit<Message, 'id' | 'created_at' | 'read_by'>) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ ...message, read_by: [] }])
        .select()
        .single()

      if (error) throw error
      await fetchMessages()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  async function markAsRead(messageId: string) {
    if (!userId) return { error: new Error('未登录') }

    try {
      const message = messages.find(m => m.id === messageId)
      if (!message) throw new Error('消息不存在')

      const readBy = [...message.read_by, userId]
      
      const { error } = await supabase
        .from('messages')
        .update({ read_by: readBy })
        .eq('id', messageId)

      if (error) throw error
      await fetchMessages()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  async function deleteMessage(id: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchMessages()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    messages,
    unreadCount,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
  }
}

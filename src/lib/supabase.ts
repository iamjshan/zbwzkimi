import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fuyiuwshpvnxnjgyikgu.supabase.co'
const supabaseAnonKey = 'sb_publishable_NX0NDpPxzF9WZ0PmbLs6pg_X0IRhNQP'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表类型
export type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'operator'
  created_at: string
  updated_at: string
}

export type Material = {
  id: string
  name: string
  code: string
  batch_number?: string
  unique_id: string
  manufacturer?: string
  concentration?: string
  uncertainty?: string
  storage_condition?: string
  quantity: number
  expiry_date: string
  status: 'normal' | 'warning' | 'expired' | 'low'
  images?: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export type Record = {
  id: string
  type: 'in' | 'out'
  material_id: string
  material_name: string
  quantity: number
  operator: string
  operator_id: string
  purpose?: string
  note?: string
  images?: string[]
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  sender_name: string
  recipient_id: string | 'all'
  recipient_name: string
  subject?: string
  content: string
  read_by: string[]
  created_at: string
}

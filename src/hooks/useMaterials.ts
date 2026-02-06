import { useState, useEffect, useCallback } from 'react'
import { supabase, type Material } from '@/lib/supabase'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  async function addMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([material])
        .select()
        .single()

      if (error) throw error
      await fetchMaterials()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  async function updateMaterial(id: string, updates: Partial<Material>) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchMaterials()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  async function deleteMaterial(id: string) {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchMaterials()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  async function outboundMaterial(id: string, operatorId: string, operatorName: string, purpose?: string, images?: string[]) {
    try {
      // 获取物料信息
      const { data: material, error: fetchError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 创建出库记录
      const { error: recordError } = await supabase
        .from('records')
        .insert([{
          type: 'out',
          material_id: id,
          material_name: material.name,
          quantity: material.quantity,
          operator: operatorName,
          operator_id: operatorId,
          purpose,
          images,
        }])

      if (recordError) throw recordError

      // 删除物料（或标记为已出库）
      const { error: deleteError } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await fetchMaterials()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // 按名称分组
  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.name]) {
      acc[material.name] = []
    }
    acc[material.name].push(material)
    return acc
  }, {} as Record<string, Material[]>)

  // 计算状态
  const getMaterialStatus = (material: Material) => {
    const today = new Date()
    const expiryDate = new Date(material.expiry_date)
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (material.quantity === 0) return 'low'
    if (expiryDate < today) return 'expired'
    if (expiryDate <= thirtyDaysLater) return 'warning'
    return 'normal'
  }

  return {
    materials,
    groupedMaterials,
    isLoading,
    error,
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    outboundMaterial,
    getMaterialStatus,
  }
}

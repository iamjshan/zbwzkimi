import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaterials } from '@/hooks/useMaterials'
import { usePersonnel } from '@/hooks/usePersonnel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus,
  Pencil, 
  Trash2, 
  Loader2,
  Package,
  List,
  Users,
  LogOut,
  ChevronDown,
  ChevronUp,
  Camera,
  X
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function Materials() {
  const { user } = useAuth()
  const { materials, isLoading, addMaterial, updateMaterial, deleteMaterial, outboundMaterial, getMaterialStatus } = useMaterials()
  const { personnel } = usePersonnel()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  
  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(searchParams.get('action') === 'add')
  const [isOutDialogOpen, setIsOutDialogOpen] = useState(searchParams.get('action') === 'out')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    batch_number: '',
    unique_id: '',
    manufacturer: '',
    concentration: '',
    uncertainty: '',
    storage_condition: '',
    quantity: 1,
    expiry_date: '',
    images: [] as string[],
  })

  // 出库表单
  const [outFormData, setOutFormData] = useState({
    material_id: '',
    operator: user?.name || '',
    purpose: '',
    images: [] as string[],
  })

  // 过滤物料
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.unique_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 按状态过滤
  const statusFilteredMaterials = filteredMaterials.filter(m => {
    if (activeTab === 'all') return true
    const status = getMaterialStatus(m)
    return status === activeTab
  })

  // 按名称分组
  const grouped = statusFilteredMaterials.reduce((acc, m) => {
    if (!acc[m.name]) acc[m.name] = []
    acc[m.name].push(m)
    return acc
  }, {} as Record<string, typeof materials>)

  function toggleGroup(name: string) {
    setExpandedGroups(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">正常</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">即将过期</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">已过期</Badge>
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">库存不足</Badge>
      default:
        return null
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isOut: boolean = false) {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string)
          if (newImages.length === Math.min(files.length, 3)) {
            if (isOut) {
              setOutFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
            } else {
              setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
              setPreviewImages([...previewImages, ...newImages])
            }
          }
        }
      }
      
      reader.readAsDataURL(file)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const status = getMaterialStatus({
      ...formData,
      expiry_date: formData.expiry_date,
      quantity: formData.quantity,
    } as any)

    const { error } = await addMaterial({
      ...formData,
      status,
      created_by: user?.id || '',
    })
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('入库成功')
      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        code: '',
        batch_number: '',
        unique_id: '',
        manufacturer: '',
        concentration: '',
        uncertainty: '',
        storage_condition: '',
        quantity: 1,
        expiry_date: '',
        images: [],
      })
      setPreviewImages([])
    }
  }

  async function handleOut(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { error } = await outboundMaterial(
      outFormData.material_id,
      user?.id || '',
      outFormData.operator,
      outFormData.purpose,
      outFormData.images
    )
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('出库成功')
      setIsOutDialogOpen(false)
      setOutFormData({
        material_id: '',
        operator: user?.name || '',
        purpose: '',
        images: [],
      })
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMaterial) return

    setError('')
    setSuccess('')

    const updateData = {
      name: formData.name,
      code: formData.code,
      batch_number: formData.batch_number,
      unique_id: formData.unique_id,
      manufacturer: formData.manufacturer,
      concentration: formData.concentration,
      uncertainty: formData.uncertainty,
      storage_condition: formData.storage_condition,
      quantity: formData.quantity,
      expiry_date: formData.expiry_date,
    }

    const { error } = await updateMaterial(selectedMaterial.id, updateData)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('更新成功')
      setIsEditDialogOpen(false)
      setSelectedMaterial(null)
    }
  }

  async function handleDelete() {
    if (!selectedMaterial) return

    setError('')
    setSuccess('')

    const { error } = await deleteMaterial(selectedMaterial.id)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('删除成功')
      setIsDeleteDialogOpen(false)
      setSelectedMaterial(null)
    }
  }

  function openOutDialog(materialId?: string) {
    if (materialId) {
      setOutFormData(prev => ({ ...prev, material_id: materialId }))
    }
    setIsOutDialogOpen(true)
  }

  function openEditDialog(item: any) {
    setSelectedMaterial(item)
    setFormData({
      name: item.name || '',
      code: item.code || '',
      batch_number: item.batch_number || '',
      unique_id: item.unique_id || '',
      manufacturer: item.manufacturer || '',
      concentration: item.concentration || '',
      uncertainty: item.uncertainty || '',
      storage_condition: item.storage_condition || '',
      quantity: item.quantity || 1,
      expiry_date: item.expiry_date || '',
      images: item.images || [],
    })
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">库存管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAddDialogOpen(true)} className="p-2 hover:bg-white/10 rounded-full">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索标准物质..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="normal">正常</TabsTrigger>
            <TabsTrigger value="warning">即将过期</TabsTrigger>
            <TabsTrigger value="expired">已过期</TabsTrigger>
            <TabsTrigger value="low">库存不足</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Materials List */}
        <Card>
          <CardContent className="p-0">
            {Object.keys(grouped).length > 0 ? (
              <div className="divide-y">
                {Object.entries(grouped).map(([name, items]) => {
                  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
                  const isExpanded = expandedGroups.includes(name)
                  
                  return (
                    <div key={name}>
                      <button
                        onClick={() => toggleGroup(name)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span className="font-medium">{name}</span>
                          <span className="text-sm text-gray-500">({items.length} 批次)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{totalQty}</span>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="bg-gray-50 divide-y">
                          {items.map((item) => (
                            <div key={item.id} className="p-4 pl-10">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm">唯一性标识: {item.unique_id}</p>
                                  <p className="text-sm text-gray-500">有效期: {new Date(item.expiry_date).toLocaleDateString('zh-CN')}</p>
                                  {item.concentration && <p className="text-sm text-gray-500">浓度: {item.concentration}</p>}
                                  {item.uncertainty && <p className="text-sm text-gray-500">不确定度: {item.uncertainty}</p>}
                                  <div className="pt-1">
                                    {getStatusBadge(getMaterialStatus(item))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => openOutDialog(item.id)}
                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => openEditDialog(item)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => { setSelectedMaterial(item); setIsDeleteDialogOpen(true); }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>入库登记</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>标准物质名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>标准物质编号 *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>批次号</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>唯一性标识 *</Label>
              <Input
                value={formData.unique_id}
                onChange={(e) => setFormData({ ...formData, unique_id: e.target.value })}
                placeholder="批次号+序号"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>生产厂家</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>浓度</Label>
              <Input
                value={formData.concentration}
                onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                placeholder="如：100μg/mL"
              />
            </div>
            <div className="space-y-2">
              <Label>不确定度</Label>
              <Input
                value={formData.uncertainty}
                onChange={(e) => setFormData({ ...formData, uncertainty: e.target.value })}
                placeholder="如：0.5%"
              />
            </div>
            <div className="space-y-2">
              <Label>稀释条件</Label>
              <Input
                value={formData.storage_condition}
                onChange={(e) => setFormData({ ...formData, storage_condition: e.target.value })}
                placeholder="如：使用前用纯水稀释"
              />
            </div>
            <div className="space-y-2">
              <Label>数量 *</Label>
              <Input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>有效期 *</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>图片上传</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">点击上传图片（最多3张）</p>
                </label>
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt="" className="w-full h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImages(prev => prev.filter((_, i) => i !== idx))
                            setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Out Dialog */}
      <Dialog open={isOutDialogOpen} onOpenChange={setIsOutDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>出库登记</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOut} className="space-y-4">
            <div className="space-y-2">
              <Label>选择标准物质 *</Label>
              <Select
                value={outFormData.material_id}
                onValueChange={(value) => setOutFormData({ ...outFormData, material_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择要出库的标准物质" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.unique_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>操作人员 *</Label>
              <Select
                value={outFormData.operator}
                onValueChange={(value) => setOutFormData({ ...outFormData, operator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>出库用途</Label>
              <Input
                value={outFormData.purpose}
                onChange={(e) => setOutFormData({ ...outFormData, purpose: e.target.value })}
                placeholder="请输入出库用途"
              />
            </div>
            <div className="space-y-2">
              <Label>图片上传</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                  id="out-image-upload"
                />
                <label htmlFor="out-image-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">点击上传图片（最多3张）</p>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOutDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">确认出库</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑标准物质</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>标准物质名称</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>标准物质编号</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>批次号</Label>
              <Input value={formData.batch_number} onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>唯一性标识</Label>
              <Input value={formData.unique_id} onChange={(e) => setFormData({ ...formData, unique_id: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>数量</Label>
              <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>有效期</Label>
              <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p>确定要删除 {selectedMaterial?.name} ({selectedMaterial?.unique_id}) 吗？</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-primary"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">首页</span>
          </button>
          <button 
            onClick={() => navigate('/materials')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
          >
            <List className="w-5 h-5" />
            <span className="text-xs">库存</span>
          </button>
          <button 
            onClick={() => navigate('/personnel')}
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-primary"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">人员</span>
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-primary"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">设置</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

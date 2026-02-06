import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePersonnel } from '@/hooks/usePersonnel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  User,
  Shield,
  UserCircle,
  Package,
  List,
  Users,
  LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Personnel() {
  const { user } = useAuth()
  const { personnel, isLoading, addPersonnel, updatePersonnel, deletePersonnel } = usePersonnel()
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'operator',
  })

  // 过滤人员
  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 检查是否为管理员
  const isAdmin = user?.role === 'admin'

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { error } = await addPersonnel(formData.email, formData.password, formData.name, formData.role)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('人员添加成功')
      setIsAddDialogOpen(false)
      setFormData({ name: '', email: '', password: '', role: 'operator' })
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPerson) return

    setError('')
    setSuccess('')

    const { error } = await updatePersonnel(selectedPerson.id, {
      name: formData.name,
      role: formData.role,
    })
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('人员更新成功')
      setIsEditDialogOpen(false)
      setSelectedPerson(null)
    }
  }

  async function handleDelete() {
    if (!selectedPerson) return

    setError('')
    setSuccess('')

    const { error } = await deletePersonnel(selectedPerson.id)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('人员删除成功')
      setIsDeleteDialogOpen(false)
      setSelectedPerson(null)
    }
  }

  function openEditDialog(person: any) {
    setSelectedPerson(person)
    setFormData({
      name: person.name,
      email: person.email,
      password: '',
      role: person.role,
    })
    setIsEditDialogOpen(true)
  }

  function openDeleteDialog(person: any) {
    setSelectedPerson(person)
    setIsDeleteDialogOpen(true)
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
            <h1 className="text-xl font-bold">人员管理</h1>
          </div>
          {isAdmin && (
            <button onClick={() => setIsAddDialogOpen(true)} className="p-2 hover:bg-white/10 rounded-full">
              <Plus className="w-5 h-5" />
            </button>
          )}
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
                placeholder="搜索人员..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

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

        {/* Personnel List */}
        <Card>
          <CardContent className="p-0">
            {filteredPersonnel.length > 0 ? (
              <div className="divide-y">
                {filteredPersonnel.map((person) => (
                  <div key={person.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-gray-500">{person.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={person.role === 'admin' ? 'default' : 'secondary'}>
                        {person.role === 'admin' ? (
                          <><Shield className="w-3 h-3 mr-1" /> 管理员</>
                        ) : (
                          <><UserCircle className="w-3 h-3 mr-1" /> 操作员</>
                        )}
                      </Badge>
                      {isAdmin && person.id !== user?.id && (
                        <>
                          <button 
                            onClick={() => openEditDialog(person)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog(person)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无人员数据</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加人员</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>密码</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'operator') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="operator">操作员</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑人员</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input value={formData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'operator') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="operator">操作员</SelectItem>
                </SelectContent>
              </Select>
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
          <p>确定要删除 {selectedPerson?.name} 吗？此操作不可恢复。</p>
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
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-primary"
          >
            <List className="w-5 h-5" />
            <span className="text-xs">库存</span>
          </button>
          <button 
            onClick={() => navigate('/personnel')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
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

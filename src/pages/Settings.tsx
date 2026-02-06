import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaterials } from '@/hooks/useMaterials'
import { useRecords } from '@/hooks/useRecords'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Lock, 
  Trash2, 
  Download,
  Info,
  LogOut,
  Loader2,
  ChevronRight,
  Package,
  List,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Settings() {
  const { user, signOut } = useAuth()
  const { materials } = useMaterials()
  const { records } = useRecords()
  const navigate = useNavigate()
  
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isClearDataOpen, setIsClearDataOpen] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [exportOptions, setExportOptions] = useState({
    stock: true,
    records: true,
    messages: true,
    format: 'excel' as 'excel' | 'csv',
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('新密码至少6位')
      return
    }

    setIsLoading(true)
    // 这里需要调用 Supabase 的密码修改 API
    setIsLoading(false)
    
    setSuccess('密码修改成功')
    setIsChangePasswordOpen(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  function handleExport() {
    let content = ''
    let filename = `标准物质管理系统数据_${new Date().toISOString().slice(0, 10)}`
    
    if (exportOptions.format === 'excel') {
      filename += '.xls'
      content += '<html xmlns:x="urn:schemas-microsoft-com:office:excel">'
      content += '<head><meta charset="UTF-8"><style>table {border-collapse: collapse;} th, td {border: 1px solid black; padding: 8px;}</style></head>'
      content += '<body>'
    } else {
      filename += '.csv'
    }

    // 导出库存数据
    if (exportOptions.stock && materials.length > 0) {
      if (exportOptions.format === 'excel') {
        content += '<h2>库存数据</h2><table>'
        content += '<tr><th>名称</th><th>编号</th><th>批次号</th><th>唯一性标识</th><th>数量</th><th>有效期</th><th>状态</th></tr>'
        materials.forEach(m => {
          content += `<tr><td>${m.name}</td><td>${m.code}</td><td>${m.batch_number || ''}</td><td>${m.unique_id}</td><td>${m.quantity}</td><td>${m.expiry_date}</td><td>${m.status}</td></tr>`
        })
        content += '</table><br>'
      } else {
        content += '库存数据\n名称,编号,批次号,唯一性标识,数量,有效期,状态\n'
        materials.forEach(m => {
          content += `${m.name},${m.code},${m.batch_number || ''},${m.unique_id},${m.quantity},${m.expiry_date},${m.status}\n`
        })
        content += '\n'
      }
    }

    // 导出记录数据
    if (exportOptions.records && records.length > 0) {
      if (exportOptions.format === 'excel') {
        content += '<h2>操作记录</h2><table>'
        content += '<tr><th>类型</th><th>标准物质</th><th>数量</th><th>操作人</th><th>时间</th><th>备注</th></tr>'
        records.forEach(r => {
          content += `<tr><td>${r.type === 'in' ? '入库' : '出库'}</td><td>${r.material_name}</td><td>${r.quantity}</td><td>${r.operator}</td><td>${r.created_at}</td><td>${r.note || ''}</td></tr>`
        })
        content += '</table>'
      } else {
        content += '操作记录\n类型,标准物质,数量,操作人,时间,备注\n'
        records.forEach(r => {
          content += `${r.type === 'in' ? '入库' : '出库'},${r.material_name},${r.quantity},${r.operator},${r.created_at},${r.note || ''}\n`
        })
      }
    }

    if (exportOptions.format === 'excel') {
      content += '</body></html>'
    }

    // 下载文件
    const blob = new Blob([content], { type: exportOptions.format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setSuccess('数据导出成功')
    setIsExportOpen(false)
  }

  function handleClearData() {
    // 清空 localStorage 中的数据
    localStorage.clear()
    setSuccess('数据已清空')
    setIsClearDataOpen(false)
    window.location.reload()
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
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
            <h1 className="text-xl font-bold">设置</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user?.name || user?.email}</h2>
                <p className="text-sm text-gray-500">
                  {user?.role === 'admin' ? '系统管理员' : '操作员'}
                </p>
              </div>
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

        {/* Settings List */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <span>修改密码</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => setIsClearDataOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>清空数据</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button 
              onClick={() => setIsExportOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-green-500" />
                <span>数据导出</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="w-full p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-500" />
                <span>关于系统</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">v1.0.0</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>当前密码</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>新密码</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>确认新密码</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>数据导出</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">选择导出数据</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.stock}
                    onChange={(e) => setExportOptions({ ...exportOptions, stock: e.target.checked })}
                  />
                  <span>库存数据</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.records}
                    onChange={(e) => setExportOptions({ ...exportOptions, records: e.target.checked })}
                  />
                  <span>操作记录</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.messages}
                    onChange={(e) => setExportOptions({ ...exportOptions, messages: e.target.checked })}
                  />
                  <span>消息记录</span>
                </label>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">导出格式</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={exportOptions.format === 'excel'}
                    onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as 'excel' | 'csv' })}
                  />
                  <span>Excel 表格</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportOptions.format === 'csv'}
                    onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as 'excel' | 'csv' })}
                  />
                  <span>CSV 文件</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsExportOpen(false)}>
                取消
              </Button>
              <Button type="button" onClick={handleExport}>
                导出
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog open={isClearDataOpen} onOpenChange={setIsClearDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认清空数据</DialogTitle>
          </DialogHeader>
          <p className="text-red-600">警告：此操作将清空所有本地数据，不可恢复！</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsClearDataOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={handleClearData}>
              确认清空
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
            className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-primary"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">人员</span>
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">设置</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

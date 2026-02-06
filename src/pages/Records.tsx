import { useState } from 'react'
import { useRecords } from '@/hooks/useRecords'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Search, 
  Package, 
  List,
  Users,
  LogOut,
  Minus,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Records() {
  const { records, isLoading } = useRecords()
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  // 过滤记录
  const filteredRecords = records.filter(r => 
    r.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.note && r.note.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  function getRecordIcon(type: string) {
    switch (type) {
      case 'in':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'out':
        return <Minus className="w-5 h-5 text-green-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    }
  }

  function getRecordBadge(type: string) {
    switch (type) {
      case 'in':
        return <Badge className="bg-blue-100 text-blue-800">入库</Badge>
      case 'out':
        return <Badge className="bg-green-100 text-green-800">出库</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">预警</Badge>
    }
  }

  function openImageViewer(images: string[]) {
    setSelectedImages(images)
    setIsImageDialogOpen(true)
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
            <h1 className="text-xl font-bold">操作记录</h1>
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
                placeholder="搜索记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardContent className="p-0">
            {filteredRecords.length > 0 ? (
              <div className="divide-y">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          record.type === 'in' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {getRecordIcon(record.type)}
                        </div>
                        <div>
                          <p className="font-medium">{record.material_name}</p>
                          <p className="text-sm text-gray-500">
                            操作人: {record.operator} | {new Date(record.created_at).toLocaleString('zh-CN')}
                          </p>
                          {record.purpose && (
                            <p className="text-sm text-gray-500">用途: {record.purpose}</p>
                          )}
                          {record.note && (
                            <p className="text-sm text-gray-500">备注: {record.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getRecordBadge(record.type)}
                        <span className="text-sm font-medium">数量: {record.quantity}</span>
                      </div>
                    </div>
                    
                    {/* Images */}
                    {record.images && record.images.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {record.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => openImageViewer(record.images || [])}
                            className="relative"
                          >
                            <img 
                              src={img} 
                              alt="" 
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">暂无记录</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-end">
            <button onClick={() => setIsImageDialogOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {selectedImages.map((img, idx) => (
              <img key={idx} src={img} alt="" className="w-full rounded-lg" />
            ))}
          </div>
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

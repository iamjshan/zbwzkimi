import { useAuth } from '@/hooks/useAuth'
import { useMaterials } from '@/hooks/useMaterials'
import { useRecords } from '@/hooks/useRecords'
import { useMessages } from '@/hooks/useMessages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  AlertTriangle, 
  Users, 
  History, 
  Plus, 
  Minus, 
  List,
  Bell,
  QrCode,
  LogOut,
  Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6']

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { materials, isLoading: materialsLoading } = useMaterials()
  const { records, isLoading: recordsLoading } = useRecords()
  const { unreadCount } = useMessages(user?.id)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    normal: 0,
    warning: 0,
    expired: 0,
    low: 0,
  })

  useEffect(() => {
    if (materials.length > 0) {
      const today = new Date()
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      let normal = 0, warning = 0, expired = 0, low = 0

      materials.forEach(m => {
        const expiryDate = new Date(m.expiry_date)
        if (m.quantity === 0) {
          low++
        } else if (expiryDate < today) {
          expired++
        } else if (expiryDate <= thirtyDaysLater) {
          warning++
        } else {
          normal++
        }
      })

      setStats({
        total: materials.length,
        normal,
        warning,
        expired,
        low,
      })
    }
  }, [materials])

  const chartData = [
    { name: '正常', value: stats.normal, color: COLORS[0] },
    { name: '即将过期', value: stats.warning, color: COLORS[1] },
    { name: '已过期', value: stats.expired, color: COLORS[2] },
    { name: '库存不足', value: stats.low, color: COLORS[3] },
  ].filter(d => d.value > 0)

  const recentRecords = records.slice(0, 5)

  async function handleLogout() {
    await signOut()
  }

  if (materialsLoading || recordsLoading) {
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
          <h1 className="text-xl font-bold">标准物质管理</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/scan')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.name || user?.email}</span>
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总库存</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">近效期预警</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">库存状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  暂无数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/materials?action=add')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs">入库</span>
              </button>
              <button 
                onClick={() => navigate('/materials?action=out')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <Minus className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs">出库</span>
              </button>
              <button 
                onClick={() => navigate('/materials')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-purple-100 p-3 rounded-full">
                  <List className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs">库存</span>
              </button>
              <button 
                onClick={() => navigate('/records')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-gray-100 p-3 rounded-full">
                  <History className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-xs">记录</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">最近活动</CardTitle>
            <Button variant="link" onClick={() => navigate('/records')}>
              查看全部
            </Button>
          </CardHeader>
          <CardContent>
            {recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      record.type === 'in' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {record.type === 'in' ? (
                        <Package className={`w-4 h-4 ${record.type === 'in' ? 'text-primary' : 'text-green-600'}`} />
                      ) : (
                        <Minus className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {record.material_name} {record.type === 'in' ? '入库' : '出库'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">暂无活动记录</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
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

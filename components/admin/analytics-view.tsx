"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ShoppingCart, DollarSign, Package, RefreshCw } from "lucide-react"
import { dashboardService } from "@/lib/dashboard-services"

interface AnalyticsData {
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  todayOrders: number
  thisMonthOrders: number
  pendingOrders: number
  completedOrders: number
  recentOrders: any[]
  recentUsers: any[]
}

export function AnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    thisMonthOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    recentUsers: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getDashboardAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({ title, value, icon: Icon, color = "pink" }: any) => (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
          <div
            className={`p-2 rounded-lg ${
              color === "pink"
                ? "bg-pink-50"
                : color === "blue"
                  ? "bg-blue-50"
                  : color === "green"
                    ? "bg-green-50"
                    : color === "purple"
                      ? "bg-purple-50"
                      : "bg-gray-50"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                color === "pink"
                  ? "text-pink-600"
                  : color === "blue"
                    ? "text-blue-600"
                    : color === "green"
                      ? "text-green-600"
                      : color === "purple"
                        ? "text-purple-600"
                        : "text-gray-600"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const completionRate =
    analytics.totalOrders > 0 ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1) : 0

  const averageOrderValue = analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(0) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 font-medium">
            Real-time Data
          </Badge>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 text-gray-700 bg-transparent"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`KSh ${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="blue"
        />
        <MetricCard title="Total Users" value={analytics.totalUsers.toLocaleString()} icon={Users} color="purple" />
        <MetricCard title="Avg Order Value" value={`KSh ${averageOrderValue}`} icon={Package} color="pink" />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{completionRate}%</div>
              <p className="text-sm text-gray-600">
                {analytics.completedOrders} of {analytics.totalOrders} orders completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Orders Today</span>
                <span className="text-lg font-bold text-gray-900">{analytics.todayOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">This Month</span>
                <span className="text-lg font-bold text-gray-900">{analytics.thisMonthOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Pending</span>
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-0 font-semibold">
                  {analytics.pendingOrders}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Completed</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 font-semibold">
                  {analytics.completedOrders}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {analytics.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-gray-900">#{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">KSh {order.total.toLocaleString()}</p>
                    <Badge
                      className={
                        order.status === "completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 font-medium"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-0 font-medium"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {analytics.recentUsers.slice(0, 5).map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                      <span className="text-pink-600 text-xs font-semibold">
                        {(user.name || user.email || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name || "Unknown"}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-300 text-gray-700 font-medium">
                    {user.role || "customer"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

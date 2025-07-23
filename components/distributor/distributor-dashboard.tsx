"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, CheckCircle, Clock, TrendingUp, Bell } from "lucide-react"
import { distributorService } from "@/lib/dashboard-services"
import { OrdersFulfillment } from "./orders-fulfillment"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"

interface DistributorStats {
  totalAssigned: number
  completed: number
  pending: number
  totalRevenue: number
  completionRate: number
  recentOrders: any[]
}

export function DistributorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DistributorStats>({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    totalRevenue: 0,
    completionRate: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData()
      // Check for new orders every 30 seconds
      const interval = setInterval(checkForUpdates, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const analytics = await distributorService.getDistributorAnalytics(user.uid)
      setStats(analytics)
    } catch (error) {
      console.error("Error loading distributor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkForUpdates = async () => {
    if (!user?.uid) return

    try {
      const newAnalytics = await distributorService.getDistributorAnalytics(user.uid)

      // Check for new assigned orders
      if (newAnalytics.totalAssigned > stats.totalAssigned) {
        const newOrdersCount = newAnalytics.totalAssigned - stats.totalAssigned
        setNotifications((prev) => [
          ...prev,
          `${newOrdersCount} new order${newOrdersCount > 1 ? "s" : ""} assigned to you!`,
        ])
      }

      setStats(newAnalytics)
    } catch (error) {
      console.error("Error checking for updates:", error)
    }
  }

  const dismissNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  const StatCard = ({ title, value, icon: Icon, color = "pink" }: any) => (
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
                      : color === "orange"
                        ? "bg-orange-50"
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
                        : color === "orange"
                          ? "text-orange-600"
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">VendAI Distributor</h1>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-400" />
                <div className="flex gap-2">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={() => dismissNotification(index)}
                    >
                      {notification}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 h-[calc(100vh-80px)] overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Assigned" value={stats.totalAssigned.toLocaleString()} icon={Package} color="blue" />
          <StatCard title="Completed" value={stats.completed.toLocaleString()} icon={CheckCircle} color="green" />
          <StatCard title="Pending" value={stats.pending.toLocaleString()} icon={Clock} color="orange" />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
            >
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersFulfillment />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

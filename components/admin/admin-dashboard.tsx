"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ShoppingCart, DollarSign, Package, Bell } from "lucide-react"
import { dashboardService } from "@/lib/dashboard-services"
import { UsersManagement } from "./users-management"
import { OrdersManagement } from "./orders-management"
import { DistributorManagement } from "./distributor-management"
import { AnalyticsView } from "./analytics-view"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  thisMonthOrders: number
  pendingOrders: number
  completedOrders: number
  recentOrders: any[]
  recentUsers: any[]
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    thisMonthOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    recentUsers: [],
  })
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    loadDashboardData()
    // Check for new orders and users every 30 seconds
    const interval = setInterval(checkForUpdates, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const analytics = await dashboardService.getDashboardAnalytics()
      setStats(analytics)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkForUpdates = async () => {
    try {
      const newAnalytics = await dashboardService.getDashboardAnalytics()

      // Check for new orders
      if (newAnalytics.totalOrders > stats.totalOrders) {
        const newOrdersCount = newAnalytics.totalOrders - stats.totalOrders
        setNotifications((prev) => [...prev, `${newOrdersCount} new order${newOrdersCount > 1 ? "s" : ""} received!`])
      }

      // Check for new users
      if (newAnalytics.totalUsers > stats.totalUsers) {
        const newUsersCount = newAnalytics.totalUsers - stats.totalUsers
        setNotifications((prev) => [...prev, `${newUsersCount} new user${newUsersCount > 1 ? "s" : ""} registered!`])
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
              <h1 className="text-lg font-bold text-gray-900">VendAI Admin</h1>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-400" />
                <div className="flex gap-2">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <Badge
                      key={index}
                      className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
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
          <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="blue" />
          <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} color="green" />
          <StatCard
            title="Revenue"
            value={`KSh ${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
          <StatCard title="Today's Orders" value={stats.todayOrders.toLocaleString()} icon={Package} color="pink" />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="distributors"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
            >
              Distributors
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="distributors">
            <DistributorManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

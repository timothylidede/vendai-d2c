"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Package, Clock, AlertCircle, CheckCircle, Truck, ShoppingCart, DollarSign } from "lucide-react"
import { dashboardService } from "@/lib/dashboard-services"
import type { Order, Distributor } from "@/lib/types"

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const completedOrders = orders.filter((o) => o.status === "delivered").length
  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0)

  useEffect(() => {
    loadData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [ordersData, distributorsData] = await Promise.all([
        dashboardService.getAllOrders(100),
        dashboardService.getDistributors(),
      ])
      setOrders(ordersData)
      setDistributors(distributorsData)
      setLoading(false)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setLoading(false)
    }
  }

  const handleAssignDistributor = async (orderId: string, distributorId: string) => {
    try {
      await dashboardService.assignOrderToDistributor(orderId, distributorId)
      const updatedOrders = await dashboardService.getAllOrders(100)
      setOrders(updatedOrders)
    } catch (error) {
      console.error("Error assigning distributor:", error)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: Order["status"]) => {
    try {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "processing":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "shipped":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "delivered":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-light">
                vend
              </span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-black">
                ai
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Total Orders</p>
                    <p className="text-xl font-bold text-white">{totalOrders}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <ShoppingCart className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Pending</p>
                    <p className="text-xl font-bold text-white">{pendingOrders}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Completed</p>
                    <p className="text-xl font-bold text-white">{completedOrders}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Revenue</p>
                    <p className="text-xl font-bold text-white">KES {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <DollarSign className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white/5 border-white/10 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">#{order.orderNumber || order.id.slice(-8)}</h3>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} border`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Customer</p>
                      <p className="text-white font-medium">{order.customerName || "N/A"}</p>
                      <p className="text-sm text-gray-400">{order.customerPhone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Items & Total</p>
                      <p className="text-white">{order.items.length} items</p>
                      <p className="text-green-400 font-semibold">KES {order.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                    <Select
                      value={order.assignedDistributor || ""}
                      onValueChange={(value) => handleAssignDistributor(order.id, value)}
                    >
                      <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Assign distributor" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/10">
                        {distributors.map((distributor) => (
                          <SelectItem key={distributor.id} value={distributor.id}>
                            {distributor.name} - {distributor.area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={order.status}
                      onValueChange={(value: Order["status"]) => handleStatusUpdate(order.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/10">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredOrders.length === 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No orders found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
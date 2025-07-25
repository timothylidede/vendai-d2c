"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, Clock, CheckCircle, Truck, Eye, TrendingUp } from "lucide-react"
import { subscribeToOrdersByDistributor, updateOrder, markOrderAsSeen } from "@/lib/firebase-services"
import { useAuth } from "@/lib/auth-context"
import type { Order } from "@/lib/types"

export function DistributorDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Stats
  const totalAssigned = orders.length
  const pending = orders.filter((o) => o.status === "processing").length
  const completed = orders.filter((o) => o.status === "delivered").length
  const completionRate = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = subscribeToOrdersByDistributor(user.uid, (ordersData) => {
      setOrders(ordersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const handleStatusUpdate = async (orderId: string, status: Order["status"]) => {
    try {
      await updateOrder(orderId, { status })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleMarkAsSeen = async (orderId: string) => {
    try {
      await markOrderAsSeen(orderId)
    } catch (error) {
      console.error("Error marking order as seen:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "shipped":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "delivered":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-lg font-bold text-white">VendAI Distributor Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Total Assigned</p>
                  <p className="text-xl font-bold text-white">{totalAssigned}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Pending</p>
                  <p className="text-xl font-bold text-white">{pending}</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Completed</p>
                  <p className="text-xl font-bold text-white">{completed}</p>
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
                  <p className="text-xs font-medium text-gray-400 mb-1">Completion Rate</p>
                  <p className="text-xl font-bold text-white">{completionRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
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
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className={`bg-white/5 border-white/10 transition-all duration-200 ${
                order.isNew ? "bg-white/10 border-white/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">#{order.orderNumber || order.id.slice(-8)}</h3>
                    {order.isNew && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsSeen(order.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
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
                    <p className="text-sm text-gray-400">Delivery Address</p>
                    <p className="text-white text-sm">{order.deliveryAddress?.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Items & Total</p>
                    <p className="text-white">{order.items.length} items</p>
                    <p className="text-green-400 font-semibold">KES {order.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/10">
                  <Select
                    value={order.status}
                    onValueChange={(value: Order["status"]) => handleStatusUpdate(order.id, value)}
                  >
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10">
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
                <p className="text-gray-400">No orders assigned to you</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, RefreshCw, MapPin, Clock, Package } from "lucide-react"
import { distributorService } from "@/lib/dashboard-services"
import { useAuth } from "@/lib/auth-context"
import type { Order } from "@/lib/types"

export function OrdersFulfillment() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (user?.uid) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const ordersData = await distributorService.getAssignedOrders(user.uid)
      setOrders(ordersData)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string, distributorStatus: string) => {
    try {
      const success = await distributorService.updateOrderStatus(orderId, status, distributorStatus)
      if (success) {
        await loadOrders()
        alert("Order status updated successfully!")
      } else {
        alert("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error updating order status")
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.distributorStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { bg: "bg-blue-100", text: "text-blue-800", label: "Assigned" },
      accepted: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
      preparing: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Preparing" },
      shipped: { bg: "bg-purple-100", text: "text-purple-800", label: "Shipped" },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
      pending: { bg: "bg-orange-100", text: "text-orange-800", label: "Pending" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg} border-0 font-medium`}>{config.label}</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Order Fulfillment</h2>
        <Button
          onClick={loadOrders}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 text-gray-700 bg-transparent"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">My Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No orders assigned</p>
              <p className="text-gray-400 text-sm mt-1">Orders will appear here when assigned to you</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-700 font-semibold">Order ID</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Customer</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Total</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Address</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-mono text-sm font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">{order.userId.slice(-8)}</TableCell>
                      <TableCell className="font-semibold text-gray-900">KSh {order.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.distributorStatus || "assigned")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {order.deliveryAddress?.address?.slice(0, 30) || "No address"}...
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                            className="border-gray-300 hover:bg-gray-50 text-gray-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Select
                            value={order.distributorStatus || "assigned"}
                            onValueChange={(newStatus) => handleStatusUpdate(order.id, order.status, newStatus)}
                          >
                            <SelectTrigger className="w-28 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="accepted">Accept</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="shipped">Ship</SelectItem>
                              <SelectItem value="delivered">Deliver</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">
                Order Details - #{selectedOrder.id.slice(-8)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Customer ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                  <p className="font-semibold text-gray-900">KSh {selectedOrder.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  {getStatusBadge(selectedOrder.distributorStatus || "assigned")}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Delivery Address</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900 font-medium">
                        {selectedOrder.deliveryAddress?.address || "No address provided"}
                      </p>
                      {selectedOrder.deliveryAddress?.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Notes:</span> {selectedOrder.deliveryAddress.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">KSh {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No items found</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

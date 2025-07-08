"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Package, Check, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderTracking } from "./order-tracking"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  orders: any[]
}

export function Sidebar({ sidebarOpen, setSidebarOpen, orders }: SidebarProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Don't render sidebar if not authenticated - this will be handled by parent component

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "shipped":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const categorizeOrders = (orders: any[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayOrders = orders.filter((order) => new Date(order.date) >= today)
    const last7DaysOrders = orders.filter((order) => {
      const orderDate = new Date(order.date)
      return orderDate >= sevenDaysAgo && orderDate < today
    })
    const olderOrders = orders.filter((order) => new Date(order.date) < sevenDaysAgo)

    return { todayOrders, last7DaysOrders, olderOrders }
  }

  const { todayOrders, last7DaysOrders, olderOrders } = categorizeOrders(orders)

  const renderOrderSection = (sectionOrders: any[], title: string, startIndex: number) => {
    if (sectionOrders.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">{title}</h3>
        <div className="space-y-3">
          {sectionOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (startIndex + index) * 0.1 }}
              className="glass-effect rounded-lg p-4 hover-glow cursor-pointer hover:bg-white/5 transition-all duration-300"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <span className="text-xs text-gray-400">
                  {new Date(order.date).toLocaleDateString("en-KE", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order #{order.orderNumber || order.id.split("-").pop()}</span>
                  <span className="text-sm font-bold">KES {order.total.toLocaleString()}</span>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  {order.items.slice(0, 2).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-gray-500">
                      +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                {order.deliveryDate && (
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    {order.status === "completed" ? (
                      <>
                        <Check className="h-3 w-3 text-green-400" />
                        <span>Delivered {new Date(order.deliveryDate).toLocaleDateString("en-KE")}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>Expected {new Date(order.deliveryDate).toLocaleDateString("en-KE")}</span>
                      </>
                    )}
                  </div>
                )}

                <Button variant="ghost" size="sm" className="text-xs hover:bg-white/10">
                  <Eye className="h-3 w-3 mr-1" />
                  Track
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (selectedOrder) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-30 w-80 glass-effect border-r border-white/10 lg:relative lg:translate-x-0 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gradient">Order Details</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                    className="hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <OrderTracking order={selectedOrder} onBack={() => setSelectedOrder(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-30 w-80 glass-effect border-r border-white/10 lg:relative lg:translate-x-0"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-gradient">Order History</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {orders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-gray-400 mt-8"
                >
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No orders yet</p>
                  <p className="text-xs mt-1">Start shopping to see your order history</p>
                </motion.div>
              ) : (
                <>
                  {renderOrderSection(todayOrders, "Today", 0)}
                  {renderOrderSection(last7DaysOrders, "Last 7 Days", todayOrders.length)}
                  {renderOrderSection(olderOrders, "Earlier", todayOrders.length + last7DaysOrders.length)}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

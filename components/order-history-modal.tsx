"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  ChevronDown,
  CircleCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/types"

interface OrderHistoryModalProps {
  show: boolean
  onClose: () => void
  orders: Order[]
}

export function OrderHistoryModal({ show, onClose, orders }: OrderHistoryModalProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

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
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return Clock
      case "processing":
        return Package
      case "shipped":
        return Truck
      case "delivered":
        return CheckCircle
      case "cancelled":
        return AlertCircle
      default:
        return Clock
    }
  }

  const getTrackingSteps = (status: Order["status"]) => {
    const steps = [
      {
        id: "confirmed",
        label: "Order Confirmed",
        completed: true,
        icon: CircleCheck,
      },
      {
        id: "processing",
        label: "Processing",
        completed: status !== "cancelled" && status !== "pending",
        icon: Package,
      },
      {
        id: "shipped",
        label: "Shipped",
        completed: status === "shipped" || status === "delivered",
        icon: Truck,
      },
      {
        id: "delivered",
        label: "Delivered",
        completed: status === "delivered",
        icon: CheckCircle,
      },
    ]
    return steps
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{
            y: "100%",
            opacity: 0,
            scale: 1,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{
            y: "100%",
            opacity: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className="glass-effect w-full h-[90vh] md:h-auto md:max-h-[80vh] md:w-full md:max-w-4xl md:rounded-2xl overflow-hidden flex flex-col bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-gradient">Order History</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-black/80">
            <div className="p-4 md:p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500">Start shopping to see your order history here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status)
                    const isExpanded = expandedOrder === order.id
                    const trackingSteps = getTrackingSteps(order.status)

                    return (
                      <div key={order.id} className="glass-effect rounded-lg overflow-hidden bg-black/30">
                        {/* Order Header */}
                        <div
                          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg border ${getStatusColor(order.status)}`}>
                                <StatusIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-medium text-white">
                                  Order #{order.orderNumber || order.id.split("-").pop()}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <span>•</span>
                                  <span>{order.items.length} items</span>
                                  <span>•</span>
                                  <span className={getStatusColor(order.status).split(" ")[0]}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-bold text-white">KES {order.total.toLocaleString()}</p>
                              </div>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Order Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-white/10"
                            >
                              <div className="p-4 space-y-6 bg-black/20">
                                {/* Order Progress */}
                                <div>
                                  <h4 className="font-medium mb-4 flex items-center space-x-2 text-white">
                                    <Truck className="h-4 w-4 text-blue-400" />
                                    <span>Order Progress</span>
                                  </h4>
                                  <div className="relative">
                                    <div className="flex justify-between items-center mb-2">
                                      {trackingSteps.map((step, stepIndex) => {
                                        const StepIcon = step.icon
                                        return (
                                          <div key={step.id} className="flex flex-col items-center relative flex-1">
                                            <div
                                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                                step.completed
                                                  ? "bg-green-500 border-green-500 text-white"
                                                  : "bg-gray-700 border-gray-600 text-gray-400"
                                              }`}
                                            >
                                              <StepIcon className="h-4 w-4" />
                                            </div>
                                            {stepIndex < trackingSteps.length - 1 && (
                                              <div
                                                className={`absolute top-5 left-1/2 w-full h-0.5 transition-all ${
                                                  step.completed ? "bg-green-500" : "bg-gray-600"
                                                }`}
                                                style={{ transform: "translateX(-50%)", width: "calc(100% - 20px)" }}
                                              />
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                    <div className="flex justify-between mt-3">
                                      {trackingSteps.map((step) => (
                                        <div key={step.id} className="flex-1 text-center">
                                          <span
                                            className={`text-xs font-medium ${
                                              step.completed ? "text-green-400" : "text-gray-400"
                                            }`}
                                          >
                                            {step.label}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h4 className="font-medium mb-3 text-white">Items Ordered</h4>
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 glass-effect rounded-lg bg-white/5"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden">
                                            <img
                                              src={item.image || "/placeholder.svg?height=40&width=40"}
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          <div>
                                            <p className="font-medium text-sm text-white">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.category}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-medium text-white">Qty: {item.quantity}</p>
                                          <p className="text-sm text-green-400">
                                            KES {(item.price * item.quantity).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Delivery & Payment Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="glass-effect rounded-lg p-4 bg-white/5">
                                    <h5 className="font-medium mb-2 flex items-center space-x-2 text-white">
                                      <MapPin className="h-4 w-4 text-green-400" />
                                      <span>Delivery Address</span>
                                    </h5>
                                    <p className="text-sm text-gray-400">
                                      {order.deliveryAddress?.address || "Address not available"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Expected:{" "}
                                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "TBD"}
                                    </p>
                                  </div>
                                  <div className="glass-effect rounded-lg p-4 bg-white/5">
                                    <h5 className="font-medium mb-2 text-white">Payment Method</h5>
                                    <p className="text-sm text-gray-400">{order.paymentMethod || "M-Pesa"}</p>
                                    <p className="text-xs text-green-400 mt-1">
                                      {order.paymentStatus === "paid" ? "Payment Confirmed" : "Payment Pending"}
                                    </p>
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div className="glass-effect rounded-lg p-4 bg-blue-500/5 border border-blue-500/20">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-white">Order Total</span>
                                    <span className="text-lg font-bold text-blue-400">
                                      KES {order.total.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

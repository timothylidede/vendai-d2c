"use client"

import { motion } from "framer-motion"
import { Check, Clock, Truck, Package, MapPin, Phone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderTrackingProps {
  order: any
  onBack: () => void
}

export function OrderTracking({ order, onBack }: OrderTrackingProps) {
  const getProgressSteps = (status: string) => {
    const steps = [
      { id: "confirmed", label: "Order Confirmed", icon: Check, time: "2 mins ago" },
      { id: "preparing", label: "Preparing Order", icon: Package, time: "15 mins ago" },
      { id: "shipped", label: "Out for Delivery", icon: Truck, time: status === "shipped" ? "1 hour ago" : null },
      { id: "delivered", label: "Delivered", icon: MapPin, time: status === "completed" ? "30 mins ago" : null },
    ]

    const currentIndex = steps.findIndex((step) => {
      if (status === "processing") return step.id === "preparing"
      if (status === "shipped") return step.id === "shipped"
      if (status === "completed") return step.id === "delivered"
      return false
    })

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  const steps = getProgressSteps(order.status)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/10 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </motion.div>

      {/* Order Header */}
      <div className="glass-effect rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Order #{order.id.split("-").pop()}</h3>
            <p className="text-sm text-gray-400">
              Placed on{" "}
              {new Date(order.date).toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">KES {order.total.toLocaleString()}</p>
            <p className="text-sm text-gray-400">{order.items.length} items</p>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="glass-effect rounded-lg p-4 bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="font-medium text-blue-400">
                {order.status === "completed" ? "Delivered" : "Estimated Delivery"}
              </p>
              <p className="text-sm text-gray-300">
                {new Date(order.deliveryDate).toLocaleDateString("en-KE", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="glass-effect rounded-lg p-6">
        <h4 className="font-medium mb-6">Order Progress</h4>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div
                className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : step.active
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-gray-600 text-gray-400"
                }`}
              >
                <step.icon className="h-5 w-5" />
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-6 ${
                      step.completed ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />
                )}
              </div>

              <div className="flex-1">
                <p className={`font-medium ${step.completed ? "text-white" : "text-gray-400"}`}>{step.label}</p>
                {step.time && <p className="text-xs text-gray-500">{step.time}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Delivery Details */}
      <div className="glass-effect rounded-lg p-6">
        <h4 className="font-medium mb-4">Delivery Information</h4>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Delivery Address</p>
              <p className="text-sm text-gray-400">
                123 Nairobi Street, Westlands
                <br />
                Nairobi, 00100
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Contact Number</p>
              <p className="text-sm text-gray-400">+254 712 345 678</p>
            </div>
          </div>

          {order.status === "shipped" && (
            <div className="glass-effect rounded-lg p-4 bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">Driver: James Mwangi</p>
                  <p className="text-sm text-gray-300">Vehicle: KCA 123A</p>
                  <p className="text-sm text-gray-300">ETA: 15-20 minutes</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="glass-effect rounded-lg p-6">
        <h4 className="font-medium mb-4">Order Items</h4>

        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">KES {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

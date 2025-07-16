"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Clock, CheckCircle, Truck, MapPin, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Shared Types
import { Order, OrderItem } from "@/lib/types";

interface OrderHistoryModalProps {
  show: boolean;
  onClose: () => void;
  orders: Order[];
}

export function OrderHistoryModal({ show, onClose, orders }: OrderHistoryModalProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "text-yellow-400 bg-yellow-400/10";
      case "shipped": return "text-blue-400 bg-blue-400/10";
      case "completed": return "text-green-400 bg-green-400/10";
      case "cancelled": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return Clock;
      case "shipped": return Truck;
      case "completed": return CheckCircle;
      case "cancelled": return X;
      default: return Package;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "processing": return "Processing";
      case "shipped": return "Shipped";
      case "completed": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return "Unknown";
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { id: "confirmed", label: "Order Confirmed", completed: true },
      { id: "preparing", label: "Preparing", completed: status !== "cancelled" },
      { id: "shipped", label: "Shipped", completed: status === "shipped" || status === "completed" },
      { id: "delivered", label: "Delivered", completed: status === "completed" },
    ];
    return steps;
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold text-gradient">Orders</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const isExpanded = expandedOrder === order.id;
                  const trackingSteps = getTrackingSteps(order.status);

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect rounded-lg overflow-hidden"
                    >
                      {/* Order Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium">Order #{order.orderNumber || order.id.split("-").pop()}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span>•</span>
                                <span>{order.items.length} items</span>
                                <span>•</span>
                                <span className={getStatusColor(order.status).split(" ")[0]}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-bold">KES {order.total.toLocaleString()}</p>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
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
                            <div className="p-4 space-y-6">
                              {/* Order Progress */}
                              <div>
                                <h4 className="font-medium mb-4 flex items-center space-x-2">
                                  <Truck className="h-4 w-4" />
                                  <span>Order Progress</span>
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {trackingSteps.map((step, stepIndex) => (
                                    <div key={step.id} className="flex items-center">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          step.completed ? "bg-green-500" : "bg-gray-600"
                                        }`}
                                      />
                                      {stepIndex < trackingSteps.length - 1 && (
                                        <div
                                          className={`w-8 h-0.5 ${
                                            step.completed ? "bg-green-500" : "bg-gray-600"
                                          }`}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                  {trackingSteps.map((step) => (
                                    <span
                                      key={step.id}
                                      className={step.completed ? "text-green-400" : ""}
                                    >
                                      {step.label}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h4 className="font-medium mb-3">Items Ordered</h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between p-3 glass-effect rounded-lg"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                          <Package className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm">{item.name}</p>
                                          <p className="text-xs text-gray-400">{item.category}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium">Qty: {item.quantity}</p>
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
                                <div className="glass-effect rounded-lg p-4">
                                  <h5 className="font-medium mb-2 flex items-center space-x-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>Delivery Address</span>
                                  </h5>
                                  <p className="text-sm text-gray-400">{order.deliveryAddress.address}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Expected: {new Date(order.deliveryDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="glass-effect rounded-lg p-4">
                                  <h5 className="font-medium mb-2">Payment Method</h5>
                                  <p className="text-sm text-gray-400">{order.paymentMethod}</p>
                                  <p className="text-xs text-green-400 mt-1">Payment Confirmed</p>
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="glass-effect rounded-lg p-4 bg-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Order Total</span>
                                  <span className="text-lg font-bold text-blue-400">
                                    KES {order.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
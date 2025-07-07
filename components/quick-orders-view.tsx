"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Zap, ShoppingBag, RotateCcw, Star, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickOrdersViewProps {
  products: any[]
  orders: any[]
  onAddToCart: (product: any) => void
  onReorder: (items: any[]) => void
  onBack: () => void
}

export function QuickOrdersView({ products, orders, onAddToCart, onReorder, onBack }: QuickOrdersViewProps) {
  // Safety check to ensure products is an array
  const safeProducts = Array.isArray(products) ? products : []

  // Update the essential products filter to prioritize actual essentials and avoid the single-unit bulk items
  const essentialProducts = safeProducts
    .filter(
      (product) =>
        // Prioritize smaller unit items that are daily essentials
        (product.category.includes("Flour") && product.price < 100) ||
        (product.category.includes("Cooking Oils") && product.price < 300) ||
        (product.category.includes("Sugar") && product.price < 500) ||
        product.category.includes("Personal Care") ||
        product.category.includes("Cleaning") ||
        (product.category.includes("Dairy") && product.price < 500),
    )
    .slice(0, 6)

  // Get affordable products (under KES 200)
  const affordableProducts = safeProducts.filter((product) => product.price < 200).slice(0, 4)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-white/10 p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/10 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-bold text-gradient">Quick Orders</h2>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Essential Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Essential Items</h3>
              <p className="text-sm text-gray-400">Kitchen basics you need most</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {essentialProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddToCart(product)}
                className="glass-effect rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center group-hover:from-white/30 group-hover:to-white/20 transition-all">
                    <ShoppingBag className="h-6 w-6 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.brand || product.category.split(" ")[0]}</p>
                    <p className="font-bold text-green-400">KES {product.price.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Budget Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Budget Friendly</h3>
              <p className="text-sm text-gray-400">Great value under KES 200</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {affordableProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddToCart(product)}
                className="glass-effect rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">KES {product.price.toLocaleString()}</p>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Great Deal</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Recent Orders</h3>
              <p className="text-sm text-gray-400">Reorder your favorites</p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="glass-effect rounded-xl p-4 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                      <RotateCcw className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">Order #{order.id.split("-").pop()}</span>
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          {new Date(order.date).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.items.length} items • KES {order.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items
                          .slice(0, 2)
                          .map((item) => item.name)
                          .join(", ")}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={() => onReorder(order.items)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reorder
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

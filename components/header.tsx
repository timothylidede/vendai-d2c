"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Package, MessageSquare, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem, Order } from "@/lib/types"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  chatHistoryOpen: boolean
  setChatHistoryOpen: (open: boolean) => void
  cart: CartItem[]
  setShowCart: (show: boolean) => void
  showOrderHistory: boolean
  setShowOrderHistory: (show: boolean) => void
  orders: Order[]
  onLogout: () => void
  onLogin: () => void // Re-added
  onSignup: () => void // Re-added
  onBackToChat: () => void
  user: any
  isAuthenticated: boolean
  onSettings: () => void
  showCartAdded: boolean // NEW PROP - Re-added
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  chatHistoryOpen,
  setChatHistoryOpen,
  cart,
  setShowCart,
  showOrderHistory,
  setShowOrderHistory,
  orders,
  onLogout,
  onLogin, // Re-added
  onSignup, // Re-added
  onBackToChat,
  user,
  isAuthenticated,
  onSettings,
  showCartAdded, // NEW PROP - Re-added
}: HeaderProps) {
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const userName = user?.name || "Guest"
  const recentOrder = orders.length > 0 ? orders[0] : null // Re-added recentOrder

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b border-white/5 p-4 relative z-40"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Mobile Chat History Toggle - Only show when authenticated */}
          {isAuthenticated && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
                className="hover:bg-white/5 transition-colors rounded-lg h-10 w-10"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          {/* Desktop Chat History Toggle - Only show when authenticated */}
          {isAuthenticated && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
                className="hover:bg-white/5 transition-colors rounded-lg h-10 w-10"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          {/* VendAI Clickable Logo (visible only on large screens) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToChat}
            className="hidden lg:flex items-center hover:opacity-80 transition-opacity"
          >
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-light">
                vend
              </span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-black">
                ai
              </span>
            </h1>
          </motion.button>
        </div>
        <div className="flex items-center space-x-2">
          {!isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={onLogin} // Restored onClick
                className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm transition-all duration-200 rounded-lg px-4 py-2 flex items-center space-x-2 font-medium"
              >
                {/* Google icon SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Order History */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderHistory(!showOrderHistory)}
                  className="relative hover:bg-white/5 transition-colors rounded-lg"
                >
                  <Package className="h-4 w-4" />
                  {orders.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white flex items-center justify-center text-xs font-bold"
                    >
                      {orders.length}
                    </motion.div>
                  )}
                </Button>
              </motion.div>
              {/* Cart */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(true)}
                  className="relative hover:bg-white/5 transition-colors rounded-lg"
                  data-cart-button // Added data attribute for animation
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {totalCartItems}
                    </span>
                  )}
                </Button>
                <AnimatePresence>
                  {showCartAdded && ( // Animation for cart added
                    <motion.span
                      initial={{ opacity: 0, y: 10, x: -5 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, y: -10, x: 5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-green-400 whitespace-nowrap"
                    >
                      +1 Added!
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              {/* Order History Modal */}
              <AnimatePresence>
                {showOrderHistory && recentOrder && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="fixed right-4 top-16 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-50"
                  >
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg text-white">Recent Order</h3>
                      {recentOrder ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-200">
                              Order #{recentOrder.id.split("-").pop()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {recentOrder.date
                                ? new Date(recentOrder.date).toLocaleDateString("en-KE", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{recentOrder.items.length} items</span>
                            <span className="font-bold text-green-400">KES {recentOrder.total.toLocaleString()}</span>
                          </div>
                          {recentOrder.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{item.name}</span>
                              <span className="text-gray-400">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-4">No recent order</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

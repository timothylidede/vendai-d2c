"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, MessageSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
  cart: any[];
  setShowCart: (show: boolean) => void;
  showOrderHistory: boolean;
  setShowOrderHistory: (show: boolean) => void;
  orders: any[];
  onSettings: () => void;
  onLogout: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onBackToChat: () => void;
  user: any;
  isAuthenticated: boolean;
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
  onSettings,
  onLogout,
  onLogin,
  onSignup,
  onBackToChat,
  user,
  isAuthenticated,
}: HeaderProps) {
  const recentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b border-white/5 p-4 relative z-40"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Mobile Chat History Toggle */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
              className="hover:bg-white/5 transition-colors rounded-lg h-10 w-10"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Desktop Chat History Toggle */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
              className="hover:bg-white/5 transition-colors rounded-lg h-10 w-10"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </motion.div>

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
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onLogin} className="hover:bg-white/5 text-sm rounded-lg">
                Login
              </Button>
              <Button
                size="sm"
                onClick={onSignup}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 text-sm rounded-lg"
              >
                Sign Up
              </Button>
            </div>
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
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cart.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-xs font-bold"
                    >
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </motion.div>
                  )}
                </Button>
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
                            <span className="font-medium text-sm text-gray-200">Order #{recentOrder.id.split("-").pop()}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(recentOrder.date).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
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
  );
}
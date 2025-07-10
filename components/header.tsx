"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Settings, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
  cart: any[];
  setShowCart: (show: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  showOrderHistory: boolean;
  setShowOrderHistory: (show: boolean) => void;
  orders: any[];
  onSettings: () => void;
  onLogout: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onBackToChat: () => void;
  user: any; // userData from Firestore (via useAuth)
  isAuthenticated: boolean;
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  chatHistoryOpen,
  setChatHistoryOpen,
  cart,
  setShowCart,
  showProfile,
  setShowProfile,
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
  // Safely extract user data from Firestore userData
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })
    : "Jan 2024";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b border-white/5 p-4 relative z-40"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* VendAI Clickable Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToChat}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-light">vend</span>
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

              {/* Profile */}
              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(!showProfile)}
                    className="hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-12 w-64 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-50"
                    >
                      <div className="space-y-4">
                        <div className="border-b border-white/10 pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{userName}</p>
                              <p className="text-xs text-gray-400">{userEmail}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Total Orders</span>
                            <span className="font-medium">{orders.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Total Spent</span>
                            <span className="font-medium">
                              KES {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Member Since</span>
                            <span className="font-medium">{memberSince}</span>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-3 space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start hover:bg-white/5 rounded-lg"
                            onClick={onSettings}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start hover:bg-white/5 text-red-400 rounded-lg"
                            onClick={onLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order History Dropdown */}
              <AnimatePresence>
                {showOrderHistory && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-20 top-16 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-50"
                  >
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Recent Orders</h3>
                      {orders.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {orders.slice(0, 5).map((order, index) => (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="glass-effect rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">Order #{order.id.split("-").pop()}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(order.date).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{order.items.length} items</span>
                                <span className="font-bold text-green-400">KES {order.total.toLocaleString()}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
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
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, ShoppingCart, User, Settings, LogOut, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  chatHistoryOpen: boolean
  setChatHistoryOpen: (open: boolean) => void
  cart: any[]
  setShowCart: (show: boolean) => void
  showProfile: boolean
  setShowProfile: (show: boolean) => void
  orders: any[]
  onSettings: () => void
  onLogout: () => void
  onLogin: () => void
  onSignup: () => void
  user: any
  isAuthenticated: boolean
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
  orders,
  onSettings,
  onLogout,
  onLogin,
  onSignup,
  user,
  isAuthenticated,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-effect border-b border-white/10 p-4 relative z-40"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-white/10 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl font-bold">
            <span className="text-gradient">vend</span>
            <span className="text-gradient font-black">ai</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {!isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onLogin} className="hover:bg-white/10 text-sm">
                Login
              </Button>
              <Button size="sm" onClick={onSignup} className="bg-white text-black hover:bg-gray-200 text-sm">
                Sign Up
              </Button>
            </div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
                  className="hover:bg-white/10 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(true)}
                  className="relative hover:bg-white/10 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cart.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold"
                    >
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(!showProfile)}
                    className="hover:bg-white/10 transition-colors"
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
                      className="absolute right-0 top-12 w-64 glass-effect rounded-lg border border-white/10 p-4 z-50"
                    >
                      <div className="space-y-4">
                        <div className="border-b border-white/10 pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{user?.name || "John Doe"}</p>
                              <p className="text-xs text-gray-400">{user?.email || "john.doe@email.com"}</p>
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
                            <span className="font-medium">Jan 2024</span>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-3 space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start hover:bg-white/10"
                            onClick={onSettings}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start hover:bg-white/10 text-red-400"
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
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, User, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginPromptModalProps {
  show: boolean
  onClose: () => void
  onLogin: () => void
  onSignup: () => void
}

export function LoginPromptModal({ show, onClose, onLogin, onSignup }: LoginPromptModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-effect rounded-2xl p-8 w-full max-w-md border border-white/20 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur-xl"
              />
            </div>

            <div className="relative z-10">
              {/* Icon Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                  >
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-900" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ready to Shop?
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sign in to add items to your cart and enjoy seamless shopping with AI assistance
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={onLogin}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 font-medium shadow-lg shadow-blue-500/25 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Continue browsing
                  </Button>
                </motion.div>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>AI Shopping Assistant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Order Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Quick Reorders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Best Prices</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

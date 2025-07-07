"use client"

import { motion } from "framer-motion"
import { Grid3X3, Zap, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductShortcuts } from "./product-shortcuts"

interface ChatViewProps {
  messages: any[]
  input: string
  handleInputChange: (e: any) => void
  handleSubmit: (e: any) => void
  isLoading: boolean
  products: any[]
  onQuickAdd: (product: any) => void
  onViewAll: () => void
  setCurrentView: (view: string) => void
  onBackToMain: () => void
  showBackButton?: boolean
}

export function ChatView({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  products,
  onQuickAdd,
  onViewAll,
  setCurrentView,
  onBackToMain,
  showBackButton = false,
}: ChatViewProps) {
  return (
    <>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showBackButton && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
            <Button variant="ghost" size="sm" onClick={onBackToMain} className="hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
          </motion.div>
        )}

        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-8 md:py-12"
          >
            <div className="max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  vend<span className="text-white">ai</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                  AI shopping assistant for premium FMCG at manufacturing prices
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView("browse")}
                  className="glass-effect rounded-lg p-4 cursor-pointer transition-all duration-300 border border-blue-500/20 hover:border-blue-500/30"
                >
                  <Grid3X3 className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Browse</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView("quickOrders")}
                  className="glass-effect rounded-lg p-4 cursor-pointer transition-all duration-300 border border-green-500/20 hover:border-green-500/30"
                >
                  <Zap className="h-5 w-5 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Quick Orders</p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500 mb-3">Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Show cooking essentials", "Household items", "What's available?"].map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                      onClick={() => {
                        handleInputChange({ target: { value: suggestion } })
                      }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-300 ${
                message.role === "user" ? "bg-white text-black shadow-lg" : "glass-effect hover:bg-white/10"
              }`}
            >
              <p className="text-sm leading-relaxed">
                {message.content.replace(/ADD_TO_CART:.*|VIEW_CART|CHECKOUT/g, "").trim()}
              </p>
            </motion.div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-effect px-4 py-3 rounded-2xl">
              <div className="flex space-x-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area with Product Shortcuts */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-effect border-t border-white/10 p-4 space-y-4"
      >
        {/* Quick Product Access - Only 3 items + View All */}
        <ProductShortcuts products={products} onQuickAdd={onQuickAdd} onViewAll={onViewAll} />

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about products or tell me what you need..."
            className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-white/20 focus:bg-white/10 transition-all duration-300"
            disabled={isLoading}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-white text-black hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </>
  )
}

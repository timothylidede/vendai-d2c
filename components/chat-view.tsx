"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Send, User, Bot, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductShortcuts } from "./product-shortcuts"
import { ProductCardResponse } from "./product-card-response"
import { useState, useEffect } from "react"
import type { Product, Message } from "@/lib/types"

interface ChatViewProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  products: Product[]
  onQuickAdd: (product: Product) => void
  onViewAll: () => void
  setCurrentView: (view: string) => void
  onBackToMain: () => void
  showBackButton?: boolean
  isInSubView?: boolean
  chatHistoryMinimized: boolean
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
  isInSubView = false,
  chatHistoryMinimized,
}: ChatViewProps) {
  const welcomeMessages = ["Niaje.", "Twende.", "What do you want to get?", "#Wantam."]
  const [randomMessage, setRandomMessage] = useState("")
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const storedMessage = localStorage.getItem("vendai_welcome_message")
    const storedTimestamp = localStorage.getItem("vendai_welcome_message_timestamp")
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

    if (messages.length === 0) {
      if (storedMessage && storedTimestamp && now - Number.parseInt(storedTimestamp, 10) < fiveMinutes) {
        // Use stored message if it's recent
        setRandomMessage(storedMessage)
      } else {
        // Generate new message if no stored message or it's old
        const randomIndex = Math.floor(Math.random() * welcomeMessages.length)
        const newMessage = welcomeMessages[randomIndex]
        setRandomMessage(newMessage)
        localStorage.setItem("vendai_welcome_message", newMessage)
        localStorage.setItem("vendai_welcome_message_timestamp", now.toString())
      }
    } else {
      // Clear stored message if chat is active
      localStorage.removeItem("vendai_welcome_message")
      localStorage.removeItem("vendai_welcome_message_timestamp")
    }
  }, [messages.length, welcomeMessages])

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e)
      }
    }
  }

  const renderMessage = (message: Message, index: number) => {
    if (message.role === "user") {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex justify-end mb-4 md:mb-8 w-full"
        >
          <div className="flex items-start space-x-2 md:space-x-3 max-w-[80%] md:max-w-[70%]">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-lg"
            >
              <p className="leading-relaxed text-sm md:text-base">{message.content}</p>
            </motion.div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </div>
        </motion.div>
      )
    }

    // AI Response
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex justify-start mb-4 md:mb-8 w-full"
      >
        <div className="flex items-start space-x-2 md:space-x-3 max-w-[80%] md:max-w-[70%]">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <div className="flex-1 space-y-4 min-w-0">
            {message.products && message.products.length > 0 ? (
              <div className="w-full overflow-hidden">
                <ProductCardResponse
                  products={message.products}
                  onAddToCart={onQuickAdd}
                  explanation={message.content}
                />
              </div>
            ) : (
              <div className="text-gray-300 leading-relaxed text-sm md:text-base">
                <p>{message.content}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const shouldShowChatInput = messages.length > 0 || !isLargeScreen

  return (
    <div className="flex-1 flex flex-col h-full relative transition-all duration-300 overflow-hidden">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-8 custom-scrollbar">
        {/* Back to Main Button - Only show when needed */}
        {(showBackButton || isInSubView) && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 md:mb-6">
            <Button variant="ghost" size="sm" onClick={onBackToMain} className="hover:bg-white/5 rounded-lg text-sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
          </motion.div>
        )}

        <div className="mt-10">
          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6 md:mb-8"
              >
                {/* Greeting with Glow Effect */}
                <motion.h1
                  className="text-xl md:text-2xl lg:text-3xl font-extralight mb-4 relative"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(168, 85, 247, 0.5)",
                      "0 0 20px rgba(168, 85, 247, 0.8)",
                      "0 0 10px rgba(168, 85, 247, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <span className="text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {randomMessage}
                  </span>
                </motion.h1>
              </motion.div>
              {/* Desktop Chat Input - Hidden on mobile */}
              {isLargeScreen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-2xl mb-8"
                >
                  {/* Grok-style Chat Input */}
                  <div className="relative">
                    <form onSubmit={handleSubmit} className="relative">
                      <motion.div
                        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 py-3 px-4 shadow-2xl relative"
                        animate={{
                          boxShadow: [
                            "0 0 0 1px rgba(168, 85, 247, 0.2)",
                            "0 0 0 2px rgba(168, 85, 247, 0.4)",
                            "0 0 0 1px rgba(168, 85, 247, 0.2)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      >
                        <div className="flex flex-col space-y-3">
                          <div className="flex-1">
                            <textarea
                              value={input}
                              onChange={handleInputChange}
                              onKeyPress={handleKeyPress}
                              placeholder="Ask me about products..."
                              className="bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 focus:border-0 focus:outline-none resize-none text-base h-auto p-0 shadow-none w-full min-h-[1.5rem] max-h-[9rem] overflow-y-auto custom-scrollbar"
                              disabled={isLoading}
                              rows={1}
                              style={{
                                height: "auto",
                                minHeight: "2.5rem",
                                maxHeight: "12rem",
                              }}
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = "auto"
                                target.style.height = Math.min(target.scrollHeight, 144) + "px"
                              }}
                              maxLength={1000}
                            />
                          </div>
                          <div className="flex justify-end">
                            {/* Submit Button */}
                            <motion.button
                              type="submit"
                              disabled={isLoading || !input.trim()}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 rounded-xl px-4 py-2 transition-all duration-200 flex items-center justify-center min-w-[40px]"
                            >
                              <Send className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </form>
                  </div>
                </motion.div>
              )}
              {/* Product Shortcuts - Only show when no messages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-3xl mb-8 overflow-hidden"
              >
                <ProductShortcuts products={products} onQuickAdd={onQuickAdd} onViewAll={onViewAll} />
              </motion.div>
            </div>
          )}
        </div>
        {/* Chat Messages with Better Spacing */}
        <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-8 pb-4 md:pb-24">
          {messages.map((message, index) => renderMessage(message, index))}
        </div>
        {/* Loading Animation */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4 md:mb-8">
            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <div className="flex space-x-2 mt-2">
                <motion.div
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Chat Input Area - Fixed at bottom with transparent background */}
      {shouldShowChatInput && (
        <div className="flex-shrink-0 z-30 transition-all duration-300 bg-transparent px-3 md:px-4">
          <div className="max-w-3xl mx-auto p-3 md:p-4">
            {/* Grok-style Chat Input */}
            <div className="relative">
              <form onSubmit={handleSubmit} className="relative">
                <motion.div
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 py-3 px-4 shadow-2xl relative"
                  animate={{
                    boxShadow: [
                      "0 0 0 1px rgba(168, 85, 247, 0.2)",
                      "0 0 0 2px rgba(168, 85, 247, 0.4)",
                      "0 0 0 1px rgba(168, 85, 247, 0.2)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex-1">
                      <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={messages.length === 0 ? "Ask anything" : "Ask me about products..."}
                        className="bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 focus:border-0 focus:outline-none resize-none text-sm md:text-base h-auto p-0 shadow-none w-full min-h-[1.5rem] max-h-[9rem] overflow-y-auto custom-scrollbar"
                        disabled={isLoading}
                        rows={1}
                        style={{
                          height: "auto",
                          minHeight: "2.5rem",
                          maxHeight: "12rem",
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement
                          target.style.height = "auto"
                          target.style.height = Math.min(target.scrollHeight, 144) + "px"
                        }}
                        maxLength={1000}
                      />
                    </div>
                    <div className="flex justify-end">
                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 rounded-xl px-3 md:px-4 py-1.5 md:py-2 transition-all duration-200 flex items-center justify-center min-w-[36px] md:min-w-[40px]"
                      >
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

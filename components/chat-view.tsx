"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Send, User, Bot, Home, Settings, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCardResponse } from "./product-card-response"
import { useState, useEffect, useRef, useCallback } from "react"
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
  searchMode: "fast" | "deep"
  setSearchMode: (mode: "fast" | "deep") => void
}

// Fixed Typing animation component
function TypingText({ text, messageId, onComplete }: { text: string; messageId: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    if (text.length > 200) {
      setDisplayedText(text)
      onComplete?.()
      return
    }

    setDisplayedText("")
    let index = 0
    const type = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        setTimeout(type, 15)
      } else {
        onComplete?.()
      }
    }
    type()
  }, [text, messageId, onComplete])

  return <span>{displayedText}</span>
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
  searchMode,
  setSearchMode,
}: ChatViewProps) {
  // Original welcome messages restored
  const welcomeMessages = ["Niaje.", "Twende.", "What do you want to get?", "#Wantam."]
  const [randomMessage, setRandomMessage] = useState("")
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [typedMessages, setTypedMessages] = useState<Set<string>>(new Set())
  const [showTools, setShowTools] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastProcessedMessageCountRef = useRef(0)
  const toolsRef = useRef<HTMLDivElement>(null)

  // Enhanced auto-scroll function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        })
      })
    }
  }, [])

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Track new AI messages for typing animation
  useEffect(() => {
    if (messages.length > lastProcessedMessageCountRef.current) {
      const newMessages = messages.slice(lastProcessedMessageCountRef.current)
      for (let i = newMessages.length - 1; i >= 0; i--) {
        const message = newMessages[i]
        if (message.role === "assistant" && !typedMessages.has(message.id)) {
          setTypingMessageId(message.id)
          break
        }
      }
      lastProcessedMessageCountRef.current = messages.length
    }
  }, [messages.length, typedMessages])

  // Welcome message management
  useEffect(() => {
    const storedMessage = localStorage.getItem("vendai_welcome_message")
    const storedTimestamp = localStorage.getItem("vendai_welcome_message_timestamp")
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    if (messages.length === 0) {
      if (storedMessage && storedTimestamp && now - Number.parseInt(storedTimestamp, 10) < fiveMinutes) {
        setRandomMessage(storedMessage)
      } else {
        const randomIndex = Math.floor(Math.random() * welcomeMessages.length)
        const newMessage = welcomeMessages[randomIndex]
        setRandomMessage(newMessage)
        localStorage.setItem("vendai_welcome_message", newMessage)
        localStorage.setItem("vendai_welcome_message_timestamp", now.toString())
      }
    } else {
      localStorage.removeItem("vendai_welcome_message")
      localStorage.removeItem("vendai_welcome_message_timestamp")
    }
  }, [messages.length, welcomeMessages])

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Close tools dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowTools(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e)
        setTimeout(scrollToBottom, 50)
      }
    }
  }

  // Enhanced form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      handleSubmit(e)
      setTimeout(scrollToBottom, 50)
    }
  }

  // Callback to handle typing completion
  const handleTypingComplete = useCallback((messageId: string) => {
    setTypedMessages((prev) => new Set([...prev, messageId]))
    setTypingMessageId(null)
  }, [])

  const renderMessage = (message: Message, index: number) => {
    const isTyping = typingMessageId === message.id && !typedMessages.has(message.id)
    const shouldShowProducts = message.products && Array.isArray(message.products) && message.products.length > 0

    if (message.role === "user") {
      return (
        <div key={message.id} className="flex justify-end mb-4 md:mb-6 w-full">
          <div className="flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-[75%]">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-lg order-1">
              <p className="leading-relaxed text-sm md:text-base break-words">{message.content}</p>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 order-2">
              <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className="flex justify-start mb-4 md:mb-6 w-full">
        <div className="flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-[75%]">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <div className="flex-1 space-y-4 min-w-0">
            <div className="text-gray-300 leading-relaxed text-sm md:text-base">
              <p className="break-words whitespace-pre-wrap">
                {isTyping ? (
                  <TypingText
                    text={message.content}
                    messageId={message.id}
                    onComplete={() => handleTypingComplete(message.id)}
                  />
                ) : (
                  message.content
                )}
              </p>
            </div>
            {/* Show products after typing completes OR immediately if not typing */}
            {shouldShowProducts && (!isTyping || typedMessages.has(message.id)) && (
              <div className="w-full overflow-hidden">
                <ProductCardResponse products={message.products ?? []} onAddToCart={onQuickAdd} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const shouldShowChatInput = messages.length > 0 || !isLargeScreen

  const renderChatInput = () => (
    <div className="relative">
      <form onSubmit={handleFormSubmit} className="relative">
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
            {/* Input Area */}
            <div className="flex-1">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about products..."
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
            {/* Bottom Controls */}
            <div className="flex justify-between items-center">
              {/* Tools Section - Left */}
              <div className="relative flex items-center space-x-2" ref={toolsRef}>
                <motion.button
                  type="button"
                  onClick={() => setShowTools(!showTools)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 rounded-xl px-2 py-1 transition-all duration-200 flex items-center space-x-1 text-xs border border-purple-500/30"
                >
                  <Settings className="h-3 w-3" />
                  <span className="hidden sm:inline">Tools</span>
                </motion.button>
                {/* Search Mode Indicator */}
                <div className="text-xs text-gray-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-lg border border-purple-500/30">
                  {searchMode === "fast" ? (
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>Fast</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Search className="h-3 w-3" />
                      <span>Deep</span>
                    </div>
                  )}
                </div>
                {/* Tools Dropdown */}
                {showTools && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 left-0 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl py-2 min-w-[200px] z-50"
                  >
                    <div className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-700/50">
                      Search Mode
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchMode("fast")
                        setShowTools(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-700/50 transition-colors flex items-center space-x-3 ${
                        searchMode === "fast" ? "text-pink-400 bg-gray-700/30" : "text-gray-300"
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                      <div>
                        <div className="text-sm">Fast search</div>
                        <div className="text-xs text-gray-500">Quick responses</div>
                      </div>
                      {searchMode === "fast" && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchMode("deep")
                        setShowTools(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-700/50 transition-colors flex items-center space-x-3 ${
                        searchMode === "deep" ? "text-pink-400 bg-gray-700/30" : "text-gray-300"
                      }`}
                    >
                      <Search className="h-4 w-4" />
                      <div>
                        <div className="text-sm">Deep search</div>
                        <div className="text-xs text-gray-500">AI-enhanced analysis</div>
                      </div>
                      {searchMode === "deep" && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
              {/* Send Button - Right */}
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
  )

  return (
    <div className="flex-1 flex flex-col h-full relative transition-all duration-300 overflow-hidden">
      {/* Main Content Area - Scrollable */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-8 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
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
                  {renderChatInput()}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="w-full max-w-4xl mx-auto space-y-2 md:space-y-4 pb-4 md:pb-24">
          {messages.map((message, index) => renderMessage(message, index))}
          {/* Loading Animation */}
          {isLoading && (
            <div className="flex justify-start mb-4 md:mb-6">
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
            </div>
          )}
          {/* Invisible div for scrolling */}
          <div ref={messagesEndRef} style={{ height: "1px" }} />
        </div>
      </div>

      {/* Chat Input Area - Fixed at bottom */}
      {shouldShowChatInput && (
        <div className="flex-shrink-0 z-30 transition-all duration-300 bg-transparent px-3 md:px-4">
          <div className="max-w-4xl mx-auto p-3 md:p-4">{renderChatInput()}</div>
        </div>
      )}
    </div>
  )
}

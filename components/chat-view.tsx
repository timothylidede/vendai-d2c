"use client";

import { motion } from "framer-motion";
import { Grid3X3, Zap, Send, Home, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductShortcuts } from "./product-shortcuts";
import { ProductCardResponse } from "./product-card-response";
import { useState, useEffect } from "react";

interface ChatViewProps {
  messages: any[];
  input: string;
  handleInputChange: (e: any) => void;
  handleSubmit: (e: any) => void;
  isLoading: boolean;
  products: any[];
  onQuickAdd: (product: any) => void;
  onViewAll: () => void;
  setCurrentView: (view: string) => void;
  onBackToMain: () => void;
  showBackButton?: boolean;
  isInSubView?: boolean;
  chatHistoryMinimized: boolean;
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
  const welcomeMessages = [
    "Niaje.",
    "Twende.",
    "#Wantam",
    "What do you want to get?",
  ];
  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    if (messages.length === 0) {
      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      setRandomMessage(welcomeMessages[randomIndex]);
    }
  }, [messages.length]);

  const renderMessage = (message: any, index: number) => {
    if (message.role === "user") {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex justify-end mb-4 md:mb-8"
        >
          <div className="flex items-start space-x-2 md:space-x-3 max-w-xl md:max-w-2xl">
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
      );
    }

    // AI Response
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex justify-start mb-4 md:mb-8"
      >
        <div className="flex items-start space-x-2 md:space-x-3 max-w-full md:max-w-4xl w-full">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <div className="flex-1 space-y-4">
            {message.products && message.products.length > 0 ? (
              <ProductCardResponse products={message.products} onAddToCart={onQuickAdd} explanation={message.content} />
            ) : (
              <div className="text-gray-300 leading-relaxed text-sm md:text-base">
                <p>{message.content}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] relative transition-all duration-300">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto scrollbar-hide chat-scroll pb-4 md:pb-0">
        <div className="max-w-5xl w-full px-3 md:px-4 py-4 md:py-8 transition-all duration-300">
          {/* Back to Main Button - Only show when needed */}
          {(showBackButton || isInSubView) && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 md:mb-6">
              <Button variant="ghost" size="sm" onClick={onBackToMain} className="hover:bg-white/5 rounded-lg text-sm">
                <Home className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
            </motion.div>
          )}

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6 md:mb-8"
              >
                {/* Greeting */}
                <h1 className="text-xl md:text-2xl lg:text-3xl font-light mb-4">
                  <span className="text-white">{randomMessage}</span>
                </h1>
              </motion.div>

              {/* Desktop Chat Input - Hidden on mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="hidden md:block w-full max-w-3xl mb-8"
              >
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me about products..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 rounded-xl h-12 text-sm md:text-base"
                    disabled={isLoading}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 rounded-xl h-12 px-4 md:px-6"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </form>
              </motion.div>

              {/* Product Shortcuts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-3xl mb-8"
              >
                <ProductShortcuts products={products} onQuickAdd={onQuickAdd} onViewAll={onViewAll} />
              </motion.div>
            </div>
          )}

          {/* Chat Messages with Better Spacing */}
          {messages.length > 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh]">
              <div className="w-full max-w-5xl space-y-4 md:space-y-8 pb-4 md:pb-24">
                {messages.map((message, index) => renderMessage(message, index))}
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4 md:mb-8 pb-4 md:pb-24">
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
      </div>

      {/* Chat Input Area - Sticky Bottom for all screens, hidden on desktop when no messages */}
      {(messages.length > 0 || window.innerWidth < 768) && (
        <div
          className="border-t border-white/5 bg-black/50 backdrop-blur-xl sticky bottom-0 z-30 transition-all duration-300"
          style={{
            marginLeft: window.innerWidth >= 768 ? (chatHistoryMinimized ? "64px" : "320px") : "0",
          }}
        >
          <div className="max-w-3xl mx-auto p-3 md:p-4 space-y-3">
            {/* Chat Input - Always visible when messages exist or on mobile */}
            <form onSubmit={handleSubmit} className="flex space-x-2 md:space-x-3">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={messages.length === 0 ? "Ask me about products..." : "Ask me about products or tell me what you need..."}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 rounded-xl text-sm md:text-base h-11 md:h-12"
                disabled={isLoading}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 rounded-xl px-3 md:px-4 lg:px-6 h-11 md:h-12"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </form>

            {/* Miniaturized Quick Product Access - Only when there are messages and hidden on mobile */}
            {messages.length > 0 && (
              <div className="hidden sm:block">
                <ProductShortcuts products={products} onQuickAdd={onQuickAdd} onViewAll={onViewAll} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
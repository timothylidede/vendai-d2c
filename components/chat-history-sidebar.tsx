"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Plus, ChevronLeft, X, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  date: string
}

interface ChatHistorySidebarProps {
  chatSessions: ChatSession[]
  currentSessionId: string
  onLoadSession: (sessionId: string) => void
  onNewChat: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  user: any
  orders: any[]
  onSettings: () => void
  onLogout: () => void
  isAuthenticated: boolean
}

export function ChatHistorySidebar({
  chatSessions,
  currentSessionId,
  onLoadSession,
  onNewChat,
  isOpen,
  setIsOpen,
  user,
  orders,
  onSettings,
  onLogout,
  isAuthenticated,
}: ChatHistorySidebarProps) {
  const [showProfile, setShowProfile] = useState(false)

  // Safely extract user data from Firestore userData
  const userName = user?.name || "User"
  const userEmail = user?.email || ""
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })
    : "Jan 2024"

  const categorizeChats = (sessions: ChatSession[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayChats = sessions.filter((session) => new Date(session.date) >= today)
    const yesterdayChats = sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return sessionDate >= yesterday && sessionDate < today
    })
    const last7DaysChats = sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return sessionDate >= sevenDaysAgo && sessionDate < yesterday
    })
    const olderChats = sessions.filter((session) => new Date(session.date) < sevenDaysAgo)

    return { todayChats, yesterdayChats, last7DaysChats, olderChats }
  }

  const { todayChats, yesterdayChats, last7DaysChats, olderChats } = categorizeChats(chatSessions)

  const handleSessionLoad = (sessionId: string) => {
    onLoadSession(sessionId)
    // Auto-close on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const handleNewChat = () => {
    onNewChat()
    // Auto-close on mobile after creating new chat
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const renderChatSection = (sectionChats: ChatSession[], title: string) => {
    if (sectionChats.length === 0) return null
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">{title}</h3>
        <div className="space-y-2">
          {sectionChats.map((session) => (
            <div // Removed motion.div and its animation props
              key={session.id}
              className={`glass-effect rounded-xl p-3 hover-glow cursor-pointer hover:bg-white/5 transition-all duration-300 ${
                currentSessionId === session.id ? "border border-purple-500/30 bg-purple-500/10" : ""
              }`}
              onClick={() => handleSessionLoad(session.id)}
            >
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {session.messages.length} message{session.messages.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(session.date).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: isOpen ? 0 : -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden md:block fixed inset-y-0 left-0 z-30 w-80 glass-effect border-r border-white/10"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-gradient">Chat History</h2>
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewChat}
                  className="hover:bg-white/10 rounded-xl h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 rounded-xl h-10 w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
            {chatSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-400 h-full flex flex-col items-center justify-center space-y-3"
              >
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No chat history yet</p>
                <p className="text-xs mt-1">Start a conversation to see your chat history</p>
              </motion.div>
            ) : (
              <>
                {renderChatSection(todayChats, "Today")}
                {renderChatSection(yesterdayChats, "Yesterday")}
                {renderChatSection(last7DaysChats, "Last 7 Days")}
                {renderChatSection(olderChats, "Earlier")}
              </>
            )}
          </div>
          <div className="border-t border-white/10 p-4">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={isAuthenticated ? () => setShowProfile(!showProfile) : handleNewChat}
                  className={`w-full ${
                    isAuthenticated
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-white text-black hover:bg-gray-200"
                  } transition-all duration-300 rounded-xl h-12 text-base`}
                >
                  {isAuthenticated ? (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </>
                  )}
                </Button>
              </motion.div>
              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-50"
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
          </div>
        </div>
      </motion.div>

      {/* Mobile/Tablet Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-80 glass-effect border-r border-white/10 md:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center hover:opacity-80 transition-opacity"
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
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewChat}
                      className="hover:bg-white/10 rounded-xl h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/10 rounded-xl h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                {chatSessions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-gray-400 h-full flex flex-col items-center justify-center space-y-3"
                  >
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                    <p className="text-xs mt-1">Start a conversation to see your chat history</p>
                  </motion.div>
                ) : (
                  <>
                    {renderChatSection(todayChats, "Today")}
                    {renderChatSection(yesterdayChats, "Yesterday")}
                    {renderChatSection(last7DaysChats, "Last 7 Days")}
                    {renderChatSection(olderChats, "Earlier")}
                  </>
                )}
              </div>
              <div className="border-t border-white/10 p-4">
                <div className="relative">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={isAuthenticated ? () => setShowProfile(!showProfile) : handleNewChat}
                      className={`w-full ${
                        isAuthenticated
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          : "bg-white text-black hover:bg-gray-200"
                      } transition-all duration-300 rounded-xl h-12 text-base`}
                    >
                      {isAuthenticated ? (
                        <>
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          New Chat
                        </>
                      )}
                    </Button>
                  </motion.div>
                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfile && isAuthenticated && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-50"
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
